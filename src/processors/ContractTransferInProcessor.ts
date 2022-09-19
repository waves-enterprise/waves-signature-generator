import {BaseProcessor} from "./BaseProcessor";
import {Base58Processor} from "./Base58Processor";
import {LongProcessor} from "./LongProcessor";
import {concatBytes} from "@wavesenterprise/crypto-utils";

export type ContractPayment = {
    assetId?: string,
    amount: number
}

export class ContractTransferInProcessor extends BaseProcessor<ContractPayment> {
    async getSignatureBytes(val: ContractPayment): Promise<Uint8Array> {
        const assetIdProcessor = new Base58Processor(false)
        const amountProcessor = new LongProcessor(true)

        const existanceBytes = val.assetId
            ? new Uint8Array([1])
            : new Uint8Array([0])

        const amount = await amountProcessor.getSignatureBytes(val.amount)

        if (val.assetId) {
            const assetId = await assetIdProcessor.getSignatureBytes(val.assetId)

            return Promise.resolve(concatBytes(existanceBytes, assetId, amount))
        }

        const keyBytes = concatBytes(existanceBytes, amount)

        return Promise.resolve(keyBytes)
    }
}
