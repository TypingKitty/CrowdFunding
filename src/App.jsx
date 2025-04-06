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
import Dum from "./components/Dum";
import RequestsDetails from "./components/RequestsDetails";
import Campaigns from "./components/Campaigns";
import Upload from "./components/Upload";
function App() {
  return (
    <WalletProvider>
    <ContractProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Header/>
            <Campaigns type="all"/>
            <Upload/>
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
              <Campaigns type="my"/>
            </>
          } 
        /> 
        <Route
        path="/campaign/:id/:reqid"
        element={
          <>
            <Header/>
            <RequestsDetails/>
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
