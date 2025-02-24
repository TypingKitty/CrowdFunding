import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CampaignCard = ({ campaign }) => {
  const [imageError, setImageError] = useState(false);

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  };

  const imageContainerStyle = {
    position: 'relative',
    overflow: 'hidden',
    height: '200px',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: '#e5e7eb',
    transition: 'transform 0.3s ease-in-out',
  };

  const viewButtonStyle = {
    position: 'absolute',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: 'linear-gradient(to right, #3949ab, #1e88e5)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: '600',
    opacity: '0',
    transition: 'all 0.3s ease-in-out',
    pointerEvents: 'none',
  };

  console.log("inside card");

  return (
    <div style={{ position: 'relative' }} >
      <Link to={`/campaign/${campaign.id}`} state={{campaign}} style={{ textDecoration: 'none', height: '100%' }}>
        <div className="campaign-card" style={cardStyle}>
          <div style={imageContainerStyle}>
            <img 
              src={imageError ? 
                "https://placehold.co/600x400/e5e7eb/1f2937?text=Campaign+Image" : 
                campaign.bannerImageURL
              }
              alt={campaign.title}
              style={imageStyle}
              onError={() => setImageError(true)}
            />
          </div>
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ 
                  backgroundColor: campaign.state === 'Active' ? '#dcfce7' : '#fee2e2',
                  color: campaign.state === 'Active' ? '#166534' : '#991b1b',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {campaign.state}
                </span>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                {campaign.title}
              </h3>
              <p style={{ 
                color: '#6b7280',
                marginBottom: '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.5'
              }}>
                {campaign.description}
              </p>
            </div>
            <div>
              {/* Fixing BigInt Conversion */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: `${(Number(campaign.currentFundsRaised) / Number(campaign.goal)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease-in-out'
                }} />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: '#374151',
                fontSize: '0.875rem',
                marginBottom: '0.5rem'
              }}>
                <span>Raised: {Number(campaign.currentFundsRaised)} ETH</span>
                <span>Goal: {Number(campaign.goal)} ETH</span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Ends on {new Date(Number(campaign.endDate)).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="viewButton" style={viewButtonStyle}>
            View Campaign
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CampaignCard;
