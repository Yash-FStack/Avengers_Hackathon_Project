import React from "react";
import logo from '../../Images/yourCryptoLogo-removebg-preview.png';
import ethereumLogo from "../../Images/ethereumLogo.png";
import polygonLogo from "../../Images/polygonLo.png";
import avalancheLogo from "../../Images/avalancheLogo.png";
import solanaLogo from "../../Images/solanaLogo.png";
import '../HomePageComponent/CSS/Home_page.css';
import { useNavigate } from "react-router-dom";

function Home_page() {

  const navigate = useNavigate();

  function ClearLocalStorage() {
    localStorage.clear()
  }

  // Function executed on button click
  const openRecover = () => {
    navigate("/recover-wallet")
  }

  // Function executed on button click
  const openCreate = () => {
    navigate("/create-wallet")
  }

  return (
    <div>
      <ClearLocalStorage />
      <div className="backcard">
        <div className="logo center-align">
          <img src={logo} alt='Wallet' className="logoImage" />
        </div>

        <div className="top-align"><h4 className="center-align">YourCrypto Wallet welcomes you</h4>
        </div>
        <div className="center-align start-guide-text">To start with YourCrypto Wallet, create a new account or import an existing one</div>
        <div className="start-guide-text center-align"><b>Supports: </b></div>
        <div className="support-logo center-align">
          <img src={ethereumLogo} alt='Wallet' className="support-logoImage" />
          <img src={polygonLogo} alt='Wallet' className="support-logoImage" />
          <img src={avalancheLogo} alt='Wallet' className="support-logoImage" />
          <img src={solanaLogo} alt='Wallet' className="support-logoImage" />
        </div>
        <div className="button-container">
          <button type='button' className="btn btn-primary set-button center-align" onClick={openCreate}>Create new account</button><br />
          <button type='button' className="btn btn-primary set-button center-align" onClick={openRecover}>Recover Account</button>
        </div>
      </div>
    </div >
  );
}

export default Home_page;