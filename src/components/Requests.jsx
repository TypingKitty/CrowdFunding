import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import VoteDialog from './VoteDialog';
import {useWallet} from './WalletProvider';
function Requests({ isContributor, account, campaignContract, status, proof, amt }) {
  const [hasVoted, setHasVoted] = useState("Not Voted");
  const location = useLocation();
  const {votingStatus} = useWallet();
  const handleAccept = async (index) => {
    await campaignContract.vote(0, index, account);
    setHasVoted(0);
  };

  const handleReject = async (index) => {
    await campaignContract.vote(1, index, account);
    setHasVoted(1);
  };

  useEffect(() => {
    const fetchVoteStatus = async () => {
      await Promise.all(
        status.map(async (st, index) => {
          if (st === 'Pending') {
            const [contributors, res] = await campaignContract.getWithdrawRequestInfo(index);
            const lowerCaseContributors = contributors.map((c) => c.toLowerCase());
           // console.log(votingStatus(Number(res[lowerCaseContributors.indexOf(account.toLowerCase())])) == "Not Voted");
            const voteStatus= votingStatus(Number(res[lowerCaseContributors.indexOf(account.toLowerCase())]));
            setHasVoted(voteStatus);
          }
        })
      );
      
      
    };

    fetchVoteStatus();
  }, [account, campaignContract, status]);

  return (
    <Table className="rounded-[1.1rem] bg-gray-50">
      <TableCaption>A list of withdrawal requests by the campaign owner</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Proof of the Reason</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-left"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {status.map((st, index) => (
          <TableRow className="hover:bg-gray-200" key={index}>
            <TableCell className="text-left">{index + 1}</TableCell>
            <TableCell className="text-left">{st}</TableCell>
            <TableCell className="text-left">
              <a href={proof[index]} className="text-blue-700 cursor-pointer visited:text-purple-700">
                proof{index + 1}
              </a>
            </TableCell>
            <TableCell className="text-right">{Number(amt[index])} Wei</TableCell>
            {isContributor && (
              <TableCell className="text-left">
                {st === "Pending" && hasVoted == "Not Voted" ? (
                  <VoteDialog index={index} handleAccept={handleAccept} handleReject={handleReject} />
                ) : (
                  <p className="text-gray-500 cursor-not-allowed">Voted</p>
                )}
              </TableCell>
            )}
            <TableCell className="text-left text-blue-600">
              <Link to={`${location.pathname}/${index}`} className="block w-full h-full">
                <span >View More Details</span>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Requests;