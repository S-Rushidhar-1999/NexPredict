import Homepage from './pages/Homepage'
import './App.css'
import { HashRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { useWallet } from '@txnlab/use-wallet-react';
import { Header } from './components/Header';
import { CreatePrediction } from './components/CreatePrediction';
import { ToastContainer, toast } from 'react-toastify';
import { Prediction } from './components/Prediction'
import 'react-toastify/dist/ReactToastify.css';
import { Footer } from './components/Footer'
import { useState } from "react";
import ChatIcon from "./components/ChatIcon";
import ChatWindow from "./components/ChatWindow";


const App = () => {
  const { wallets, activeWallet, activeAccount, transactionSigner } = useWallet();
  const [showChat, setShowChat] = useState(false);

  console.log(activeWallet, "ss")

  return (
    <>
      <>
        <Router>
          <Header
            wallets={wallets}
            transactionSigner={transactionSigner}
            activeAccount={activeAccount}
          />
          <Routes>
            <Route path="/" element={<Homepage activeAccount={activeAccount} />} />
            <Route path='create-prediction' element={<CreatePrediction transactionSigner={transactionSigner}
              activeAccount={activeAccount} />} />
            <Route path="/prediction/:id" element={<Prediction activeAccount={activeAccount} transactionSigner={transactionSigner} />} />
          </Routes>
          <Footer />
        </Router>
        <ToastContainer position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark" />
        {!showChat && <ChatIcon onClick={() => setShowChat(true)} />}
        {showChat && <ChatWindow onClose={() => setShowChat(false)} />}

      </>
    </>
  )
}

export default App
