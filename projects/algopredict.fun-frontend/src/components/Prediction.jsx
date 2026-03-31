import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPrediction, getUserPrediction, formatAmount, combineAddressAndUint64, base64ToUint8Array } from '../utils';
import { APP_ADDRESS, APP_ADMIN, APP_ID, Caller, algorandClient, TXN_URL } from '../config';
import algosdk from 'algosdk';
import * as algokit from "@algorandfoundation/algokit-utils";
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Clock, Trophy, TrendingUp } from 'lucide-react';
import im1 from "../assets/profile.png";
import im2 from "../assets/profile2.png";
import im3 from "../assets/profile3.png";
import im4 from "../assets/profile4.png";

export const Prediction = ({ activeAccount, transactionSigner }) => {
  const [selectedOption, setSelectedOption] = useState(1);
  const [betAmount, setBetAmount] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [startsIn, setStartsIn] = useState("00:00:00");
  const [endsIn, setEndsIn] = useState("00:00:00");
  const [predictionStatus, setPredictionStatus] = useState("");
  const [estimatedPayout, setEstimatedPayout] = useState(0);
  const [activities, setActivities] = useState([]);
  const [claimAmount, setClaimAmount] = useState(0);
  const [submitting, setSubmitting] = useState("");
  const [resultOption, setResultOption] = useState(3);
  const [activeTab, setActiveTab] = useState("predict");

  useEffect(() => {
    if (!activeAccount) {
      toast.error("Please connect your wallet to bet");
      navigate('/');
    }

    const fetchPrediction = async () => {
      const p = await getPrediction(Caller, id);
      if (!p) {
        toast.error("Prediction not found");
        navigate('/');
        return;
      }

      const user = await getUserPrediction(Caller, activeAccount.address, id);
      if (user) {
        setPrediction({ prediction: p, user });
      } else {
        setPrediction({ prediction: p, user: null });
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const note = encoder.encode(`addbet-${id}`);

      const activity = [];
      let addbets = await algorandClient.client.indexer.searchForTransactions().notePrefix(note).applicationID(APP_ID).do();
      for (let i = 0; i < addbets.transactions.length; i++) {
        const txn = addbets.transactions[i];
        const txnNote = base64ToUint8Array(txn.note);
        const txnNoteStr = decoder.decode(txnNote);
        const txnNoteArr = txnNoteStr.split("-");
        if (txnNoteArr.length == 4) {
          activity.push({ address: txn.sender, option: txnNoteArr[2], amount: txnNoteArr[3], type: "addbet", time: txn["round-time"], txnId: txn.id });
        }
      }

      while (addbets["next-token"]) {
        addbets = await algorandClient.client.indexer.searchForTransactions().notePrefix(note).applicationID(APP_ID).nextToken(addbets["next-token"]).do();
        for (let i = 0; i < addbets.transactions.length; i++) {
          const txn = addbets.transactions[i];
          const txnNote = base64ToUint8Array(txn.note);
          const txnNoteStr = decoder.decode(txnNote);
          const txnNoteArr = txnNoteStr.split("-");
          if (txnNoteArr.length == 4) {
            activity.push({ address: txn.sender, option: txnNoteArr[2], amount: txnNoteArr[3], type: "addbet", time: txn["round-time"], txnId: txn.id });
          }
        }
      }

      const claimnote = encoder.encode(`reward-${id}`);
      let claimbets = await algorandClient.client.indexer.searchForTransactions().notePrefix(claimnote).address(APP_ADDRESS).addressRole("sender").do();
      for (let i = 0; i < claimbets.transactions.length; i++) {
        const txn = claimbets.transactions[i];
        if (txn["inner-txns"][0]["payment-transaction"]) {
          const paymentTxn = txn["inner-txns"][0]["payment-transaction"];
          activity.push({ address: txn.sender, type: "claim", time: txn["round-time"], txnId: txn.id, amount: algosdk.microalgosToAlgos(paymentTxn.amount) });
        }
      }
      while (claimbets["next-token"]) {
        claimbets = await algorandClient.client.indexer.searchForTransactions().notePrefix(claimnote).address(APP_ADDRESS).addressRole("sender").nextToken(claimbets["next-token"]).do();
        for (let i = 0; i < claimbets.transactions.length; i++) {
          const txn = claimbets.transactions[i];
          if (txn["inner-txns"][0]["payment-transaction"]) {
            const paymentTxn = txn["inner-txns"][0]["payment-transaction"];
            activity.push({ address: txn.sender, type: "claim", time: txn["round-time"], txnId: txn.id, amount: algosdk.microalgosToAlgos(paymentTxn.amount) });
          }
        }
      }

      activity.sort((a, b) => { return b.time - a.time });
      setActivities(activity);
    }
    fetchPrediction();
  }, [activeAccount]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (prediction) {
        const now = new Date().getTime();
        const startTime = new Date(Number(prediction.prediction.startsAt) * 1000).getTime();
        const endTime = new Date(Number(prediction.prediction.endsAt) * 1000).getTime();

        if (now < startTime) {
          setPredictionStatus("not_started");
          const timeDiff = startTime - now;
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          const timeDiff2 = endTime - now;
          const days2 = Math.floor(timeDiff2 / (1000 * 60 * 60 * 24));
          const hours2 = Math.floor((timeDiff2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes2 = Math.floor((timeDiff2 % (1000 * 60 * 60)) / (1000 * 60));
          const seconds2 = Math.floor((timeDiff2 % (1000 * 60)) / 1000);
          setStartsIn(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
          setEndsIn(`${days2 > 0 ? `${days}d ` : ''}${hours2}h ${minutes2}m ${seconds2}s`);
        } else if (now < endTime) {
          setPredictionStatus("started");
          setStartsIn("Started");
          const timeDiff = endTime - now;
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setEndsIn(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
        } else {
          setPredictionStatus("ended");
          setStartsIn("Ended");
          setEndsIn("Ended");
        }
      }
    }, 1000);

    if (prediction) {
      if (prediction.user) {
        const previousAmount = Number(prediction.user.amount);
        setBetAmount(algosdk.microalgosToAlgos(previousAmount));
        setSelectedOption(prediction.user.option);
        const option1 = Number(prediction.prediction.option1SharesBhougth);
        const option2 = Number(prediction.prediction.option2SharesBhougth);
        const total = option1 + option2;
        if (prediction.user.option == 1) {
          setEstimatedPayout(algosdk.microalgosToAlgos(Math.round(Number((previousAmount * total) / option1))));
        } else if (prediction.user.option == 2) {
          setEstimatedPayout(algosdk.microalgosToAlgos(Math.round(Number((previousAmount * total) / option2))));
        } else {
          setEstimatedPayout(0);
        }

        if (Number(prediction.prediction.result) != 0) {
          if (Number(prediction.user.claimed) == 0) {
            const previousAmount = Number(prediction.user.amount);
            const option1 = Number(prediction.prediction.option1SharesBhougth);
            const option2 = Number(prediction.prediction.option2SharesBhougth);
            const total = option1 + option2;
            if (Number(prediction.user.option) == 1 && Number(prediction.prediction.result) == 1) {
              setClaimAmount(algosdk.microalgosToAlgos(Math.round(Number((previousAmount * total) / option1))));
            } else if (Number(prediction.user.option) == 2 && Number(prediction.prediction.result) == 2) {
              setClaimAmount(algosdk.microalgosToAlgos(Math.round(Number((previousAmount * total) / option2))));
            } else {
              setClaimAmount(0);
            }
          }
        }
      }
    }

    return () => clearInterval(interval);
  }, [prediction]);

  useEffect(() => {
    if (betAmount > 0 && prediction) {
      let option1 = algosdk.microalgosToAlgos(Number(prediction.prediction.option1SharesBhougth));
      let option2 = algosdk.microalgosToAlgos(Number(prediction.prediction.option2SharesBhougth));
      const total = option1 + option2 + Number(betAmount);
      if (selectedOption == 1) {
        option1 += Number(betAmount);
        setEstimatedPayout(Number(betAmount) * (total / option1));
      } else if (selectedOption == 2) {
        option2 += Number(betAmount);
        setEstimatedPayout(Number(betAmount) * (total / option2));
      } else {
        setEstimatedPayout(0);
      }
    } else {
      setEstimatedPayout(0);
    }
  }, [betAmount, selectedOption]);

  const addBet = async () => {
    if (betAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const encoder = new TextEncoder();
      if (!prediction.user) {
        setSubmitting("Adding bet...");
        const paytxn0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: activeAccount.address,
          to: APP_ADDRESS,
          amount: algokit.algos(betAmount).microAlgos,
          suggestedParams: await algorandClient.client.algod.getTransactionParams().do(),
        });
        const newUserBuy0 = await Caller.compose().buyShares(
          { predictionId: Number(id), option: selectedOption, amount: algokit.algos(betAmount).microAlgos, payTxn: paytxn0 },
          {
            sender: { addr: activeAccount.address, signer: transactionSigner },
            boxes: [
              { appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) },
              { appIndex: 0, name: combineAddressAndUint64(activeAccount.address, Number(id)) },
            ],
            note: encoder.encode(`addbet-${id}-${selectedOption}-${betAmount}`),
          }
        ).atc();
        setSubmitting("Sign Transaction...");
        toast.info("Sign Transaction...");
        await newUserBuy0.gatherSignatures();
        setSubmitting("Submiting Transaction...");
        const res = await newUserBuy0.execute(algorandClient.client.algod, 3);
        toast.success("Bet added successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
        setSubmitting("");
        window.location.reload();
      } else {
        const previousAmount = Number(prediction.user.amount);
        let diff;
        if (previousAmount >= betAmount) {
          diff = 0;
        } else {
          diff = betAmount - previousAmount;
        }
        setSubmitting("Changing bet...");
        const paytxn0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: activeAccount.address,
          to: APP_ADDRESS,
          amount: algokit.algos(diff).microAlgos,
          suggestedParams: await algorandClient.client.algod.getTransactionParams().do(),
        });
        const changeBet = await Caller.compose().buyShares(
          { predictionId: Number(id), option: selectedOption, amount: algokit.algos(betAmount).microAlgos, payTxn: paytxn0 },
          {
            sender: { addr: activeAccount.address, signer: transactionSigner },
            boxes: [
              { appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) },
              { appIndex: 0, name: combineAddressAndUint64(activeAccount.address, Number(id)) },
            ],
            note: encoder.encode(`addbet-${id}-${selectedOption}-${betAmount}`),
          }
        ).atc();
        setSubmitting("Sign Transaction...");
        toast.info("Sign Transaction...");
        await changeBet.gatherSignatures();
        setSubmitting("Submiting Transaction...");
        const res = await changeBet.execute(algorandClient.client.algod, 3);
        toast.success("Bet changed successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
        setSubmitting("");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to add bet: ${e.message}`);
      setSubmitting("");
    }
  }

  const announceResult = async () => {
    try {
      if (activeAccount.address !== APP_ADMIN) {
        toast.error("You are not authorized to announce result");
        return;
      }

      setSubmitting("Announcing result...");
      const endPrediction = await Caller.compose().endPrediction(
        { predictionId: Number(id), result: resultOption },
        { sender: { addr: activeAccount.address, signer: transactionSigner }, boxes: [{ appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) }] }
      ).atc();
      setSubmitting("Sign Transaction...");
      toast.info("Sign Transaction...");
      await endPrediction.gatherSignatures();
      setSubmitting("Submiting Transaction...");
      const res = await endPrediction.execute(algorandClient.client.algod, 3);
      toast.success("Result announced successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
      setSubmitting("");
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSubmitting("");
      toast.error(`Failed to announce result: ${e.message}`);
    }
  };

  const claimReward = async () => {
    try {
      setSubmitting("Claiming reward...");
      const adminClaim = await Caller.compose().claimReward(
        { predictionId: Number(id) },
        {
          sender: { addr: activeAccount.address, signer: transactionSigner },
          boxes: [
            { appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) },
            { appIndex: 0, name: combineAddressAndUint64(activeAccount.address, Number(id)) },
          ],
          sendParams: { fee: algokit.algos(0.002) },
        }
      ).atc();
      setSubmitting("Sign Transaction...");
      toast.info("Sign Transaction...");
      await adminClaim.gatherSignatures();
      setSubmitting("Submiting Transaction...");
      const res = await adminClaim.execute(algorandClient.client.algod, 3);
      toast.success("Reward claimed successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
      setSubmitting("");
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSubmitting("");
      toast.error(`Failed to claim reward: ${e.message}`);
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 flex items-center gap-2 px-4 py-2 glass rounded-xl hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h1 className="text-3xl font-bold mb-6">{prediction && prediction.prediction.question}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Participants</span>
                </div>
                <div className="flex -space-x-2">
                  {[im1, im2, im3, im4].map((img, i) => (
                    <img key={i} src={img} alt="Participant" className="w-8 h-8 rounded-full border-2 border-[#0a0a0f]" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-[#0a0a0f] flex items-center justify-center text-xs">
                    +{prediction && Number(prediction.prediction.noOfUsers)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Starts in
                  </div>
                  <div className="text-lg font-semibold">{startsIn}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Expires in
                  </div>
                  <div className="text-lg font-semibold">{endsIn}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Trophy className="w-4 h-4" />
                    Prize Pool
                  </div>
                  <div className="text-lg font-semibold text-gradient">
                    {prediction && formatAmount(algosdk.microalgosToAlgos(Number(prediction.prediction.option1SharesBhougth) + Number(prediction.prediction.option2SharesBhougth)))} ALGO
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-4 overflow-hidden"
          >
            <img
              src={prediction && prediction.prediction.image}
              alt="Prediction"
              className="w-full h-64 lg:h-full object-cover rounded-xl"
            />
          </motion.div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("predict")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "predict"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              : "glass hover:bg-white/10"
              }`}
          >
            Predict
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "activity"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              : "glass hover:bg-white/10"
              }`}
          >
            Activity
          </button>
        </div>

        {activeTab === "predict" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            {predictionStatus === "not_started" && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                <h3 className="text-2xl font-bold mb-2">Betting Not Started Yet</h3>
                <p className="text-gray-400">Come back when the prediction starts</p>
              </div>
            )}

            {predictionStatus === "ended" && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-2xl font-bold mb-4">Betting Ended</h3>
                {prediction.user ? (
                  Number(prediction.prediction.result) !== 0 ? (
                    Number(prediction.user.claimed) === 1 ? (
                      <p className="text-gray-400">You have claimed your reward</p>
                    ) : (
                      <div>
                        <p className="text-gray-400 mb-4">Claim your Reward</p>
                        <motion.button
                          onClick={claimReward}
                          disabled={submitting !== ""}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold disabled:opacity-50"
                        >
                          Claim {claimAmount} ALGO
                        </motion.button>
                      </div>
                    )
                  ) : (
                    <div>
                      <p className="text-gray-400">Result isn't announced yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        You placed {algosdk.microalgosToAlgos(Number(prediction.user.amount))} ALGO bet
                      </p>
                    </div>
                  )
                ) : (
                  <p className="text-gray-400">You haven't placed any bet</p>
                )}
              </div>
            )}

            {predictionStatus === "started" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Select your bet</h3>
                  <p className="text-gray-400">Tap on an option to select your bet</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => setSelectedOption(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl font-semibold text-lg transition-all ${selectedOption === 1
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 ring-2 ring-blue-400"
                      : "glass hover:bg-white/10"
                      }`}
                  >
                    {prediction.prediction && prediction.prediction.option1}
                  </motion.button>

                  <motion.button
                    onClick={() => setSelectedOption(2)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl font-semibold text-lg transition-all ${selectedOption === 2
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 ring-2 ring-blue-400"
                      : "glass hover:bg-white/10"
                      }`}
                  >
                    {prediction.prediction && prediction.prediction.option2}
                  </motion.button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Enter your bet amount</label>
                  <input
                    type="number"
                    placeholder="Enter Bet Amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 glass rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Estimated Payout</span>
                  </div>
                  <span className="text-xl font-bold text-gradient">{estimatedPayout.toFixed(2)} ALGO</span>
                </div>

                <motion.button
                  onClick={addBet}
                  disabled={submitting !== ""}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting !== "" ? submitting : prediction.user ? "Change Bet" : "Add Bet"}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6">Bet Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">S.No</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Address</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Option</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length > 0 &&
                    activities.map((bet, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {bet.address.slice(0, 6)}...{bet.address.slice(-4)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${bet.type === "addbet"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-green-500/20 text-green-400"
                              }`}
                          >
                            {bet.type === "addbet" ? "Add Bet" : "Claim Reward"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{Number(bet.amount)} ALGO</td>
                        <td className="py-3 px-4">{bet.option || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeAccount &&
          activeAccount.address === APP_ADMIN &&
          predictionStatus === "ended" &&
          Number(prediction.prediction.result) === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8 mt-6"
            >
              <h3 className="text-2xl font-bold mb-4">Admin: Announce Result</h3>
              <p className="text-gray-400 mb-6">Click on any option to declare the result</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.button
                  onClick={() => setResultOption(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl font-semibold transition-all ${resultOption === 1
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 ring-2 ring-blue-400"
                      : "glass hover:bg-white/10"
                    }`}
                >
                  {prediction.prediction && prediction.prediction.option1}
                </motion.button>

                <motion.button
                  onClick={() => setResultOption(2)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl font-semibold transition-all ${resultOption === 2
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 ring-2 ring-blue-400"
                      : "glass hover:bg-white/10"
                    }`}
                >
                  {prediction.prediction && prediction.prediction.option2}
                </motion.button>

                <motion.button
                  onClick={() => setResultOption(3)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl font-semibold transition-all ${resultOption === 3
                      ? "bg-gradient-to-r from-yellow-500 to-orange-600 ring-2 ring-yellow-400"
                      : "glass hover:bg-white/10"
                    }`}
                >
                  Refund Bet
                </motion.button>
              </div>

              <motion.button
                onClick={announceResult}
                disabled={submitting !== ""}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold disabled:opacity-50"
              >
                {submitting !== "" ? submitting : "Announce Result"}
              </motion.button>
            </motion.div>
          )}
      </div>
    </div>
  );
};
