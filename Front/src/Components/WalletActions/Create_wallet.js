import React, { useEffect, useState } from "react";
import "./CSS/Create_wallet.css"
import logo from '../../Images/yourCryptoLogo-removebg-preview.png';
import Back from '../../Images/87-875958_back-arrow-in-circle-symbol-removebg-preview.png'
import { useNavigate } from "react-router-dom";

function Create_wallet() {
  const [isCopied, setIsCopied] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [Phrase, setPhrase] = useState('');
  const [Privatekey, setPrivatekey] = useState('');
  const [Address, setAddress] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    console.log("here");
    fetch('http://localhost:3000/createAccount')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setPhrase(data.Mnemonic);
        setPrivatekey(data.PrivateKey);
        setAddress(data.Address);
      });
  }, [])

  const arr = Phrase.split(' ');

  function getBack() {
    navigate("/")
  }

  function getNext() {
    SaveToLocalStorage();

    navigate("/wallet")
  }

  function SaveToLocalStorage() {
    const AccountDetails = [{
      AccountName: "Account 0",
      Mnemonic: Phrase,
      PrivateKey: Privatekey,
      Address: Address
    }];

    let activeNetwork = {
      NetworkName: "Polygon-Mumbai",
      Network: "Testnet",
      RPC_URL: "https://rpc-mumbai.maticvigil.com",
      Chain_ID: "80001",
      Currency: "MATIC"
    }

    localStorage.setItem('ActiveNetwork', JSON.stringify(activeNetwork));
    localStorage.setItem("ActiveAccount", JSON.stringify(AccountDetails[0]));
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(Phrase)
      .then(() => {
        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
      });
  }

  const unHide = () => {
    setIsHidden(false);
  }

  return (
    <div>
      <div id="copy-notification-box" className={`copy-notification-box ${isCopied ? 'slide-in opacity' : 'slide-out '}`}>
        <p>Passphrase Copied</p>
      </div>


      <div className="create-backcard">
        <div><button type="button" className="create-backButton" onClick={getBack} ><img src={Back} alt="back" className="create-backButton" /></button>
        </div>

        <div className="logo center-align">
          <img src={logo} alt='Wallet' className="logoImage policy-tab" />
        </div>

        <div className="create-top-align"><h2 className="create-center-align">Your Secret/Recovery Phrase</h2>
          <div className="your-passphrase">
            <p>Please write your passphrase on a paper and store it in a safe place. You can recover your account using this passphase.</p>
            <h6> <b>Your passphrase</b></h6>
          </div>
          <div className={`hide-phrase ${!isHidden ? 'display-none' : ''}`}>
            <div className="eye-mark" onClick={unHide}>
              <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-eye eye-color" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
              </svg>
            </div>
            <div className="text eye-color" onClick={unHide}>Reveal Secret Recovery Phrase</div>
            <p className="eye-color">Please ensue that no one is watching your screen</p>
          </div>
          <div className={`wrapper ${isHidden ? 'display-none' : ''}`}>
            {arr.map((item, index) => (
              <div key={index} className="phrase">{item}</div>
            ))}
          </div>
          <div className="down-buttons">
            <button type='button' className="btn btn-primary bttn" onClick={copyToClipboard} disabled={isHidden}>Copy </button><br />
            <button type='button' className="btn btn-primary bttn" onClick={getNext} disabled={isHidden}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Create_wallet;