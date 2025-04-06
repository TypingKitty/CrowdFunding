import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletProvider";
import { Link } from "react-router-dom";
import { useContract } from "@/components/ContractProvider";
import { formatEther } from "ethers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DropdownMenuWithIcon from "./dropdown-menu-02";

export default function Header() {
  const { account, connectWallet, provider,upload } = useWallet();
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goal: "",
    currentFundsRaised: 0,
    startDate: new Date().toLocaleDateString(),
    endDate: "",
    bannerImageURL: "",
    state: "Active",
    genres: [],
  });

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [balance, setBalance] = useState(null);

  const { campaignFactory } = useContract();

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && provider) {
        const b = await provider.getBalance(account);
        setBalance(formatEther(b, 18));
      }
    };
    fetchBalance();
  }, [account, provider]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreChange = (genre) => {
    if (genre && !selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
      setNewCampaign((prev) => ({
        ...prev,
        genres: [...prev.genres, genre],
      }));
    }
  };

  const removeGenre = (genre) => {
    const updatedGenres = selectedGenres.filter((g) => g !== genre);
    setSelectedGenres(updatedGenres);
    setNewCampaign((prev) => ({
      ...prev,
      genres: updatedGenres,
    }));
  };
  const handleFileChange = (e) => {
    setNewCampaign((prev) => ({
      ...prev,
      bannerImageURL: e.target.files[0],
    }));
  }
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    const ipfsUrl = await upload(newCampaign.bannerImageURL);
    console.log(ipfsUrl, "IPFS URL");
    
    const tx = await campaignFactory.createCampaign(
      newCampaign.title,
      newCampaign.description,
      ipfsUrl,
      newCampaign.goal,
      newCampaign.endDate * 86400,
      newCampaign.genres.join(","),
      { sender: account }
    );

    await tx.wait();
    setNewCampaign({
      title: "",
      description: "",
      goal: "",
      endDate: "",
      bannerImageURL: "",
      genres: [],
    });
    setSelectedGenres([]);
  };

  return (
    <header className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 fixed top-0 left-0 right-0 z-50 shadow-lg">
      {/* Logo */}
      <Link to="/" className="text-3xl font-bold hover:opacity-90 transition">
        FundIt
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-8">
        <Link
          to="/my-campaigns"
          className="text-white font-medium hover:bg-white hover:text-indigo-600 px-4 py-2 rounded-lg transition"
        >
          My Campaigns
        </Link>

        {/* Create Campaign Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-white text-indigo-600 hover:bg-gray-100">
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-indigo-600">Create Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <Input
                type="text"
                name="title"
                placeholder="Campaign Title"
                value={newCampaign.title}
                onChange={handleInputChange}
                className="border-gray-300 focus:ring-indigo-500"
              />
              <Input
                type="file"
                name="bannerImageURL"
                placeholder="Banner Image URL"
                onChange={handleFileChange}
                className="border-gray-300 focus:ring-indigo-500"
              />
              <Textarea
                name="description"
                placeholder="Campaign Description"
                value={newCampaign.description}
                onChange={handleInputChange}
                className="border-gray-300 focus:ring-indigo-500"
              />
              <Input
                type="number"
                name="goal"
                placeholder="Goal Amount (Wei)"
                value={newCampaign.goal}
                onChange={handleInputChange}
                className="border-gray-300 focus:ring-indigo-500"
              />
              <Input
                type="number"
                name="endDate"
                placeholder="End Date (in days)"
                value={newCampaign.endDate}
                onChange={handleInputChange}
                className="border-gray-300 focus:ring-indigo-500"
              />
              <div>
                <label className="block mb-2 font-medium text-gray-700">Genres</label>
                <Select onValueChange={handleGenreChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedGenres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-indigo-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {genre}
                      <button
                        onClick={() => removeGenre(genre)}
                        className="text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setNewCampaign((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Wallet Connection */}
        {!account && <Button
          onClick={connectWallet}
          variant="outline"
          className="bg-white text-indigo-600 hover:bg-gray-100"
        > Connect Wallet
        </Button>
    } 
        {/* Balance Display */}
        {account && (
          <span className="text-white font-medium">
            Balance: {balance} ETH
          </span>
        )}
        {account && DropdownMenuWithIcon(account,balance)}
      </nav>
    </header>
  );
}