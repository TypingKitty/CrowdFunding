import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinataSDK } from "pinata";
import { useWallet } from "./WalletProvider";


function Upload() {
  const [file, setFile] = useState(null);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const { upload } = useWallet();
  const handler = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }
    const url = await upload(file);
      setIpfsUrl(url);
      console.log("Uploaded to IPFS:", url);
    } 


  return (
    <>
      <form onSubmit={handler} className="mt-20">
        <Input
          type="file"
          name="file"
          accept="image/*,video/*"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />
        <Button type="submit" className="mt-4">Submit</Button>
      </form>

      {ipfsUrl && (
        <div className="mt-4">
          <p>Uploaded to IPFS:</p>
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {ipfsUrl}
          </a>
          {file && file.type.startsWith("image/") && (
            <img src={ipfsUrl} alt="Uploaded preview" className="mt-2 max-w-sm rounded-lg shadow-md" />
          )}
        </div>
      )}
    </>
  );
};

export default Upload;
