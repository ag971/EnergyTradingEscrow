import { expect, use } from 'chai';
import { MethodCallOptions, toByteString, SignatureResponse, Sig } from 'scrypt-ts';
import { EnergyTradingEscrow } from '../../src/contracts/energytradingescrow';
import { getDummySigner, getDummyUTXO } from '../utils/txHelper';
import chaiAsPromised from 'chai-as-promised';
import { Sha256, Ripemd160 } from 'scrypt-ts';
use(chaiAsPromised);

describe('Test SmartContract EnergyTradingEscrow', () => {
  let instance: EnergyTradingEscrow;

  type PubKeyHash = Sha256;

  before(async () => {
    await EnergyTradingEscrow.compile();
    // Use 'Ripemd160' instead of 'Sha256' to create the hash values for the constructor parameters
    const sellerPubKeyHash = Ripemd160(toByteString('sellerPublicKey', true));
    const buyerPubKeyHash = Ripemd160(toByteString('buyerPublicKey', true));
    const unitPrice = 100n;
    instance = new EnergyTradingEscrow(sellerPubKeyHash, buyerPubKeyHash, unitPrice);
    await instance.connect(getDummySigner());
  });

  it('should buy energy successfully', async () => {
    // Perform the buyEnergy method call with the appropriate parameters
    const buyerPubKey = toByteString('buyerPublicKey', true);
    const buyerSig = toByteString('buyerSignature', true);
    const { tx: callTx, atInputIndex } = await instance.methods.buyEnergy(buyerPubKey, buyerSig, {
      fromUTXO: getDummyUTXO(),
    } as MethodCallOptions<EnergyTradingEscrow>);

    const result = callTx.verifyScript(atInputIndex);
    expect(result.success, result.error).to.be.true;
  });

  it('should deposit energy successfully', async () => {
    // Perform the depositEnergy method call with the appropriate parameters
    const sellerPubKey = toByteString('sellerPublicKey', true);
    const sellerSig = toByteString('sellerSignature', true);
    const energy = 500n; // Specify the amount of energy to deposit
    const { tx: callTx, atInputIndex } = await instance.methods.depositEnergy(sellerSig, sellerPubKey, energy, {
      fromUTXO: getDummyUTXO(),
    } as MethodCallOptions<EnergyTradingEscrow>);

    const result = callTx.verifyScript(atInputIndex);
    expect(result.success, result.error).to.be.true;
  });

  it('should refund successfully', async () => {
    // Perform the refund method call with the appropriate parameters
    const buyerPubKey = toByteString('buyerPublicKey', true);
    const buyerSig = toByteString('buyerSignature', true);
    const energy = 200n; // Specify the amount of energy to refund
    const { tx: callTx, atInputIndex } = await instance.methods.refund(buyerPubKey, buyerSig, energy, {
      fromUTXO: getDummyUTXO(),
    } as MethodCallOptions<EnergyTradingEscrow>);

    const result = callTx.verifyScript(atInputIndex);
    expect(result.success, result.error).to.be.true;
  });

  it('should throw with insufficient energy balance during refund', async () => {
    // Try to refund an amount of energy greater than the current balance (it should throw an error)
    const buyerPubKey = toByteString('buyerPublicKey', true);
    const buyerSig = toByteString('buyerSignature', true);
    const energy = 1000n; // Specify an amount of energy greater than the current balance
    return expect(
      instance.methods.refund(buyerPubKey, buyerSig, energy, {
        fromUTXO: getDummyUTXO(),
      } as MethodCallOptions<EnergyTradingEscrow>)
    ).to.be.rejectedWith(/Insufficient energy balance to refund/);
  });

});
