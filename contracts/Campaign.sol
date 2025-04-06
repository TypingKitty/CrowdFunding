// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
contract Campaign {
    enum VotingStatus {Accepted, Rejected, Pending}
    enum CampaignStatus {Opened, Completed, Expired, Ended}

    struct withdrawRequest {
        uint256 date;
        VotingStatus status; // final result after voting
        mapping(address => VotingStatus) votingResult; // individual votes
        uint256 amt;
        string ipfsproofadd;
    } // withdraw requested by the owner of the campaign. The amount will be stored in the sc until then

    uint256 private goal;
    string private name;
    string private description;
    string private pic;
    uint256 private fundRaised;
    uint256 private durationindays;
    uint256 private startdate;
    uint256 private requestIndex;
    string private genres;

    address payable public owner; // address of the contract(decentralized) or wallet that creates the contract(crowd-contract)
    address[] public contributors;
    mapping(address => uint256) public contributions; // map to store address of a person with an int value
    withdrawRequest[] public requests;
    CampaignStatus private status;

    function getContributors() public view returns (address[] memory) {
        return contributors;
    }

    // working in remix
    function getWithdrawRequestInfo(uint _index) public view returns(address[] memory , uint[] memory,uint256,uint256,uint256,string memory)
    {
        
        uint[] memory res = new uint[](contributors.length);
        for(uint i=0;i<contributors.length;i++)
        res[i] = (uint(requests[_index].votingResult[contributors[i]]));
        return(contributors,res, requests[_index].amt , requests[_index].date , uint(requests[_index].status), requests[_index].ipfsproofadd);
    }
    function getWithdrawRequestVotingResult(uint256 _index, address _contributor) external view returns (uint8) {
        require(_index < requests.length, "Invalid request index");
        return uint8(requests[_index].votingResult[_contributor]);
    }

    modifier isCampaignOpen() {
        require(status == CampaignStatus.Opened, "This campaign can't accept donations");
        _;
    }

    modifier isValidTransaction() {
        require(msg.value <= goal - fundRaised, string.concat("Donations should be less than or equal to ", Strings.toString(goal - fundRaised)));
        require(msg.value != 0, "Invalid donation");
        _;
    }

    modifier isValidWithdrawRequest(uint _amt) {
        require(_amt <= address(this).balance, "Not enough funds available");
        for (uint256 i = 0; i < requestIndex; i++) {
            require(requests[i].status != VotingStatus.Pending, "There are pending withdrawal requests");
        }
        _;
    }


    constructor(string memory _name, string memory _description, string memory _pic, uint256 _goal, uint256 _durationindays, string memory _genres , address _owner) {
        owner = payable(_owner);
        name = _name;
        description = _description;
        pic = bytes(_pic).length > 0 ? _pic : "default"; // string type will be converted to address type automatically, so we don't need to specify it
        goal = _goal;
        fundRaised = 0; // initialise the money raised
        startdate = block.timestamp;
        durationindays = startdate + _durationindays;
        status = CampaignStatus.Opened;
        requestIndex = 0;
        genres = _genres;
    }

    function statusUpdate(uint8 _status) public {
        CampaignStatus statusEnum = CampaignStatus(_status);
        if (statusEnum == CampaignStatus.Ended) // only owner can end it early
        status = statusEnum;
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function check_contributor_exists(address _sender) view internal returns (bool) {
        bool flag = false;
        for (uint i = 0; i < contributors.length; i++) {
            if (contributors[i] == _sender) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    function fund(address sender) external payable isCampaignOpen isValidTransaction { // payment will be made in ETH
        if (check_contributor_exists(sender) == false) {
            contributors.push(sender);
        }
        contributions[sender] += msg.value;
        fundRaised += msg.value;
        if (fundRaised == goal) statusUpdate(uint8(CampaignStatus.Completed));
    }

    function createWithdrawRequest(uint256 _amt, string memory _ipfsProof,address sender) public  isValidWithdrawRequest(_amt) { // request for withdrawal by the owner
        require(payable(sender) == owner, "Only available for the owner");
        withdrawRequest storage request = requests.push();
        requestIndex++;
        console.log("hh");
        request.date = block.timestamp;
        request.status = VotingStatus.Pending;
        request.amt = _amt;
        request.ipfsproofadd = _ipfsProof;
        for (uint i = 0; i < contributors.length; i++) {
            request.votingResult[contributors[i]] = VotingStatus.Pending;
        }
    }

    function updateVotingStatus(uint _i) internal view returns (VotingStatus) {
        VotingStatus flag = VotingStatus.Accepted;
        int v = 0;
        for (uint i = 0; i < contributors.length; i++) {
            if (requests[_i].votingResult[contributors[i]] == VotingStatus.Pending) {
                return  VotingStatus.Pending;
            } else if (requests[_i].votingResult[contributors[i]] == VotingStatus.Accepted) v++;
            else v--;
        }
        if (v <= 0) flag = VotingStatus.Rejected;
        return flag;
    }

    function vote(uint8 _vote, uint256 _i , address sender) external { // _vote = 0 accepted, 1 = rejected
        require(requests[_i].status == VotingStatus.Pending, "Votes have been closed");
        require(requests[_i].votingResult[sender] == VotingStatus.Pending, "Already voted");
        require(contributions[sender] > 0, "Only contributors can vote");
        requests[_i].votingResult[sender] = VotingStatus(_vote);
        requests[_i].status = updateVotingStatus(_i);
        if (requests[_i].status == VotingStatus.Accepted) withdraw(_i);
    }

    function withdraw(uint256 _i) internal {
        owner.transfer(requests[_i].amt);
    }

    function refund() external { // called from frontend when some conditions are met
    uint contributorsCount = contributors.length;
    address[] memory contributorsCopy = new address[](contributorsCount);
    uint256[] memory refunds = new uint256[](contributorsCount);

    for (uint i = 0; i < contributorsCount; i++) {
        contributorsCopy[i] = contributors[i];
        refunds[i] = (contributions[contributors[i]] * address(this).balance) / fundRaised;
    }

    for (uint i = 0; i < contributorsCount; i++) {
        if (refunds[i] > 0) {
            payable(contributorsCopy[i]).transfer(refunds[i]);
            delete contributions[contributorsCopy[i]];
        }
    }

    delete contributors;
} //this one
   //return genres too 
    function getCampaignCard() external view returns(string memory , string memory , uint , string memory , uint , uint,uint,string memory)
    {
        return (name,description,goal,pic,uint(status),durationindays,fundRaised,genres);
    }

    function getCampaignDetalis1() external view returns(string memory, string memory , string memory , uint , uint ,uint , uint , uint ,address[] memory ,  address   ) 
    {
    

        return (
            name,
            description,
            pic,
            goal,
            uint(status),
            durationindays,
            fundRaised,
            startdate,
            contributors,
            owner
        );
    }
    function getCampaignDetails2() external view returns(uint[] memory, uint[] memory , uint[] memory , string[]memory)
    {
        uint[] memory _status = new uint[](requests.length);
    uint[] memory amt = new uint[](requests.length);
    string[] memory ipfsproofadd = new string[](requests.length);
    uint[] memory _contributions = new uint[](contributors.length);

    // Fill _contributions array with the contributions
        for(uint i = 0; i < contributors.length; i++) {
            _contributions[i] = contributions[contributors[i]];
        }

        // Fill the withdraw request details
        for(uint i = 0; i < requests.length; i++) {
            _status[i] = uint(requests[i].status);
            amt[i] = requests[i].amt;
            ipfsproofadd[i] = requests[i].ipfsproofadd;
        }
        return(_contributions,_status,amt,ipfsproofadd); 
    }
}