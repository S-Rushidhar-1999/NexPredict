import algosdk from "algosdk";
export const getNextPredictionIndex = async (Caller) => {
  const global = await Caller.getGlobalState();
  return global.predictionIndex?.asNumber();
};


export function combineAddressAndUint64(address, uint64) {
  const addressbuffer = algosdk.decodeAddress(address).publicKey;
  const uint64buffer = algosdk.bigIntToBytes(uint64, 8);
  const combinedbuffer = new Uint8Array(40);
  combinedbuffer.set(addressbuffer, 0);
  combinedbuffer.set(uint64buffer, 32);
  return combinedbuffer;
}

export const getPrediction = async (Caller, index) => {
  try {
    const predictionType = algosdk.ABIType.from('(uint64,uint64,uint64,uint64,uint8,uint64,string,string,string,string,string)');
    const prediction = await Caller.appClient.getBoxValueFromABIType(
      algosdk.bigIntToBytes(index, 8),
      predictionType
    );
    return {
      option1SharesBhougth: prediction[0],
      option2SharesBhougth: prediction[1],
      startsAt: prediction[2],
      endsAt: prediction[3],
      result: prediction[4],
      noOfUsers: prediction[5],
      question: prediction[6],
      option1: prediction[7],
      option2: prediction[8],
      category: prediction[9],
      image: prediction[10],
    };
  } catch (e) {
    return null;
  };

};

export const getUserPrediction = async (Caller, user, index) => {
  try {
    const predictionType = algosdk.ABIType.from('(uint8,uint64,uint8)');
    const prediction = await Caller.appClient.getBoxValueFromABIType(
      combineAddressAndUint64(user, index),
      predictionType
    );
    return {
      option: prediction[0],
      amount: prediction[1],
      claimed: prediction[2],
    };
  }
  catch (e) {
    return null;
  }

};

export function base64ToUint8Array(base64) {
  const binaryString = atob(base64); // Decode the Base64 string to binary
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}



//write a function which will take a amount number and return a string by denomination of amount like 10k, 10m, 10b, 10t.
export function formatAmount(amount) {
  if (amount < 1000) {
    return amount.toString();
  }
  if (amount < 1000000) {
    return (amount / 1000).toFixed(2) + "k";
  }
  if (amount < 1000000000) {
    return (amount / 1000000).toFixed(2) + "m";
  }
  if (amount < 1000000000000) {
    return (amount / 1000000000).toFixed(2) + "b";
  }
  return (amount / 1000000000000).toFixed(2) + "t";
}
