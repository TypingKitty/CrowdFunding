import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from 'axios';

const WalletContext = createContext(); // Create the context

export function useWallet() { // Export a custom hook for consuming the context
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Function to disconnect the wallet (reset state)
  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };
 const upload=async(file) =>{
  const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxContentLength: Infinity,
          headers: {
            Authorization : `Bearer ${import.meta.env.VITE_PIN_JWT}`,
          },
        }
      );
      console.log(import.meta.env.VITE_PIN_KEY);
      const cid = res.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
      return url;
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed.");
    }
 }
  // Function to connect the wallet on demand
  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("No Ethereum provider found");
      return;
    }
    try {
        const prov = new ethers.BrowserProvider(window.ethereum);  // Request account access
        const sign = await prov.getSigner();
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setProvider(prov);
        setSigner(sign);
        setAccount(accounts[0]);
        
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  const votingStatus = ( s)=>{
    if(s ==0 ) return "Accepted";
    else if(s == 1) return "Rejected";
    else return "Not Voted";
  }
  // Check if already connected when the component mounts
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const prov = new ethers.BrowserProvider(window.ethereum);
          const sign = await prov.getSigner();
          setProvider(prov);
          setSigner(sign);
          setAccount(accounts[0]);
          console.log(prov,sign,accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) { // if no accounts are connected , change the states to null
          disconnect();
        } else {
          setAccount(accounts[0]); // if multiple acc connected , set latest connected
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{upload,votingStatus, account, provider, signer, connectWallet}}>
      {children}
    </WalletContext.Provider>
  );
}
