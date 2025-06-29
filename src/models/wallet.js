const TronWeb = require('tronweb');
const bip39 = require('bip39');
const bip32 = require('bip32');

function deriveAddresses(mnemonic, count) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const addresses = [];
  for (let i = 0; i < count; i++) {
    const path = `m/44'/195'/0'/0/${i}`;
    const child = root.derivePath(path);
    const privKeyHex = child.privateKey.toString('hex');
    const address = TronWeb.address.fromPrivateKey(privKeyHex);
    addresses.push({ index: i, privateKey: privKeyHex, address });
  }
  return addresses;
}

module.exports = { deriveAddresses };
