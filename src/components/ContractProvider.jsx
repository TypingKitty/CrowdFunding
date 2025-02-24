import CampaignFactoryABI from './CampaignFactory.json';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';
import React ,{ createContext, useContext} from 'react'
import Campaign from './Campaign.json';

const ContractContext = createContext();



export function ContractProvider({children}) {

    const {signer}  = useWallet();
    const campaignFactoryAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const campaignFactoryABI = CampaignFactoryABI.abi;
    const campaignABI = Campaign.abi;
const campaignFactory = new ethers.Contract(campaignFactoryAddress,campaignFactoryABI , signer);
    
  return (
    <ContractContext.Provider value={{campaignFactory,campaignFactoryAddress,campaignABI,campaignFactoryABI}}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContract() {
    return useContext(ContractContext);
  }