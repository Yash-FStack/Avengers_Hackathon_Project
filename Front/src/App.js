//Define Routes
import React from "react";
import HomePage from "./Components/HomePageComponent/Home_page";
import CreateWallet from "./Components/WalletActions/Create_wallet"
import RecoverWallet from "./Components/WalletActions/Recover_wallet"
import WalletApp from "./Components/WalletPages/Wallet"

import { Route,Routes } from "react-router-dom";

function App() {
  return (
    <switch>
    <Routes>
      <Route path = "/" element = {<HomePage />}/>
      <Route path = "/create-wallet" element = {<CreateWallet />}/>
      <Route path = "/recover-wallet" element = {<RecoverWallet />}/>
      <Route path = "/wallet" element = {<WalletApp />}/>
    </Routes>
    </switch>

  );
}
  
export default App;
