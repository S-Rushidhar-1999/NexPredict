/* eslint-disable no-console */

import * as algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { AlgoPredictClient } from './clients/AlgoPredictClient';

const transferTestTokens = async (
  algodClient: algosdk.Algodv2,
  sender: algosdk.Account,
  reciever: string,
  amount: number
) => {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: reciever,
    suggestedParams,
    amount: algokit.algos(amount).microAlgos,
  });
  const signedXferTxn = xferTxn.signTxn(sender.sk);
  try {
    await algodClient.sendRawTransaction(signedXferTxn).do();
    await algosdk.waitForConfirmation(algodClient, xferTxn.txID().toString(), 3);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return false;
  }
};

const getNextPredictionIndex = async (Caller: AlgoPredictClient) => {
  const global = await Caller.getGlobalState();
  return global.predictionIndex?.asNumber()!;
};

function combineAddressAndUint64(address: string, uint64: number) {
  const addressbuffer = algosdk.decodeAddress(address).publicKey;
  const uint64buffer = algosdk.bigIntToBytes(uint64, 8);
  const combinedbuffer = new Uint8Array(40);
  combinedbuffer.set(addressbuffer, 0);
  combinedbuffer.set(uint64buffer, 32);
  return combinedbuffer;
}

const getPrediction = async (Caller: AlgoPredictClient, index: number) => {
  const predictionType = algosdk.ABIType.from('(string,uint64,uint64,uint64,uint64,uint8,string,string)');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prediction: any = await Caller.appClient.getBoxValueFromABIType(
    algosdk.bigIntToBytes(index, 8),
    predictionType
  );
  return {
    question: prediction[0],
    option1SharesBhougth: prediction[1],
    option2SharesBhougth: prediction[2],
    startsAt: prediction[3],
    endsAt: prediction[4],
    result: prediction[5],
    option1: prediction[6],
    option2: prediction[7],
  };
};

const getUserPrediction = async (Caller: AlgoPredictClient, user: string, index: number) => {
  const predictionType = algosdk.ABIType.from('(uint8,uint64,uint8)');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prediction: any = await Caller.appClient.getBoxValueFromABIType(
    combineAddressAndUint64(user, index),
    predictionType
  );
  return {
    option: prediction[0],
    amount: prediction[1],
    claimed: prediction[2],
  };
};

(async () => {
  const algorandClient = algokit.AlgorandClient.testNet();
  const admin = algosdk.mnemonicToSecretKey(
    'honey ignore theory shift math cereal rotate limit sample tourist tide group high sad tilt clap often photo gesture oppose tool harvest relax above require'
  );
  const user1 = algosdk.mnemonicToSecretKey(
    'skirt help tunnel caution off earth spot surge monitor drip tragic search people cheap stool work dinosaur tuna inquiry absurd destroy joke way able female'
  );
  const user2 = algosdk.mnemonicToSecretKey(
    'burst chicken bright crime wrap dutch elevator banner often dutch surface dance design fresh chase clay survey cage zoo liberty moment gold jump able diagram'
  );

  // await transferTestTokens(algorandClient.client.algod, admin, user1.addr, 100);
  // await transferTestTokens(algorandClient.client.algod, admin, user2.addr, 100);

  const Caller = new AlgoPredictClient(
    {
      sender: admin,
      resolveBy: 'id',
      id: 727094749,
    },
    algorandClient.client.algod
  );

  // await Caller.create.createApplication({});

  const { appId, appAddress } = await Caller.appClient.getAppReference();
  console.log('APP ID : ', appId);

  // await transferTestTokens(algorandClient.client.algod, admin, appAddress, 100);

  const nextPredictionIndex = await getNextPredictionIndex(Caller);
  console.log('Next Prediction Index : ', nextPredictionIndex);
  const timestamp = Math.floor(Date.now() / 1000);
  const newPredictionCreation = await Caller.addPrediction(
    {
      question: 'Who will win american election',
      option1Name: 'Trump',
      option2Name: 'Kalama Harris',
      startsAt: timestamp,
      endsAt: timestamp + 30,
      category: 'Politics',
      image: '',
    },
    { sender: admin, boxes: [{ appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) }] }
  );
  const prediction = await getPrediction(Caller, nextPredictionIndex);
  console.log(prediction);

  console.log(`buying 0.05 shares for admin ${admin.addr}`);
  const paytxn0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: admin.addr,
    to: appAddress,
    amount: algokit.algos(0.05).microAlgos,
    suggestedParams: await algorandClient.client.algod.getTransactionParams().do(),
  });
  const newUserBuy0 = await Caller.buyShares(
    { predictionId: nextPredictionIndex, option: 1, amount: algokit.algos(0.05).microAlgos, payTxn: paytxn0 },
    {
      sender: admin,
      boxes: [
        { appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) },
        { appIndex: 0, name: combineAddressAndUint64(admin.addr, nextPredictionIndex) },
      ],
    }
  );
  const adminShares = await getUserPrediction(Caller, admin.addr, nextPredictionIndex);
  console.log(adminShares);

  console.log(`buying 0.1 shares for user1 ${user1.addr}`);
  const paytxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: user1.addr,
    to: appAddress,
    amount: algokit.algos(0.1).microAlgos,
    suggestedParams: await algorandClient.client.algod.getTransactionParams().do(),
  });
  const newUserBuy = await Caller.buyShares(
    { predictionId: nextPredictionIndex, option: 1, amount: algokit.algos(0.1).microAlgos, payTxn: paytxn },
    {
      sender: user1,
      boxes: [
        { appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) },
        { appIndex: 0, name: combineAddressAndUint64(user1.addr, nextPredictionIndex) },
      ],
    }
  );
  const user1Shares = await getUserPrediction(Caller, user1.addr, nextPredictionIndex);
  console.log(user1Shares);

  console.log(`buying 0.2 shares for user2 ${user2.addr}`);
  const paytxn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: user2.addr,
    to: appAddress,
    amount: algokit.algos(0.2).microAlgos,
    suggestedParams: await algorandClient.client.algod.getTransactionParams().do(),
  });
  const newUserBuy2 = await Caller.buyShares(
    { predictionId: nextPredictionIndex, option: 2, amount: algokit.algos(0.2).microAlgos, payTxn: paytxn2 },
    {
      sender: user2,
      boxes: [
        { appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) },
        { appIndex: 0, name: combineAddressAndUint64(user2.addr, nextPredictionIndex) },
      ],
    }
  );
  const user2Shares = await getUserPrediction(Caller, user2.addr, nextPredictionIndex);
  console.log(user2Shares);

  // sleep for 30 seconds
  await new Promise<number>((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    setTimeout(() => {
      resolve(1);
    }, 30000)
  );

  const endPrediction = await Caller.endPrediction(
    { predictionId: nextPredictionIndex, result: 1 },
    { sender: admin, boxes: [{ appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) }] }
  );
  console.log('ending prediction with winner as 1');
  console.log(await getPrediction(Caller, nextPredictionIndex));

  const adminClaim = await Caller.claimReward(
    { predictionId: nextPredictionIndex },
    {
      sender: admin,
      boxes: [
        { appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) },
        { appIndex: 0, name: combineAddressAndUint64(admin.addr, nextPredictionIndex) },
      ],
      sendParams: { fee: algokit.algos(0.002) },
    }
  );
  console.log('admin claimed reward', adminClaim.transaction.txID());
  console.log(await getUserPrediction(Caller, admin.addr, nextPredictionIndex));

  const user1Claim = await Caller.claimReward(
    { predictionId: nextPredictionIndex },
    {
      sender: user1,
      boxes: [
        { appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) },
        { appIndex: 0, name: combineAddressAndUint64(user1.addr, nextPredictionIndex) },
      ],
      sendParams: { fee: algokit.algos(0.002) },
    }
  );
  console.log('user1 claimed reward', user1Claim.transaction.txID());
  console.log(await getUserPrediction(Caller, user1.addr, nextPredictionIndex));

  const user2Claim = await Caller.claimReward(
    { predictionId: nextPredictionIndex },
    {
      sender: user2,
      boxes: [
        { appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) },
        { appIndex: 0, name: combineAddressAndUint64(user2.addr, nextPredictionIndex) },
      ],
      sendParams: { fee: algokit.algos(0.002) },
    }
  );
  console.log('user2 claimed reward', user2Claim.transaction.txID());
  console.log(await getUserPrediction(Caller, user2.addr, nextPredictionIndex));
})();
