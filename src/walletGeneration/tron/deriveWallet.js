const { TronWeb } = require('tronweb');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');

const bip32 = BIP32Factory(ecc);

function deriveWallet(mnemonic, index) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const pathPrefix = `m/44'/195'/0'/0`;
  const child = root.derivePath(`${pathPrefix}/${index}`);
  const privKeyHex = Buffer.from(child.privateKey).toString('hex');
  const address = TronWeb.address.fromPrivateKey(privKeyHex);
  return { wallet_index: index, address, privateKey: privKeyHex };
}

module.exports = deriveWallet;
