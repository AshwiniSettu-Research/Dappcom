import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappcom from './abis/Dappcom.json'

// Config
import config from './config.json'

function App() {
  const[provider, setProvider] = useState(null)
  const[dappcom, setDappcom] = useState(null)
  const[account, setAccount] = useState(null)
  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)

  const[item, setItem] = useState({})
  const[toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }


  const loadBlockchainData = async () => {
    //connect to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    console.log(provider)
    const network = await provider.getNetwork()
    console.log(network)

    //connect to smart contracts
    const dappcom = new ethers.Contract(config[network.chainId].dappcom.address, Dappcom, provider)
    setDappcom(dappcom)

    //load products
    const items = []

    for (var i = 0; i < 9; i++) {
      const item = await dappcom.items(i + 1)
      items.push(item)
      //console.log(item)
    }
    
    const electronics = items.filter((item) => item.category === 'electronics')
    const clothing = items.filter((item) => item.category === 'clothing')
    const toys = items.filter((item) => item.category === 'toys')

    setElectronics(electronics)
    setClothing(clothing)
    setToys(toys)
  }

  useEffect(() =>{
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account ={account} setAccount={setAccount}/>

      <h2>Best sellers</h2>
       
      {electronics && clothing && toys && (
        <>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}
       {toggle && (
        <Product item={item} provider={provider} account={account} dappcom={dappcom} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
