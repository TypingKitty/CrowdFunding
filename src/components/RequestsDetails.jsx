import React, { useState, useEffect } from 'react';
import { useParams ,Link} from 'react-router-dom';
import { useContract } from './ContractProvider';
import { useWallet } from './WalletProvider';
import { ethers } from 'ethers';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function RequestsDetails() {
  const { id ,reqid} = useParams();
  const {signer,votingStatus} = useWallet();
  const { campaignFactory, campaignABI } = useContract();
  const [details , setDetails] = useState({});

  const getDetails = async () => {
    const myCampaigns = await campaignFactory.getAllCampaigns();
    const contract = new ethers.Contract(myCampaigns[id], campaignABI, signer);
    const [contributors, res ,amt , date , status , proof] = await contract.getWithdrawRequestInfo(reqid);
  setDetails({
    contributors,
    res,
    amt,
    date,
    status,
    proof
  });
   console.log("con",contributors,"res",res,"amt",amt,date,status,proof,"heyy");
  }

    useEffect(() => {
      if (signer && campaignFactory) {
        getDetails();
      }
    }, [signer,campaignFactory]);
  return (
    <>
   
    <Table className="mt-12 flex flex-col space-y-10">
      <TableHeader><TableHead className="text-[28px]">Request Details</TableHead></TableHeader>
        <TableHeader className="flex  justify-between ">
      <TableHead className="text-left text-[20px] font-semibold  ">
        Requested Amount: {Number(details.amt)} Wei
      </TableHead>
      <TableHead className="text-left text-[20px] font-semibold  ">
        Date of creation: {new Date(Number(details.date) * 1000).toLocaleDateString()}
      </TableHead>
      <TableHead className="text-left text-[20px] font-semibold  ">
        Current Status: {votingStatus(Number(details.status))}
      </TableHead>
      <TableHead className="text-left text-[20px] font-semibold  ">
        Proof: 
        <a 
          href={details.proof} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline"
        >
          proof
        </a>
      </TableHead>
  </TableHeader>
    </Table>
    <Table className="rounded-[1.1rem] bg-gray-150 mt-5">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center text-lg">Contributors</TableHead>
          <TableHead className="text-center text-lg">Voting Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {details.contributors && details.contributors.map((contributor, index) => (
          <TableRow key={index}  className="hover:bg-gray-200 text-center">
            <TableCell >{contributor}</TableCell>
            <TableCell >{votingStatus(Number(details.res[index]))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </>
  )
}

export default RequestsDetails