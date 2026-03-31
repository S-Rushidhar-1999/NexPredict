import { Contract } from '@algorandfoundation/tealscript';

type Prediction = {
  option1SharesBhougth: uint64;
  option2SharesBhougth: uint64;
  startsAt: uint64;
  endsAt: uint64;
  result: uint8;
  noOfUsers: uint64;
  question: string;
  option1: string;
  option2: string;
  category: string;
  image: string;
};

type UserPredictionKey = {
  user: Address;
  predictionId: uint64;
};

type UserPredictionValue = {
  option: uint8;
  amount: uint64;
  claimed: uint8;
};

export class AlgoPredict extends Contract {
  predictionIndex = GlobalStateKey<uint64>();

  admin = GlobalStateKey<Address>();

  predictions = BoxMap<uint64, Prediction>({ allowPotentialCollisions: false });

  userPredictions = BoxMap<UserPredictionKey, UserPredictionValue>();

  createApplication(): void {
    this.predictionIndex.value = 0;
    this.admin.value = this.txn.sender;
  }

  addPrediction(
    question: string,
    option1Name: string,
    option2Name: string,
    startsAt: uint64,
    endsAt: uint64,
    category: string,
    image: string
  ): uint64 {
    assert(startsAt < endsAt, 'startsAt should be less than endsAt');
    assert(this.txn.sender === this.admin.value, 'Only admin can add prediction');
    const newPrediction: Prediction = {
      question: question,
      option1SharesBhougth: 0,
      option2SharesBhougth: 0,
      option1: option1Name,
      option2: option2Name,
      startsAt: startsAt,
      endsAt: endsAt,
      result: 0,
      category: category,
      image: image,
      noOfUsers: 0,
    };
    this.predictions(this.predictionIndex.value).value = newPrediction;
    this.predictionIndex.value = this.predictionIndex.value + 1;
    return this.predictionIndex.value - 1;
  }

  buyShares(predictionId: uint64, option: uint8, amount: uint64, payTxn: PayTxn): void {
    assert(this.predictions(predictionId).exists, 'Prediction does not exist');
    const prediction = this.predictions(predictionId).value;
    assert(globals.latestTimestamp >= prediction.startsAt, 'Prediction has not started yet');
    assert(globals.latestTimestamp < prediction.endsAt, 'Prediction has ended');
    assert(option === 1 || option === 2, 'Invalid option');
    assert(prediction.result === 0, 'Prediction result is already set');
    const predictionKey: UserPredictionKey = { user: this.txn.sender, predictionId: predictionId };
    const hasUserBuyedPreviously = this.userPredictions(predictionKey).exists;
    if (hasUserBuyedPreviously) {
      const previousShares = this.userPredictions(predictionKey).value;
      if (previousShares.option === option) {
        if (previousShares.amount > amount) {
          const diff = previousShares.amount - amount;
          if (option === 1) {
            prediction.option1SharesBhougth = prediction.option1SharesBhougth - diff;
          } else {
            prediction.option2SharesBhougth = prediction.option2SharesBhougth - diff;
          }
          sendPayment({ amount: diff, receiver: this.txn.sender });
        } else {
          const diff = amount - previousShares.amount;
          if (option === 1) {
            prediction.option1SharesBhougth = prediction.option1SharesBhougth + diff;
          } else {
            prediction.option2SharesBhougth = prediction.option2SharesBhougth + diff;
          }
          verifyPayTxn(payTxn, { receiver: this.app.address, amount: { greaterThanEqualTo: diff } });
        }
      } else if (previousShares.amount > amount) {
        const diff = previousShares.amount - amount;
        if (option === 1) {
          prediction.option1SharesBhougth = prediction.option1SharesBhougth + amount;
          prediction.option2SharesBhougth = prediction.option2SharesBhougth - previousShares.amount;
        } else {
          prediction.option2SharesBhougth = prediction.option2SharesBhougth + amount;
          prediction.option1SharesBhougth = prediction.option1SharesBhougth - previousShares.amount;
        }
        sendPayment({ amount: diff, receiver: this.txn.sender });
      } else {
        const diff = amount - previousShares.amount;
        if (option === 1) {
          prediction.option1SharesBhougth = prediction.option1SharesBhougth + amount;
          prediction.option2SharesBhougth = prediction.option2SharesBhougth - previousShares.amount;
        } else {
          prediction.option2SharesBhougth = prediction.option2SharesBhougth + amount;
          prediction.option1SharesBhougth = prediction.option1SharesBhougth - previousShares.amount;
        }
        verifyPayTxn(payTxn, { receiver: this.app.address, amount: { greaterThanEqualTo: diff } });
      }
      this.userPredictions(predictionKey).value = {
        option: option,
        amount: amount,
        claimed: 0,
      };
    } else {
      if (option === 1) {
        prediction.option1SharesBhougth = prediction.option1SharesBhougth + amount;
      } else {
        prediction.option2SharesBhougth = prediction.option2SharesBhougth + amount;
      }
      prediction.noOfUsers = prediction.noOfUsers + 1;
      verifyPayTxn(payTxn, { receiver: this.app.address, amount: { greaterThanEqualTo: amount } });
      this.userPredictions(predictionKey).value = {
        option: option,
        amount: amount,
        claimed: 0,
      };
    }
  }

  endPrediction(predictionId: uint64, result: uint8): void {
    assert(this.txn.sender === this.app.creator, 'Only creator can end prediction');
    assert(this.predictions(predictionId).exists, 'Prediction does not exist');
    const prediction = this.predictions(predictionId).value;
    assert(globals.latestTimestamp >= prediction.endsAt, 'Prediction has not ended yet');
    assert(prediction.result === 0, 'Prediction result is already set');
    prediction.result = result;
  }

  claimReward(predictionId: uint64): void {
    assert(this.predictions(predictionId).exists, 'Prediction does not exist');
    const prediction = this.predictions(predictionId).value;
    assert(globals.latestTimestamp >= prediction.endsAt, 'Prediction has not ended yet');
    assert(prediction.result !== 0, 'Prediction result is not set yet');
    const predictionKey: UserPredictionKey = { user: this.txn.sender, predictionId: predictionId };
    assert(this.userPredictions(predictionKey).exists, 'User has not bought shares');
    const userPrediction = this.userPredictions(predictionKey).value;
    assert(userPrediction.claimed === 0, 'User has already claimed reward');
    const totalShares = prediction.option1SharesBhougth + prediction.option2SharesBhougth;
    let reward = 1 * userPrediction.amount;
    if (prediction.result === 1) {
      reward = (totalShares * userPrediction.amount) / prediction.option1SharesBhougth;
    } else if (prediction.result === 2) {
      reward = (totalShares * userPrediction.amount) / prediction.option2SharesBhougth;
    }
    if (prediction.result !== 3 && prediction.result !== userPrediction.option) {
      reward = 0;
    }
    sendPayment({ amount: reward, receiver: this.txn.sender, note: 'reward-' + predictionId.toString() });
    this.userPredictions(predictionKey).value = {
      option: userPrediction.option,
      amount: userPrediction.amount,
      claimed: 1,
    };
  }
}
