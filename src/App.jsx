// App.jsx
import React from "react";
import "./App.css";
import { WalletProvider } from "./components/WalletProvider";
import Header from "./components/Header";
import CampaignDetails from "./components/CampaignDetails";
import { ContractProvider } from "./components/ContractProvider";
import  MyCampaigns  from "./components/MyCampaigns";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllCampaigns from "./components/AllCampaigns";
function App() {
  return (
    <WalletProvider>
    <ContractProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Header/>
            <AllCampaigns/>
            </>
          }/>
      <Route 
          path="/campaign/:id" 
          element={
            <>
              <Header/>
              <CampaignDetails/>
            </>
          } 
        /> 
        <Route 
          path="/my-campaigns" 
          element={
            <>
              <Header/>
              <MyCampaigns/>
            </>
          } 
        /> 
    </Routes>
  </BrowserRouter>
  </ContractProvider>
  </WalletProvider>
  );
}

export default App;
