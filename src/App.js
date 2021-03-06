import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import './App.css';
import 'bulma/css/bulma.css';
import { checkSubdomainOwner } from "./utils";
import { checkMetamask, initMetamask } from "./utils/metamask"
import io from 'socket.io-client';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Login from './pages/Login';
import Access from './pages/Access';

const socket = io('http://10.7.15.73:4000');
socket.on('connect', e => console.log('connect'));
socket.on('disconnect', function(){});
const Metamask = window.web3;

const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://ropsten.infura.io/rqmgop6P5BDFqz6yfGla'));

const emptyAddress = '0x0000000000000000000000000000000000000000';

const metaPrivateKey = "678357edcb53ef959dbc213b72dac0ba328b33c6e8cd7107d9d378ff3d41a3d7";
const metaPublicKey = "0x09ed291B95eAf94F8e4393b0BC9A7C7eDC85aC83";
const currentAccount = localStorage.metaPublicKey;
console.log(localStorage.metaPrivateKey);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ensDomain: '',
      ensFound: false,
      publicAddress: '',
      ensMessage: 'Enter a valid or unempty username',
      hasAccess: false,
      resolvedAddress: '',
      qrCodeData: '',
      viewQRCode: false,
      status: null,
      msg: '',
      socketId: null,
      viewSignInButton: true,
      loggedIn: false,
      phoneUid: 'blabla',
      myPublicAddress: '',
      metamaskAccount: '',
      senderPublicAddress: '',
      ethBalance: 0,
      gzeBalance: 0,
      viewSubscriptions: false,
      ensAddress: '',
      currentAccount: '',
    }
  }

  componentDidMount() {
    //metamask
    if (typeof Metamask !== 'undefined') {
      Metamask.eth.getAccounts((err, accounts) => {
        if (accounts.length !== 0) {
          console.log('ACCOUNTS: ', accounts[0])
          this.setState({metamaskAccount: accounts[0]});
        } else {
          return this.setState({metamaskAccount: false});
        }
      })
    }
    //transfer socket
    socket.on('transfer', function(e) { console.log(e) });
  };

  _checkENS = async (ensUsername) => {

    if (ensUsername.length === 0) {
      this.setState({ensFound: false, ensMessage: 'Enter a valid or unempty username'});
      return;
    }

    this.setState({ensDomain: ensUsername});

    const { ensDomain } = this.state;

    const addr = await checkSubdomainOwner(ensUsername, 'tenz-id');

    if (addr === emptyAddress) {
      this.setState({ensFound: false, ensMessage: 'Available for you!', resolvedAddress: addr});
    } else if(addr === currentAccount) {
      this.setState({ensFound: true, ensMessage: "It's your domain! Edit away!", resolvedAddress: addr});
    } else if (addr === "0x") {

    } else {
      this.setState({ensFound: true, ensMessage: "Unavailable username"});
      // this._checkBalances(addr);
    }
  };

  _sendTransaction = () => {
    console.log('SENDING');
    const {senderPublicAddress, amount, phoneUid} = this.state;
    socket.emit('sendNotification', { payload: { publicAddress: '0xa1b02d8c67b0fdcf4e379855868deb470e169cfb', amount: 0.0001 }}, phoneUid );
  }

  _createAccount = async () => {
    console.log(`SENDING: ${this.state.ensDomain}/${this.state.metamaskAccount}`);
    const res = await fetch(`http://localhost:4000/deploy/${this.state.metamaskAccount}/${this.state.ensDomain}`)
    console.log('RESPONSE: ', res)
  }

  render() {
    const { ensFound, ensDomain, metamaskAccount, ensMessage, qrCodeData, viewQRCode, viewSignInButton, status, loggedIn, myPublicAddress, ethBalance, viewSubscriptions } = this.state;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };
    // myPublicAddress && !ethBalance ? this._getEthAddress() : null;

    return (
      <Router>
        <div className="container" style={{backgroundColor: 'black'}}>
          <nav className="navbar is-transparent" style={{backgroundColor: 'black'}}>
            <div className="navbar-brand">
              <a className="" href="">
                <img src={require('./Meta-TX.png')} style={{height: 60, marginTop: 20}}/>
              </a>
            </div>
            <div id="navbarExampleTransparentExample" className="navbar-menu">
              <div className="navbar-start">
              </div>
              <div className="navbar-end">
                <div className="navbar-item">
                  <a className="title is-4" style={{fontWeight: '700', color: 'white'}} onClick={this._sendTransaction}>Sign In</a>
                </div>
              </div>
            </div>
          </nav>
          <Route exact path="/" component={Login} />
          <Route path="/access" component={Access} />
       </div>
      </Router>
    );
  }
}

export default App;
