import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DonateModal from './DonateModel';
import ReleaseRequestModal from './ReleaseRequestModal'; // Import the ReleaseRequestModal component
import { useContract } from './ContractProvider';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';

const CampaignDetails = () => {
  const { id } = useParams();
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isReleaseRequestModalOpen, setIsReleaseRequestModalOpen] = useState(false); // State for the release request modal
  const [isProcessing, setIsProcessing] = useState(false);
  const { campaignFactory, campaignABI } = useContract();
  const { signer, account } = useWallet();
  const [campaign, setCampaign] = useState(null);
  const [campaignContract, setCampaignContract] = useState(null);

  const getDetails = async () => {
    try {
      if (!signer || !campaignFactory) {
        console.log("Waiting for signer and campaignFactory...");
        return;
      }
      const myCampaigns = await campaignFactory.getAllCampaigns();
      const contract = new ethers.Contract(myCampaigns[id], campaignABI, signer);
      setCampaignContract(contract);
      const title = await contract.name();
      const description = await contract.description();
      const bannerImageURL = await contract.pic();
      const goal = (await contract.goal()).toString();
      const durationInDays = (await contract.durationindays()).toString();
      const state = await contract.status();
      const currentFundsRaised = (await contract.fundRaised()).toString();
      const fundsReleased = (BigInt(currentFundsRaised) - BigInt(await contract.getBalance())).toString();
      const startDate = (await contract.startdate()).toString();
      const endDate = (BigInt(startDate) + BigInt(durationInDays) * BigInt(86400)).toString();
      const beneficiary = await contract.owner();
      const donors = await contract.getContributors();
      const releaseRequests = await Promise.all(
        Array.from({ length: Number(await contract.requestIndex()) }, async (_, i) =>
          contract.getWithdrawRequest(i)
        )
      );
      console.log(releaseRequests);
      setCampaign({
        title,
        description,
        bannerImageURL,
        goal,
        durationInDays,
        state,
        currentFundsRaised,
        fundsReleased,
        startDate,
        endDate,
        beneficiary,
        donors,
        releaseRequests
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  useEffect(() => {
    if (signer && campaignFactory) {
      getDetails();
    }
  }, [signer, campaignFactory]);

  if (!campaign) {
    return <div>Loading...</div>;
  }

  const isActiveAndNotGoalReached = campaign.state === BigInt(0) && BigInt(campaign.currentFundsRaised) < BigInt(campaign.goal);
  const isNotBeneficiary = campaign.beneficiary.toLowerCase() !== account.toLowerCase();

  const containerStyle = {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    minHeight: '100vh'
  };

  const bannerStyle = {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginTop: '1.5rem'
  };

  const descriptionStyle = {
    color: '#4b5563',
    fontSize: '1.125rem',
    lineHeight: '1.75',
    marginTop: '1rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    marginTop: '2rem',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem'
  };

  const statCardStyle = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  };

  const requestsContainerStyle = {
    marginTop: '2rem',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.75rem'
  };

  const requestCardStyle = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const buttonStyle = {
    padding: '0.75rem 2rem',
    borderRadius: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none'
  };

  const donateButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#10b981',
    color: 'white',
    marginTop: '2rem',
    '&:hover': {
      backgroundColor: '#059669'
    }
  };

  const voteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1.5rem',
    '&:hover': {
      backgroundColor: '#2563eb'
    }
  };

  const handleDonate = async (amount) => {
    if (!signer) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      const tx = await campaignContract.fund({
        value: amount // Convert the amount to wei
      });
      await tx.wait();
      alert('Donation successful!');
      setIsDonateModalOpen(false);
      // You might want to refresh the campaign data here
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateReleaseRequest = async (amount, proof) => {
    if (!signer) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      const tx = await campaignContract.createWithdrawRequest(amount, proof);
      await tx.wait();
      alert('Release request created successfully!');
      setIsReleaseRequestModalOpen(false);
      // You might want to refresh the campaign data here
    } catch (error) {
      console.error('Release request creation failed:', error);
      alert('Release request creation failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={containerStyle}>
      <img src={campaign.bannerImageURL} alt={campaign.title} style={bannerStyle} />
      
      <div style={titleStyle}>{campaign.title}</div>
      <div style={descriptionStyle}>{campaign.description}</div>

      <div style={gridStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Goal Amount</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{campaign.goal} ETH</div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Funds Raised</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{campaign.currentFundsRaised} ETH</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Funds Released</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{campaign.fundsReleased} ETH</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Start Date</div>
          <div style={{ fontSize: '1.125rem', color: '#1f2937' }}>
            {new Date(Number(campaign.startDate) * 1000).toLocaleDateString()}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>End Date</div>
          <div style={{ fontSize: '1.125rem', color: '#1f2937' }}>
            {new Date(Number(campaign.endDate) * 1000).toLocaleDateString()}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Creator's Wallet</div>
          <div style={{ fontSize: '1rem', color: '#1f2937', wordBreak: 'break-all' }}>{campaign.beneficiary}</div>
        </div>
      </div>

      {campaign.donors.includes(account) && (
        <div style={requestsContainerStyle}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Fund Release Requests</h2>
          {campaign.releaseRequests.map((request, index) => (
            <div key={index} style={requestCardStyle}>
              <div>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Amount: {request.amount} ETH</div>
                <div style={{ color: '#6b7280' }}>Proof: {request.proofOfUsage}</div>
                <div style={{ 
                  color: request.status === 'Pending' ? '#eab308' : '#10b981',
                  fontWeight: '500',
                  marginTop: '0.5rem'
                }}>
                  Status: {request.status}
                </div>
              </div>
              {request.status === "Pending" && (
                <button style={voteButtonStyle}>Vote</button>
              )}
            </div>
          ))}
        </div>
      )}

      {isNotBeneficiary && isActiveAndNotGoalReached && (
        <div style={{ 
          textAlign: 'center',
          marginTop: '2rem',
          position: 'relative'
        }}>
          <button 
            onClick={() => setIsDonateModalOpen(true)}
            disabled={isProcessing}
            style={{
              background: 'linear-gradient(to right, #3949ab, #1e88e5)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isProcessing ? 0.7 : 1,
              transform: 'scale(1)',
              '&:hover': {
                transform: isProcessing ? 'scale(1)' : 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            {isProcessing ? 'Processing...' : 'Donate Now'}
          </button>
        </div>
      )}

      {!isNotBeneficiary && (
        <div style={{ 
          textAlign: 'center',
          marginTop: '2rem',
          position: 'relative'
        }}>
          <button 
            onClick={() => setIsReleaseRequestModalOpen(true)}
            disabled={isProcessing}
            style={{
              background: 'linear-gradient(to right, #ff9800, #ff5722)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isProcessing ? 0.7 : 1,
              transform: 'scale(1)',
              '&:hover': {
                transform: isProcessing ? 'scale(1)' : 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            {isProcessing ? 'Processing...' : 'Create Request'}
          </button>
        </div>
      )}

      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => !isProcessing && setIsDonateModalOpen(false)}
        onDonate={handleDonate}
        campaignTitle={campaign?.title}
        isProcessing={isProcessing}
      />

      <ReleaseRequestModal
        isOpen={isReleaseRequestModalOpen}
        onClose={() => !isProcessing && setIsReleaseRequestModalOpen(false)}
        onCreate={handleCreateReleaseRequest}
        campaignTitle={campaign?.title}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default CampaignDetails;