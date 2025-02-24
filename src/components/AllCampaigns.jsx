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

const cardStyle = {
  maxWidth: '400px', // Set the maximum width for the cards
  margin: '0 auto', // Center the cards within their grid cells
};

function AllCampaigns() {
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
      const myCampaigns = await campaignFactory.getAllCampaigns();
      console.log(myCampaigns, "Fetched campaigns.");

      const campaigns = await Promise.all(
        myCampaigns.map(async (campaignAddress, key) => {
          const campaign = new ethers.Contract(campaignAddress, campaignABI, signer);
          
          // Ensure functions exist in your smart contract before calling them
          const title = await campaign.name();
          const description = await campaign.description();
          const bannerImageURL = await campaign.pic();
          const goal = await campaign.goal();
          const durationInDays = await campaign.durationindays();
          const state = await campaign.status();
          const currentFundsRaised = await campaign.fundRaised();
          return { id: key, title, description, bannerImageURL, goal, durationInDays, state, currentFundsRaised };
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
          <div key={campaign.id} style={cardStyle}>
            <CampaignCard campaign={campaign} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllCampaigns;