// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.28;

import {Campaign} from "./Campaign.sol";
contract CampaignFactory{
    Campaign[]  campaigns;
    mapping(address=>Campaign[])  mappedCampaigns;
    function createCampaign(string memory _name , string memory _description , string memory _pic , uint256 _goal , uint256 _durationindays, string memory _genres) external
    {
        Campaign campaign = new Campaign( _name ,  _description ,  _pic ,  _goal ,  _durationindays,  _genres,msg.sender);
        campaigns.push(campaign);
        mappedCampaigns[msg.sender].push(campaign);
    }
    function getAllCampaigns() external view returns(Campaign[] memory){
        return campaigns;
    }
    function getMyCampaigns() external view returns(Campaign[] memory)
    {
        return mappedCampaigns[msg.sender];
    }
}