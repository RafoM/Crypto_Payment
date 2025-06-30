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
- `name` – unique identifier for the mnemonic

Creates a mnemonic entry. The phrase itself is **not** saved.

### `GET /mnemonics`

Returns the list of mnemonic names stored in the database.

### `POST /wallets`

Body parameters:
- `mnemonic` – BIP39 phrase used to derive wallets
- `name` – mnemonic name to associate with the generated wallets
- `count` – number of addresses to store

Derives `count` addresses from the mnemonic and saves only their index and
address in the database linked to `name`.

### `POST /wallets/retrievePrivateKeys`

Body parameters:
- `mnemonic` – BIP39 phrase used to reconstruct the wallets
- `mnemonicName` – identifier of the stored mnemonic

Returns the wallets stored for the given `mnemonicName`. The mnemonic is
supplied in the request body and used only to derive the private keys in
memory.
The response format is:

```
[
  { "wallet_index": number, "address": string, "privateKey": string }
]
```
