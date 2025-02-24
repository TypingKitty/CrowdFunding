import React, { useState } from 'react';

const DonateModal = ({ isOpen, onClose, onDonate, campaignTitle }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onDonate(amount);
    setAmount('');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .donate-modal-button {
            background: linear-gradient(to right, #3949ab, #1e88e5);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .donate-modal-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .donate-modal-button.cancel {
            background: #9ca3af;
          }
        `}
      </style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          width: '90%',
          maxWidth: '400px'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Donate to {campaignTitle}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in ETH"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: '0.5rem',
                border: '2px solid #e5e7eb'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="submit" className="donate-modal-button">
                Donate
              </button>
              <button
                type="button"
                onClick={onClose}
                className="donate-modal-button cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DonateModal;