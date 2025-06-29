# HD Tron Wallet API

This project exposes a simple HTTP API for generating TRC‑20 wallets from a mnemonic and storing them in MySQL.

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
`POST /wallets`

Body parameters:
- `count` – number of addresses to derive (default `1`)
- `mnemonic` – optional existing mnemonic. If omitted, a new one is generated.

Example request using `curl`:
```bash
curl -X POST http://localhost:3000/wallets \
  -H 'Content-Type: application/json' \
  -d '{"count":2,"mnemonic":"your mnemonic here"}'
```
The response contains the mnemonic and a list of derived wallets.
