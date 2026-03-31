import { AlgoPredictClient } from "./contracts/AlgoPredict";
import * as algokit from "@algorandfoundation/algokit-utils";

// Load configuration from environment variables
export const APP_ID = Number(import.meta.env.VITE_APP_ID);
export const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS;
export const APP_ADMIN = import.meta.env.VITE_APP_ADMIN;
export const TXN_URL = "https://lora.algokit.io/testnet/transaction/";

// Always use TestNet
export const algorandClient = algokit.AlgorandClient.testNet();

export const Caller = new AlgoPredictClient(
  {
    resolveBy: "id",
    id: APP_ID,
  },
  algorandClient.client.algod
);
