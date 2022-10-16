# Ethereum Statements

## How to start developing
```bash
    npm run install
    npm run dev
```

It will auto-restart on code changes.

<br/>

## API
> Note that some supposedly GET requests use POST method to allow efficient argument passing, use JSON as request body

### External
1. `POST /get-statement-v1` <br/>
    Input: the following <br/>
    ```json
    {
    "identityCommitment" : "xxxxx",
    "params" : "Xxxxxx",
    "name" : "xxxxxx",
    "passNum" : "xxxxxxx",
    "address" : "xxxxxx",
    "chainId" : 1337
    }
    ```
    Output: CID that points to a PDF statement file stored on IPFS
    ```json
    {
    "nft.storage cid:": "bafyreiggnhnvcxjphiqyyhhw7qeg4hcosuoufroxbkc7jas3do5xlsyski",
    "web3.storage cid:": "bafybeicw5brv5rrmg4smvr7khxf4uzm5szrmpdjnlxzwr2nzujgel7teia"
    }
    ```

<br/>

2. `POST /get-statement-v2` <br/>
    Input: the following <br/>
    ```json
    {
    "identityCommitment" : "xxxxx",
    "params" : "Xxxxxx",
    "name" : "xxxxxx",
    "passNum" : "xxxxxxx",
    "address" : "xxxxxx",
    "chainId" : 1337
    }
    ```
    ```
    Output: CID that points to a PDF statement file stored on IPFS
    ```json
    {
    "nft.storage cid:": "bafyreiggnhnvcxjphiqyyhhw7qeg4hcosuoufroxbkc7jas3do5xlsyski",
    "web3.storage cid:": "bafybeicw5brv5rrmg4smvr7khxf4uzm5szrmpdjnlxzwr2nzujgel7teia"
    }
    ```

<br/>

## Implementation
### PDF programmatic generation
1. PDFKit
2. PDFKit-table

### IPFS upload
1. NFT.storage
2. web3.storage (backup)

### On chain data retrieval
1. Etherscan

### USD price
1. Coingecko