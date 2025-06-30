const { TronWeb } = require('tronweb');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');

const bip32 = BIP32Factory(ecc); // Required initialization

function generateWallets(mnemonic, count) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const pathPrefix = `m/44'/195'/0'/0`;

  const addresses = [];

  for (let i = 0; i < count; i++) {
    const child = root.derivePath(`${pathPrefix}/${i}`);
    const privKeyHex = Buffer.from(child.privateKey).toString('hex');
    const address = TronWeb.address.fromPrivateKey(privKeyHex);
    addresses.push({ index: i, privateKey: privKeyHex, address });
  }

  return addresses;
}

module.exports = generateWallets;
