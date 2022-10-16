import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { storeToNFTStorage, storeToWeb3Storage } from "./ipfs";
import {
  saveTablesToPDF,
  buildBalanceTable,
  buildTransactionTable,
} from "./pdfkit";
import {
  fetchAllTokenBalancesForAllAccounts,
  fetchAllTokenTransactionsForAllAccounts,
} from "./etherscan";
import bodyParser from "body-parser";
import morganBody from "morgan-body";
import { awaitAndFilter } from "./utils";
import { Contract, providers, utils, Wallet } from "ethers";
import { fetchTokenPriceBsc } from "./coingecko";
import { supportedTokens } from "./constants";
import { abi } from "./utils/contractABI";
import { addresses } from "./utils/addresses";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

const winston = require("winston");
const consoleTransport = new winston.transports.Console();
dotenv.config();
const myWinstonOptions = {
  transports: [consoleTransport],
};
const logger = new winston.createLogger(myWinstonOptions);

const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY;

const serverProviders: any = {
  "421613": new providers.JsonRpcProvider(process.env.ARBITRUM_RPC!),
  "1337": new providers.JsonRpcProvider(process.env.LOCALHOST_RPC),
};
const app: Express = express();
const port = process.env.PORT;
const tempGroup = new Group();
// parse JSON and others
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
// log all requests and responses
morganBody(app, { logAllReqHeader: true, maxBodyLength: 5000 });

app.get("/", async (req: Request, res: Response) => {
  res.send("Backend for Ethereum statements");
});

app.post("/balances", async (req: Request, res: Response) => {
  let result = await fetchAllTokenBalancesForAllAccounts(req.body.accounts);
  res.send(result);
});

app.post("/transactions", async (req: Request, res: Response) => {
  let result = await fetchAllTokenTransactionsForAllAccounts(req.body.accounts);
  res.send(result);
});

app.get("/price", async (req: Request, res: Response) => {
  let result = await fetchTokenPriceBsc(req.query.tokenAddress as string);
  res.send(result);
});

app.get("/tokens", async (req: Request, res: Response) => {
  let result = {
    supportedTokens,
  };
  res.send(result);
});

app.post("/join-protocol", async (req: Request, res: Response) => {
  const { identityCommitment,params, address, chainId } = req.body;
  try {
    const identity = new Identity(params);
    console.log("DEBUGGING JOIN", params);
    let thisContract = new Contract(
      addresses.ChainStatements[chainId],
      abi,
      new Wallet(ethereumPrivateKey!, serverProviders[chainId])
    );
    const transaction = await thisContract.addNewUser(
      identity.generateCommitment(),
      address
    );
    await transaction.wait();
    tempGroup.addMember(identity.generateCommitment())
    res.status(200).end();
  } catch (error: any) {
    console.error(error);
    res.status(500).end();
  }
});
//this one takes a different approach
app.post("/get-statement-v1", async (req: Request, res: Response) => {
  const { identityCommitment, params, name, passNum, address, chainId } =
    req.body;
  try {
    // console.log(serverProviders[chainId], req.body.address, chainId);
    const wasmFilePath = "./utils/snark-artifacts/semaphore.wasm";
    const zkeyFilePath = "./utils/snark-artifacts/semaphore.zkey";
    const signal = utils.formatBytes32String("Join Chain Statement!");
    const identity = new Identity(params);
    const fullProof = await generateProof(
      identity,
      tempGroup,
      BigInt(42),
      signal, {
        wasmFilePath,
        zkeyFilePath
      }
    );

    //can add multiple adresses

    const balTable = await buildBalanceTable(address);
    const txTable = await buildTransactionTable(address);
    const pdfFileName = "output.pdf";
    await saveTablesToPDF(
      [balTable, txTable],
      address,
      name,
      passNum,
      pdfFileName
    );

    const cids = await awaitAndFilter([
      storeToNFTStorage(pdfFileName, "statement", {
        properties: { application: "pdf" },
      }),
      storeToWeb3Storage(pdfFileName),
    ]);

    console.log(cids);

    res.send({
      nftStorage: cids[0],
      web3Storage: cids[1],
    });
    // res.status(200).end()
  } catch (error: any) {
    console.error(error);
    res.status(500).end();
  }
});

app.post("/get-statement-v2", async (req: Request, res: Response) => {
  const { signal,solidityProof,nullifierHash, merkleRoot, chainId, identityCommitment } = req.body;
  try {
    let thisContract = new Contract(
      addresses.ChainStatements[chainId],
      abi,
      new Wallet(ethereumPrivateKey!, serverProviders[chainId])
    );
    const transaction = await thisContract.claimStatement(
      identityCommitment,
      utils.formatBytes32String(signal),
      merkleRoot,
      nullifierHash,
      solidityProof
      { gasLimit: 100000 }
    );
    await transaction.wait();
    res.status(200).end();
  } catch (error: any) {
    console.error(error);
    res.status(500).end();
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
