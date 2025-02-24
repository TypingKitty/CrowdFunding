import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletProvider";
import { Link } from 'react-router-dom';
import { useContract } from "@/components/ContractProvider";
import {ethers} from 'ethers';
export default function Header() {
  const { account, connectWallet, provider } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    goal: '',
    currentFundsRaised: 0,
    startDate: new Date().toLocaleDateString(),
    endDate: '',
    bannerImageURL: '',
    state: 'Active',
    genres: [] // Add genres field
  });

  const [selectedGenres, setSelectedGenres] = useState([]); // Track selected genres
  const [balance, setBalance] = useState(null); // State to store the balance

  const print = (e) => {
    e.preventDefault();
    console.log("name: ", newCampaign.title);
    console.log("description: ", newCampaign.description);
    console.log("pic: ", newCampaign.bannerImageURL);
    console.log("goal: ", newCampaign.goal);
    console.log("durationInDays: ", newCampaign.endDate);
    console.log("selectedGenres: ", newCampaign.genres.join(','));
  }

  const { campaignFactory } = useContract();

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && provider) {
        const balance = await provider.getBalance(account);
        setBalance((balance));
      }
    };
    fetchBalance();
  }, [account, provider]);

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(to right, #1a237e, #1565c0)',
    color: 'white',
    padding: '1rem 4rem',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: '70px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const navStyle = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6'
    }
  };

  const modalStyle = {
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
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '1rem',
    width: '90%',
    maxWidth: '600px',
    color: '#1f2937',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  const modalButtonStyle = {
    background: 'white',
    color: '#1565c0',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreChange = (e) => {
    const selectedGenre = e.target.value;
    if (selectedGenre && !selectedGenres.includes(selectedGenre)) {
      setSelectedGenres([...selectedGenres, selectedGenre]);
      setNewCampaign(prev => ({
        ...prev,
        genres: [...prev.genres, selectedGenre]
      }));
    }
  };

  const removeGenre = (genre) => {
    const updatedGenres = selectedGenres.filter(g => g !== genre);
    setSelectedGenres(updatedGenres);
    setNewCampaign(prev => ({
      ...prev,
      genres: updatedGenres
    }));
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    // Handle campaign creation
    const tx = await campaignFactory.createCampaign(
      newCampaign.title,
      newCampaign.description,
      newCampaign.bannerImageURL,
      newCampaign.goal,
      newCampaign.endDate,
      newCampaign.genres.join(','),
      {sender: account}
    );
    
    await tx.wait();

    console.log("Campaign created successfully");
    setIsDialogOpen(false);
    setNewCampaign({
      title: '',
      description: '',
      goal: '',
      endDate: '',
      bannerImageURL: '',
      genres: []
    });
    setSelectedGenres([]);
  };

  return (
    <>
      <style>
        {`
          .logo-link {
            text-decoration: none;
            color: white;
            font-size: 2rem;
            font-weight: bold;
            transition: transform 0.2s ease, opacity 0.2s ease;
          }
          .logo-link:hover {
            opacity: 0.9;
            transform: scale(1.02);
          }
          
          .nav-link {
            text-decoration: none;
            color: white;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.2s ease;
          }
          .nav-link:hover {
            background-color: rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
          }
          
          .header-button {
            background: white;
            color: #1565c0;
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
          }
          .header-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: #f8fafc;
          }
          .header-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
          
          .balance-display {
            margin-left: 1rem;
            color: white;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: all 0.2s ease;
          }
          .balance-display:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .modal-button {
            background: white;
            color: #1565c0;
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
          }
          .modal-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            background: #f8fafc;
          }
          .modal-button.cancel {
            background-color: #9ca3af;
            color: white;
          }
          .modal-button.cancel:hover {
            background-color: #858b94;
          }

          .genre-tag {
            display: inline-flex;
            align-items: center;
            background-color: #3b82f6;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
          .genre-tag button {
            background: none;
            border: none;
            color: white;
            margin-left: 0.5rem;
            cursor: pointer;
          }
        `}
      </style>

      <header style={headerStyle}>
        <Link to="/" className="logo-link">
          FundIt
        </Link>

        <nav style={navStyle}>
          <Link to="/my-campaigns" className="nav-link">
            My Campaigns
          </Link>
          <button 
            onClick={() => setIsDialogOpen(true)} 
            className="header-button"
          >
            Create Campaign
          </button>
          <button 
            onClick={connectWallet} 
            className="header-button"
          >
            {account ? `Connected: ${account?.slice(0, 6)}...` : 'Connect Wallet'}
          </button>
          {account && (
            <span className="balance-display">
              Balance: {balance} ETH
            </span>
          )}
        </nav>

        {isDialogOpen && (
          <div style={modalStyle}>
            <div style={modalContentStyle}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Create Campaign</h2>
              <form onSubmit={handleCreateCampaign}>
                <input
                  type="text"
                  name="title"
                  placeholder="Campaign Title"
                  value={newCampaign.title}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                <input
                  type="text"
                  name="bannerImageURL"
                  placeholder="Banner Image URL"
                  value={newCampaign.bannerImageURL}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                <textarea
                  name="description"
                  placeholder="Campaign Description"
                  value={newCampaign.description}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, height: '100px' }}
                />
                <input
                  type="number"
                  name="goal"
                  placeholder="Goal Amount (ETH)"
                  value={newCampaign.goal}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                <input
                  type="number"
                  name="endDate"
                  value={newCampaign.endDate}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {/* Genres Dropdown */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="genres" style={{ display: 'block', marginBottom: '0.5rem' }}>Genres</label>
                  <select
                    id="genres"
                    onChange={handleGenreChange}
                    style={inputStyle}
                  >
                    <option value="">Select a genre</option>
                    <option value="Technology">Technology</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Education">Education</option>
                  </select>
                  <div style={{ marginTop: '0.5rem' }}>
                    {selectedGenres.map((genre, index) => (
                      <span key={index} className="genre-tag">
                        {genre}
                        <button onClick={() => removeGenre(genre)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="submit" 
                    className="modal-button"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="modal-button cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </header>
    </>
  );
};