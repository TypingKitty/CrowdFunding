import React, { useEffect, useState } from "react";
import { useContract } from "./ContractProvider";
import { ethers } from "ethers";
import { useWallet } from "./WalletProvider";
import CampaignCard from "./CampaignCard";

function Campaigns({ type }) {
  const { campaignFactory, campaignABI } = useContract();
  const { signer } = useWallet();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      if (!signer || !campaignFactory) {
        console.log("Waiting for signer and campaignFactory...");
        return;
      }

      console.log(signer, "Signer is available.");
      const campaignAddresses =
        type === "my"
          ? await campaignFactory.getMyCampaigns()
          : await campaignFactory.getAllCampaigns();
      console.log(campaignAddresses, "Fetched campaigns.");

      const fetchedCampaigns = await Promise.all(
        campaignAddresses.map(async (campaignAddress, key) => {
          const campaign = new ethers.Contract(
            campaignAddress,
            campaignABI,
            signer
          );
          let [
            title,
            description,
            goal,
            bannerImageURL,
            state,
            durationInDays,
            currentFundsRaised,
            geners
          ] = await campaign.getCampaignCard();
          geners = geners.split(",");
          const date = new Date(Number(durationInDays) * 1000);
          if (date < new Date() && state === BigInt(0)) {
            state = BigInt(2);
          }
          let stateText;
          switch (state) {
            case BigInt(0):
              stateText = "Open";
              break;
            case BigInt(1):
              stateText = "Completed";
              break;
            case BigInt(2):
              stateText = "Expired";
              break;
            case BigInt(3):
              stateText = "Ended";
              break;
            default:
              stateText = "Unknown";
          }
          console.log(stateText, title);
          return {
            id: key,
            title,
            description,
            bannerImageURL,
            goal,
            durationInDays,
            state: stateText,
            currentFundsRaised,
          };
        })
      );

      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signer && campaignFactory) {
      fetchCampaigns();
    }
  }, [signer, campaignFactory, type]); // Re-run when `type` changes

  return (
    <div className="px-6 py-8 mt-16 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
        {type === "my" ? "My Campaigns" : "All Campaigns"}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">
            No campaigns found. {type === "my" && "Start a campaign to see it here!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Campaigns;