import { EnergyTradingEscrow } from './src/contracts/energytradingescrow';
import {
    bsv,
    TestWallet,
    DefaultProvider,
    hash160, // Use hash160 for PubKeyHash
    toByteString,
} from 'scrypt-ts';

import * as dotenv from 'dotenv';

// Load the .env file
dotenv.config();

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || 'cPz4rSWP8FDenC622dZ39oiLUjCJrzbRDGF4QYQNkfYcxZF9GDqQ');

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new TestWallet(
    privateKey,
    new DefaultProvider({
        network: bsv.Networks.testnet,
    })
);

async function main() {
    await EnergyTradingEscrow.compile();

    // TODO: Adjust the constructor parameter values:
    const sellerPubKeyHash = hash160(toByteString('seller public key', true)); // Use hash160 for PubKeyHash
    const buyerPubKeyHash = hash160(toByteString('buyer public key', true));   // Use hash160 for PubKeyHash
    const unitPrice = 1n; // Replace 100n with the actual unit price in satoshis

    // Create an instance of the contract with the correct constructor parameters:
    const instance = new EnergyTradingEscrow(sellerPubKeyHash, buyerPubKeyHash, unitPrice);

    // Connect to a signer.
    await instance.connect(signer);

    // Contract deployment.
    const deployTx = await instance.deploy();
    console.log(`EnergyTradingEscrow contract deployed: ${deployTx.id}`);
}

main();
