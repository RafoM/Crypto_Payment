# HD Tron Wallet API

This project exposes a simple HTTP API for generating TRC‑20 wallets from a mnemonic name and storing only the public wallet information in MySQL. No mnemonic phrases or private keys are persisted.

## Requirements
- Node.js
- MySQL server

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Configure database credentials using environment variables:
   - `DB_HOST` (default `localhost`)
   - `DB_USER` (default `root`)
   - `DB_PASS` (default empty)
   - `DB_NAME` (default `wallets_db`)

## Running the server
Start the API server with:
```bash
npm start
```
The server listens on `PORT` (default `3000`).

## API Usage

### `POST /mnemonics`

Body parameters:
- `mnemonic` – BIP39 phrase used to derive wallets
- `name` – unique identifier for the mnemonic
- `count` – number of addresses to store

This endpoint derives `count` wallet addresses from the provided mnemonic and
saves only the address and index in the database linked to the mnemonic `name`.

### `POST /wallets/:mnemonicName`

Body parameters:
- `mnemonic` – BIP39 phrase used to reconstruct the wallets

Returns the wallets stored for the given `mnemonicName`. The mnemonic is
supplied in the request body and used only to derive the private keys in
memory.
The response format is:

```
[
  { "wallet_index": number, "address": string, "privateKey": string }
]
```
