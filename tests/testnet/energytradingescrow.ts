import { Energytradingescrow } from '../../src/contracts/energytradingescrow'
import { getDefaultSigner, inputSatoshis } from '../utils/txHelper'
import { toByteString, sha256 } from 'scrypt-ts'

const message = 'hello world, sCrypt!'

async function main() {
    await Energytradingescrow.compile()
    const instance = new Energytradingescrow(sha256(toByteString(message, true)))

    // connect to a signer
    await instance.connect(getDefaultSigner())

    // contract deployment
    const deployTx = await instance.deploy(inputSatoshis)
    console.log('Energytradingescrow contract deployed: ', deployTx.id)

    // contract call
    const { tx: callTx } = await instance.methods.unlock(
        toByteString(message, true)
    )
    console.log('Energytradingescrow contract `unlock` called: ', callTx.id)
}

describe('Test SmartContract `Energytradingescrow` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
