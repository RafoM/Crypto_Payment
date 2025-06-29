const { TronWeb } = require('tronweb');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');

const bip32 = BIP32Factory(ecc); // Required initialization

function deriveAddresses(mnemonic, count) {
  console.log('mnemonic', mnemonic);
  const seed = bip39.mnemonicToSeedSync(mnemonic); // Convert mnemonic to seed
  console.log('seed', seed);
  const root = bip32.fromSeed(seed);               // Get root node
  console.log('root', root);
  const pathPrefix = `m/44'/195'/0'/0`;             // TRON's BIP44 path (coin_type = 195) last zero stands for that adresses are external

  const addresses = [];

  for (let i = 0; i < count; i++) {
    const child = root.derivePath(`${pathPrefix}/${i}`); // Derive child key
    console.log(`child N:${i} `, child);
    const privKeyHex = Buffer.from(child.privateKey).toString('hex');
    if (!privKeyHex || privKeyHex.length !== 64) {
      throw new Error("Invalid private key format");
    }
    console.log(`privateKeyHEx N:${i} `, privKeyHex);
    const address = TronWeb.address.fromPrivateKey(privKeyHex); // Get TRON address
    console.log(`adress N:${i} `, address);
    addresses.push({ index: i, privateKey: privKeyHex, address });
  }

  return addresses;
}

module.exports = { deriveAddresses };
