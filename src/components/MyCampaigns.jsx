import React, { useEffect, useState } from 'react';
import { useContract } from './ContractProvider';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';
import CampaignCard from './CampaignCard';

const containerStyle = {
  padding: '2rem',
  marginTop: '100px',
  minHeight: 'calc(100vh - 80px)',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: 'white',
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#1565c0',
  marginBottom: '2rem',
  textAlign: 'center',
  maxWidth: '1400px',
  margin: '0 auto 2rem auto',
  padding: '0 1rem',
};

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '1rem',
};

function MyCampaigns() {
  const { campaignFactory, campaignABI } = useContract();
  const { signer } = useWallet();
  const [sampleCampaigns, setSampleCampaigns] = useState([]);

  const getAllCampaigns = async () => {
    try {
      if (!signer || !campaignFactory) {
        console.log("Waiting for signer and campaignFactory...");
        return;
      }

      console.log(signer, "Signer is available.");
      const myCampaigns = await campaignFactory.getMyCampaigns();
      console.log(myCampaigns, "Fetched campaigns.");

      const campaigns = await Promise.all(
        myCampaigns.map(async (campaignAddress, key) => {
           const campaign = new ethers.Contract(campaignAddress, campaignABI, signer);
          var [title , description ,goal , bannerImageURL, state , durationInDays , currentFundsRaised] = await campaign.getCampaignCard();
          
          const date = new Date(Number(durationInDays) *1000);
          console.log(date < new Date());
          if(date < new Date() && state == 0) {
            state = BigInt(2);
          }
          switch(state) {
            case BigInt(0) : state = "Open";
            break;
            case BigInt(1) : state = "Completed";
            break;
            case BigInt(2) : state = "Expired";
            break;
            case BigInt(3) : state = "Ended";
            break;
          }
          //console.log(title , description ,goal , bannerImageURL, state , durationInDays , currentFundsRaised);  
          return { id: key, title, description, bannerImageURL, goal, durationInDays, state, currentFundsRaised};
        })
      );

      setSampleCampaigns(campaigns);
      
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // 🚀 Fetch campaigns only when `signer` and `campaignFactory` are ready
  useEffect(() => {
    if (signer && campaignFactory) {
      getAllCampaigns();
    }
  }, [signer, campaignFactory]); // Ensure it re-runs when signer and campaignFactory become available

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Active Campaigns</h1>
      <div style={cardGridStyle}>
        {sampleCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

export default MyCampaigns;
