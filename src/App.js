import React, { useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
     * First make sure we have access to the Ethereum object.
     */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);

  const contractAddress = "0xC7539db1891C478c05A93E81ED903dE7aff9E3e3";
  const contractABI = abi.abi;

  /*
   * The passed callback function will be run when the page loads.
   * More technically, when the App component "mounts".
   */

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waveTxn = await wavePortalContract.wave("testing wave");
        console.log("Mining...", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        /*
         * Execute the actual wave from your smart contract
         */
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = React.useCallback(async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("No wallet detected. Get MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found.");
      }
    } catch (error) {
      console.log(error);
    }
  }, [getAllWaves]);

  useEffect(() => {
    getAllWaves();
  }, [getAllWaves]);

  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
  }, []);
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          I am Farza and I worked on self-driving cars so that's pretty cool
          right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
