import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DonateModal from './DonateModel';
import ReleaseRequestModal from './ReleaseRequestModal'; // Import the ReleaseRequestModal component
import { useContract } from './ContractProvider';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';
import Requests from './Requests';
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
      
      var [title , description , bannerImageURL , goal , state , durationInDays , currentFundsRaised , startDate , donors ,beneficiary ] = await contract.getCampaignDetalis1();
      var [donations , requestsStatus , requestsAmt , requestsProof] = await contract.getCampaignDetails2();

      
      if(new Date(Number(durationInDays)*1000) < new Date() && state == 0) {
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
      const updatedRequestsStatus = requestsStatus.map((status) => {
        if (status == 0) {
          return "Accepted";
        } else if (status == 1) {
          return "Rejected";
        } else {
          return "Pending";
        }
      });
      setCampaign({
        title,
        description,
        bannerImageURL,
        goal: Number(goal),
        durationInDays: new Date(Number(durationInDays) * 1000).toLocaleDateString(),
        state,
        currentFundsRaised: Number(currentFundsRaised),
        startDate: new Date(Number(startDate) * 1000).toLocaleDateString(),
        donors,
        beneficiary,
        requestsStatus:updatedRequestsStatus,
        requestsAmt,
        requestsProof,
        donations //add fundReleased field
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

  
  const isNotBeneficiary = campaign.beneficiary.toLowerCase() !== account.toLowerCase();
  const isContributor = campaign.donors.some(donor => donor.toLowerCase() == account.toLowerCase());
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
      const tx = await campaignContract.fund(account,{
        value: amount
      });
      await tx.wait();
      alert('Donation successful!');
      setIsDonateModalOpen(false);
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
      const tx = await campaignContract.createWithdrawRequest(amount, proof,account);
      await tx.wait();
      alert('Release request created successfully!');
      setIsReleaseRequestModalOpen(false);
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
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{campaign.goal} Wei</div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Funds Raised</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{campaign.currentFundsRaised} Wei</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Funds Released</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{campaign.fundsReleased} Wei</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Start Date</div>
          <div style={{ fontSize: '1.125rem', color: '#1f2937' }}>
            {campaign.startDate}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>End Date</div>
          <div style={{ fontSize: '1.125rem', color: '#1f2937' }}>
            {campaign.durationInDays}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Creator's Wallet</div>
          <div style={{ fontSize: '1rem', color: '#1f2937', wordBreak: 'break-all' }}>{campaign.beneficiary}</div>
        </div>
      </div>
      {
      campaign.donors.some(donor => donor.toLowerCase === account.toLowerCase) && (
        <Requests isContributor={isContributor} account={account} campaignContract={campaignContract} status={campaign.requestsStatus} proof={campaign.requestsProof} amt={campaign.requestsAmt} hasVoted setHasVoted />
      )}

      {isNotBeneficiary && campaign.state == "Open" && (
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