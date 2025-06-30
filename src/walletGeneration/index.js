const tronGenerateWallets = require('./tron/generateWallets');

function generateWallets(blockchain, mnemonic, count) {
  if (!blockchain) throw new Error('blockchain is required');
  switch (blockchain.toLowerCase()) {
    case 'tron':
      return tronGenerateWallets(mnemonic, count);
    default:
      throw new Error(`Unsupported blockchain: ${blockchain}`);
  }
}

module.exports = { generateWallets };
