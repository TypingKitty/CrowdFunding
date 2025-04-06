import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from './ui/button'  
function VoteDialog({index , handleAccept, handleReject}) {
  return (
    <Dialog>
  <DialogTrigger><Button className="bg-blue-600 rounded-[1.5rem] text-white hover:bg-blue-550 hover:scale-[1.05] transition-transform duration-300" >Vote</Button></DialogTrigger>
  <DialogContent className="bg-gray-100 p-4">
    <DialogHeader>
      <DialogTitle>Vote</DialogTitle>
      <DialogDescription>
        Please choose wisely as your vote is final and cannot be changed.
      </DialogDescription>
    </DialogHeader>
      <div className="flex justify-evenly">
        <DialogClose asChild>
        <Button onClick={()=>{handleAccept(index)}} className="bg-green-500 text-white rounded-[1.5rem] hover:bg-green-600 hover:scale-[1.05] transition-transform duration-300  min-w-[70px]">Accept</Button>
        </DialogClose>
        <DialogClose asChild>
        <Button onClick={()=>{handleReject(index)}} className="bg-red-500 text-white rounded-[1.5rem] hover:bg-red-600 hover:scale-[1.05] transition-transform duration-300 min-w-[70px]">Reject</Button>
        </DialogClose>
      </div>
  </DialogContent>
</Dialog>

  )
}

export default VoteDialog