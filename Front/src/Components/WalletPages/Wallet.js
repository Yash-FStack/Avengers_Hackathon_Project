import React, { useEffect, useState } from "react";
import './CSS/Wallet.css';
import copyLogo from '../../Images/copy.png'
import sendLogo from "../../Images/send.png";
import logo from '../../Images/yourCryptoLogo-removebg-preview.png';
import noData from "../../Images/no_token_nft-removebg-preview.png";

function Wallet() {

    const [Ammout, setAmount] = useState(null);
    // Activity Data of User
    const [activityData, setActivityData] = useState([]);
    // Copied Message
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    //Sets active animation for token,nft and activity nav tab
    const [isTokensActive, setIsTokensActive] = useState(false);
    const [isActivityActive, setIsActivityActive] = useState(true);
    const [isNFTActive, setIsNFTActive] = useState(false)
    // // Sets the active Network details
    const [activeNetwork, setActiveNetwork] = useState(
        {
            NetworkName: '',
        }
    );
    // Sets the active account details
    const [activeAccount, setActiveAccount] = useState('');

    useEffect(async () => {
        let networkName = await RetrieveNetworkFromLocalStorage()
        setActiveNetwork(networkName)
        let accountName = RetrieveAccountDetailsFromLocalStorage();
        setActiveAccount(accountName);

        let address = RetrieveAccountFromLocalStorage();
        let rpc = RetrieveRPCFromLocalStorage();
        // Fetch balance of the account using balance endpoint from server
        fetch(`http://localhost:3000/balance?RPC=${rpc}&address=${address}`, {
            method: 'POST'
        }).then(response => response.json())
            .then(data => {
                let account_balance = parseFloat(data.balance);
                account_balance = account_balance.toFixed(2);
                setAmount(account_balance);
            });
        // Fetch balance of the account using balance endpoint from server
        fetch(`http://localhost:3000/webhook/addAddress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: [address] })
        }).then(response => response.json())
            .then(data => {
            });
        // Fetch notifications of the account using notifications endpoint from server
        fetch(`http://localhost:3000/notifications/${address}`).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            console.log(response);
            return response.json();
        })
            .then(data => {
                console.log("this");
                console.log(data);
                setActivityData(data.result)
            });
    }, [])

    function RetrieveAccountFromLocalStorage() {
        const Account = JSON.parse(localStorage.getItem('ActiveAccount'));

        if (Account) {
            return (
                Account.Address
            )
        }
    }
    async function RetrieveNetworkFromLocalStorage() {
        const Network = JSON.parse(localStorage.getItem('ActiveNetwork'))
        if (Network) {
            return (
                Network
            )
        }
    }
    function RetrieveAccountDetailsFromLocalStorage() {
        const Account = JSON.parse(localStorage.getItem('ActiveAccount'))

        if (Account) {
            return (
                Account
            )
        }
    }
    function RetrieveRPCFromLocalStorage() {
        const Network = JSON.parse(localStorage.getItem('ActiveNetwork'))

        if (Network) {
            return (
                Network.RPC_URL
            )
        }
    }
    // Copy Function
    function onCopy() {
        navigator.clipboard.writeText(RetrieveAccountFromLocalStorage())
            .then(() => {
                setShowCopiedMessage(true);
                setTimeout(() => {
                    setShowCopiedMessage(false);
                }, 3000);
            })
            .catch(err => {
                console.error('Error copying to clipboard:', err);
            });
    }

    // Function to handle click events
    const handleTokensClick = () => {
        setIsActivityActive(false);
        setIsNFTActive(false);
        setIsTokensActive(true);
    };
    const handleActivityClick = () => {
        setIsActivityActive(true);
        setIsNFTActive(false);
        setIsTokensActive(false);
    };
    const handleNFTClick = () => {
        setIsActivityActive(false);
        setIsNFTActive(true);
        setIsTokensActive(false);
    };

    // HTML Object
    return (
        <div>
            <div id="wallet-notification-box" className={`wallet-notification-box color-info ${showCopiedMessage ? 'slide-in opacity' : 'slide-out '}`}>
                <p>Copied</p>
            </div>

            <div className="wallet-logo center-align">
                <img src={logo} alt='Wallet' className="wallet-logo-width" />
            </div>

            <div className="wallet-backcard">
                <div className="top-section">
                    <div className="Network">
                        <div className="dropdown">
                            <div className="btn network-button dropdown-toggle custom-dropdown-toggle d-flex" type="button" id="NetworkdropdownMenu" data-bs-toggle="dropdown" aria-expanded="false">
                                <div className="logo-importToken d-flex">
                                    <div className={`importToken-logo static-logo-color`}>{Array.from(activeNetwork.NetworkName)[0]}</div>
                                    <div>{activeNetwork.NetworkName}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dropdown">
                        <div className="btn account-button dropdown-toggle" type="button" id="AccountdropdownMenu" data-bs-toggle="dropdown" aria-expanded="false">
                            {activeAccount.AccountName}
                        </div>
                    </div>
                    <div className="more-menu" >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                        </svg>
                    </div>
                </div>

                <div className="middle-section">
                    <div className="Address d-flex">
                        <div className="number">{activeAccount.Address}</div>
                        <button type="button" className="copy d-flex" onClick={onCopy}>...<img src={copyLogo} alt="copy" className="copyImage" /></button>
                    </div>
                    <div className="balance">
                        <div className="value">{Ammout}</div>
                        <div className="symbol">{activeNetwork.Currency}</div>
                    </div>
                    <div className="Transfer d-flex">
                        <button type="button" className="Send">Send<img src={sendLogo} alt="Send" className="send-image" /></button>
                    </div>
                    <hr />
                    <div className="navigation d-flex">
                        <div className={`Tokens ${isTokensActive ? 'navigation-active' : ''}`} onClick={handleTokensClick}  >Tokens</div>
                        <div className={`Activity ${isNFTActive ? 'navigation-active' : ''}`} onClick={handleNFTClick}>NFT</div>
                        <div className={`Activity ${isActivityActive ? 'navigation-active' : ''}`} onClick={handleActivityClick}>Activity</div>
                    </div>
                    <div className="navigation-tab-output">
                        <div className={`ImportedTokens ${!isTokensActive ? 'display-none' : ''}`}>
                            <div className={`noData`}>
                                <div className="noData-image"><img src={noData} alt='NoData' className="" /></div>
                                <div className="noData-text">No Imported Token's to show</div>
                                <div className="noData-link"><a href="#">Lear more</a></div>
                            </div>
                            <div className="importToken">
                                <div className="bottomLine-On-hover">
                                    <a href="#" className="import"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                    </svg> Import Token</a>
                                </div>
                            </div>
                            <div className="importToken">
                                <div className="bottomLine-On-hover">
                                    <a href="/wallet" className="import"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                                    </svg> Refresh List</a>
                                </div>
                            </div>

                        </div>
                        <div className={`NFTList ${!isNFTActive ? 'display-none' : ''}`}>
                            <div className={`noData`}>
                                <div className="noData-image"><img src={noData} alt='NoData' className="" /></div>
                                <div className="noData-text">No NFT's Yet</div>
                                <div className="noData-link"><a href="#">Lear more</a></div>
                            </div>

                            <div className="importToken">
                                <a href="#" className="import"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                </svg> Import NFT</a>
                            </div>
                            <div className="importToken">
                                <a href="#" className="import"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                                </svg> Refresh List</a>
                            </div>
                        </div>

                        <div className={`ActivityList ${!isActivityActive ? 'display-none' : ''}`}>
                            <div>
                                {activityData.map((activity, index) => (
                                    <div key={index} className="Activity-Info d-flex" >
                                        <div className="Activity-name">{activity.notification_msg}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-section">
                    <div className="footer-support"><a href="" className="support-link">@support.yourCrypto</a></div>
                </div>
            </div>
        </div>
    );
}

export default Wallet;