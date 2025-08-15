import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./config";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [winner, setWinner] = useState({ name: "", votes: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const votingContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        console.log("Contract Address:", CONTRACT_ADDRESS);
        console.log("Network:", (await provider.getNetwork()).chainId.toString());
        setContract(votingContract);
        checkVoteCount(votingContract, accounts[0]);
        fetchCandidates(votingContract);
        fetchWinner(votingContract);
      } else {
        setError("MetaMask tidak terdeteksi. Silakan install MetaMask!");
      }
    } catch (err) {
      setError("Gagal terhubung ke MetaMask: " + err.message);
    }
  };

  // Disconnect Wallet with Confirmation
  const disconnectWallet = () => {
    if (window.confirm("Apakah Anda yakin ingin memutuskan wallet?")) {
      setAccount(null);
      setContract(null);
      setCandidates([]);
      setVoteCount(0);
      setWinner({ name: "", votes: 0 });
      setError("");
      console.log("Wallet disconnected");
    }
  };

  // Check the user's vote count
  const checkVoteCount = async (contract, account) => {
    try {
      const votes = await contract.getVoteCount(account);
      setVoteCount(Number(votes));
    } catch (err) {
      console.error("Error in checkVoteCount:", err);
      setError("Gagal memeriksa jumlah vote: " + err.message);
    }
  };

  // Fetch candidates
  const fetchCandidates = async (contract) => {
    try {
      const candidates = await contract.getCandidates();
      setCandidates(candidates.map((c, i) => ({ index: i, name: c.name, voteCount: Number(c.voteCount) })));
    } catch (err) {
      console.error("Error in fetchCandidates:", err);
      setError("Gagal mengambil kandidat: " + err.message);
    }
  };

  // Fetch winner
  const fetchWinner = async (contract) => {
    try {
      const [winnerName, maxVotes] = await contract.getWinner();
      setWinner({ name: winnerName, votes: Number(maxVotes) });
    } catch (err) {
      console.error("Error in fetchWinner:", err);
      setError("Gagal mengambil pemenang: " + err.message);
    }
  };

  // Vote for a candidate
  const vote = async (candidateIndex) => {
    setLoading(true);
    setError("");
    try {
      const tx = await contract.vote(candidateIndex);
      await tx.wait();
      alert("Vote berhasil! Terima kasih telah berpartisipasi dalam lomba 17 Agustus!");
      checkVoteCount(contract, account);
      fetchCandidates(contract);
      fetchWinner(contract);
    } catch (err) {
      setError("Gagal melakukan vote: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle MetaMask account/network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          if (contract) {
            checkVoteCount(contract, accounts[0]);
          }
        }
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, [contract, account]);

  return (
    <div className="app-container">
      <header className="header">
        <img src="/flag.png" alt="Bendera Indonesia" className="flag" />
        <h1>Pemilihan Lomba 17 Agustus</h1>
        <p className="subtitle">Rayakan Hari Kemerdekaan Indonesia dengan Voting DApp!</p>
      </header>
      <div className="content">
        {!account ? (
          <button className="connect-button" onClick={connectWallet}>
            Hubungkan MetaMask
          </button>
        ) : (
          <div className="wallet-info">
            <p className="account">Terhubung: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <button className="disconnect-button" rainforest_action_id="disconnect_wallet_button" onClick={disconnectWallet}>
              Putuskan Wallet
            </button>
          </div>
        )}
        {account && (
          <p className="vote-count">Sisa vote Anda: {5 - voteCount}/5</p>
        )}
        {error && <p className="error">{error}</p>}
        <section className="candidates-section">
          <h2>Daftar Kandidat</h2>
          {candidates.length > 0 ? (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div key={candidate.index} className="candidate-card">
                  <h3>{candidate.name}</h3>
                  <p>{candidate.voteCount} suara</p>
                  {voteCount >= 5 ? (
                    <span className="voted">Anda telah menggunakan semua vote (5/5)</span>
                  ) : (
                    <button
                      className="vote-button"
                      onClick={() => vote(candidate.index)}
                      disabled={loading}
                    >
                      {loading ? "Memproses..." : `Vote (Sisa: ${5 - voteCount})`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Memuat kandidat...</p>
          )}
        </section>
        <section className="winner-section">
          <h2>Pemenang Sementara</h2>
          <p className="winner-text">
            {winner.name ? `${winner.name} dengan ${winner.votes} suara` : "Belum ada pemenang"}
          </p>
        </section>
      </div>
    </div>
  );
};

export default App;