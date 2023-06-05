const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ID = 1
const NAME = "Shoes"
const CATEGORY = "Clothing"
const IMAGE = "https://cloudflare-ipfs.com/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg" 
const COST = tokens(1)
const RATING = 4
const STOCK = 5

describe("Dappcom", () => {

  let dappcom
  let deployer, buyer

  beforeEach(async () => {
    //setup accounts
    [deployer, buyer] = await ethers.getSigners()

    //deploy contract
    const dappcom = await ethers.getContractFactory("Dappcom")
    dappcom = await Dappcom.deploy()
  })

describe("Deployment", () => {
  it('sets the owner', async () => {
    const owner = await dappcom.owner()
    expect(owner).to.equal(deployer.address)
  })
})
describe("Listing", () => {
   let transaction

  beforeEach(async () => {
    transaction = await dappcom.connect(deployer).list(
      ID,
      NAME,
      CATEGORY,
      IMAGE,
      COST,
      RATING,
      STOCK
    )
 
    await transaction.wait()
 })

  it('Returns items attributes', async () => {
    const item = await dappcom.items(1)

    expect(item.id).to.equal(ID)
    expect(item.name).to.equal(NAME)
    expect(item.category).to.equal(CATEGORY)
    expect(item.image).to.equal(IMAGE)
    expect(item.cost).to.equal(COST)
    expect(item.rating).to.equal(RATING)
    expect(item.stock).to.equal(STOCK)
  })

  it("Emits List event", () => {
    expect(transaction).to.emit(dappcom, "List")
  })
})
describe("Buying", () =>{
  let transaction

  beforeEach(async () => {
    //list an item
    transaction = await dappcom.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
    await transaction.wait()

    //buy an item
    transaction = await dappcom.connect(buyer).buy(ID, { value: COST })
    await transaction.wait()
 })

    

    it("Updates buyer's order count", async() => {
      const result = await dappcom.orderCount(buyer.address)
      expect(result).to.equal(1)
    })

    it("adds the order", async() => {
      const order = await dappcom.orders(buyer.address, 1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })

    it("Updates the contract balance", async() => {
      const result = await ethers.provider.getBalance(dappcom.address)
      expect(result).to.equal(COST)
    })

    it("emits buy event", async() => {
      expect(transaction).to.emit(dappcom, "Buy")
    })

})

describe("Withdrawing", () => {
  let balanceBefore

  beforeEach(async () => {
    // List a item
    let transaction = await dappcom.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
    await transaction.wait()

    // Buy a item
    transaction = await dappcom.connect(buyer).buy(ID, { value: COST })
    await transaction.wait()

    // Get Deployer balance before
    balanceBefore = await ethers.provider.getBalance(deployer.address)

    // Withdraw
    transaction = await dappcom.connect(deployer).withdraw()
    await transaction.wait()
  })

  it('Updates the owner balance', async () => {
    const balanceAfter = await ethers.provider.getBalance(deployer.address)
    expect(balanceAfter).to.be.greaterThan(balanceBefore)
  })

  it('Updates the contract balance', async () => {
    const result = await ethers.provider.getBalance(dappcom.address)
    expect(result).to.equal(0)
  })
})
})
