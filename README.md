# HD Wallet API

This project exposes a simple HTTP API for generating cryptocurrency wallets from a mnemonic name and storing only the public wallet information in MySQL. No mnemonic phrases or private keys are persisted. Wallet generation logic is modular and currently supports the TRON blockchain.

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

The server exposes REST style endpoints. Unless stated otherwise, JSON is both
accepted and returned. Each section below describes the request body, required
parameters and the shape of the response. Validation errors return HTTP `400`
with a JSON object in the form `{ "error": string }`.

### `POST /mnemonics`

Creates a mnemonic name entry. The mnemonic phrase itself is **never**
persisted.

**Body**

```json
{
  "name": "example-name"
}
```

- `name` – required and must be unique.

**Response**

```json
{ "id": number, "name": string }
```

### `GET /mnemonics`

Returns an array of stored mnemonic names.

**Response**

```json
[ { "id": number, "name": string }, ... ]
```

### `POST /generate-wallets`

Generate and store wallet addresses.

**Body**

```json
{
  "blockchain": "tron",
  "mnemonic": "bip39 phrase",
  "name": "mnemonic-name",
  "count": 2,
  "paymentMethodId": 1
}
```

- `blockchain` – required blockchain identifier (currently only `tron`).
- `mnemonic` – required BIP39 phrase used for derivation.
- `name` – required mnemonic name.
- `count` – optional number of addresses to generate (defaults to `1`).
- `paymentMethodId` – required existing payment method ID.

If `paymentMethodId` does not exist, a validation error is returned.

**Response**

```json
{
  "mnemonicName": string,
  "paymentMethodId": number,
  "blockchain": string,
  "wallets": [
    { "wallet_index": number, "address": string }
  ]
}
```

### `GET /wallets`

Lists all stored wallets with blockchain and crypto information.

**Response**

```json
[{
  "id": number,
  "mnemonic_id": number,
  "wallet_index": number,
  "address": string,
  "blockchain": string,
  "crypto": string
}]
```

### `POST /wallets/retrievePrivateKeys`

Retrieve private keys for previously stored wallets.

**Body**

```json
{
  "mnemonic": "bip39 phrase",
  "mnemonicName": "existing-name"
}
```

- `mnemonic` – required; used only in memory to derive the keys.
- `mnemonicName` – required name of the mnemonic entry.

If the name does not exist an empty array is returned.

**Response**

```json
[ { "wallet_index": number, "address": string, "privateKey": string } ]
```

## Blockchain & Crypto Management

### `GET /blockchains`

List all blockchains.

### `GET /blockchains/:id`

Retrieve a single blockchain by ID.

### `POST /blockchains`

Create a blockchain entry.

**Body**

```json
{
  "name": "TRON",
  "symbol": "TRX",
  "wallet_generation_supported": true
}
```

- `name` and `symbol` are required.
- `wallet_generation_supported` is optional and defaults to `false`.

**Response** – created blockchain object.

### `PUT /blockchains/:id`

Update an existing blockchain. Only supplied fields are updated.

### `DELETE /blockchains/:id`

Delete a blockchain.

### `GET /cryptos`

List all cryptos.

### `GET /cryptos/:id`

Retrieve a single crypto by ID.

### `POST /cryptos`

Create a crypto entry.

**Body**

```json
{ "name": "Tether", "symbol": "USDT" }
```

- Both `name` and `symbol` are required.

**Response** – created crypto object.

### `PUT /cryptos/:id`

Update an existing crypto.

### `DELETE /cryptos/:id`

Delete a crypto.

## Payment Methods

### `GET /payment-methods`

List all payment methods with their blockchain and crypto info.

### `GET /payment-methods/:id`

Retrieve a single payment method by ID.

### `POST /payment-methods`

Create a payment method.

**Body**

```json
{
  "blockchain_id": 1,
  "crypto_id": 1,
  "status": "active"
}
```

- `blockchain_id` and `crypto_id` must reference existing rows and the pair must
  be unique.
- `status` defaults to `active`.

**Response** – created payment method object.

### `PUT /payment-methods/:id`

Update an existing payment method.

### `DELETE /payment-methods/:id`

Delete a payment method.

### `GET /payment-methods/active`

List active payment methods where the blockchain supports wallet generation.
## Wallet Assignments

### `GET /wallet-assignments`

List all wallet assignments.

### `GET /wallet-assignments/:id`

Retrieve a wallet assignment.

### `POST /wallet-assignments`

Create a wallet assignment. Useful for manual management.

**Body**

```json
{
  "wallet_id": 1,
  "expected_amount": "10.5",
  "description": "optional text",
  "expires_at": "2025-07-01T12:00:00Z"
}
```

**Response** – created wallet assignment object.

### `PUT /wallet-assignments/:id`

Update a wallet assignment.

### `DELETE /wallet-assignments/:id`

Remove a wallet assignment.

### `POST /wallet-assignments/request-address`

Request an unused wallet for an active payment method.

**Body**

```json
{
  "blockchain": "TRX",
  "crypto": "USDT",
  "expected_amount": "10.5",
  "description": "Invoice #123"
}
```

- `blockchain` and `crypto` are required and identify the payment method.
- `expected_amount` and `description` are optional.

**Response**

```json
{
  "wallet_address": "TXYZ...",
  "expires_at": "2025-07-01T12:30:00Z",
  "expected_amount": "10.5"
}
```

### `GET /wallet-assignments/track/:walletAddress`

Track the status of a wallet assignment.

**Response**

```json
{
  "status": "assigned",
  "assigned_at": "2025-06-30T10:00:00Z",
  "paid_at": null,
  "expires_at": "2025-07-01T12:30:00Z"
}
```

Expired assignments automatically move to the `expired` status and cannot be reassigned.

