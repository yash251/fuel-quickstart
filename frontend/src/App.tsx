import { useEffect, useState } from "react";
import "./App.css";
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { CounterContractAbi__factory } from "./contracts";
 
// The address of the contract deployed the Fuel testnet
const CONTRACT_ID =
  "0xa0f2b97f32300d7360b5632e682c1508b326da9a00fbe755646d3809aec90672";
 
function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string>("");
  const [counter, setCounter] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
 
  useEffect(() => {
    setTimeout(() => {
      checkConnection();
      setLoaded(true);
    }, 200)
    if (connected) getCount();
  }, [connected, getCount])
 
  async function connect() {
    if (window.fuel) {
      try {
        await window.fuel.connect();
        const [account] = await window.fuel.accounts();
        setAccount(account);
        setConnected(true);
      } catch (err) {
        console.log("error connecting: ", err);
      }
    }
  }
 
  async function checkConnection() {
    if (window.fuel) {
      const isConnected = await window.fuel.isConnected();
      if (isConnected) {
        const [account] = await window.fuel.accounts();
        setAccount(account);
        setConnected(true);
      }
    }
  }
 
  async function getCount() {
    if (window.fuel) {
      const wallet = await window.fuel.getWallet(account);
      const contract = CounterContractAbi__factory.connect(CONTRACT_ID, wallet);
      const { value } = await contract.functions.count().simulate();
      setCounter(value.toNumber());
    }
  }
 
  async function increment() {
  if (window.fuel) {
    const wallet = await window.fuel.getWallet(account);
    const contract = CounterContractAbi__factory.connect(CONTRACT_ID, wallet);

    // Get the current gas price from Fuel
    const gasPrice = await window.fuel.getGasPrice();

    // Specify the amount of coins to send with the transaction
    const value = 1;
   
    // Create a transaction to call the increment function
    try {
      await contract.functions.increment().txParams({
        gasPrice: gasPrice.toNumber(),
        value: value, // Specify the amount of coins to send with the transaction
      }).call();
      getCount();
    } catch (err) {
      console.log("error sending transaction...", err);
    }
  }
}
 
  if (!loaded) return null
 
  return (
    <>
      <div className="App">
        {
          connected ? (
            <>
              <h3>Counter: {counter}</h3>
              <button style={buttonStyle} onClick={increment}>
                Increment
              </button>
            </>
          ) : (
            <button style={buttonStyle} onClick={connect}>Connect</button>
          )
        }
      </div>
    </>
  );
}
 
export default App;
 
const buttonStyle = {
  borderRadius: "48px",
  marginTop: "10px",
  backgroundColor: "#03ffc8",
  fontSize: "20px",
  fontWeight: "600",
  color: "rgba(0, 0, 0, .88)",
  border: "none",
  outline: "none",
  height: "60px",
  width: "400px",
  cursor: "pointer"
}
