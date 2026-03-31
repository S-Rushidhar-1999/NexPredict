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
    'task traffic usage scissors rack double rather gospel faint rebuild else hawk monitor critic cave old negative behind jaguar office proof firm copper abandon indicate'
  );

  const Caller = new AlgoPredictClient(
    {
      sender: admin,
      resolveBy: 'id',
      id: 0,
    },
    algorandClient.client.algod
  );

  await Caller.create.createApplication({});

  const { appId, appAddress } = await Caller.appClient.getAppReference();
  console.log('APP ID : ', appId);
  console.log('APP ADDRESS : ', appAddress);
  console.log('Creator Address : ', admin.addr);

  await transferTestTokens(algorandClient.client.algod, admin, appAddress, 1);
  console.log('Funded contract with 1 ALGO');
})();
