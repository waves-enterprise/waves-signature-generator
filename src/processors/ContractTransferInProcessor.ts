import {BaseProcessor} from "./BaseProcessor";
import {Base58Processor} from "./Base58Processor";
import {LongProcessor} from "./LongProcessor";
import {concatBytes} from "@wavesenterprise/crypto-utils";

export type ContractPayment = {
    assetId: string,
    amount: number
}

export class ContractTransferInProcessor extends BaseProcessor<ContractPayment> {
    async getSignatureBytes(val: ContractPayment): Promise<Uint8Array> {
        const assetIdProcessor = new Base58Processor(true)
        const amountProcessor = new LongProcessor(true)

        const assetId = await assetIdProcessor.getSignatureBytes(val.assetId)
        const amount = await amountProcessor.getSignatureBytes(val.amount)

        const keyBytes = concatBytes(assetId, amount)

        return Promise.resolve(keyBytes)
    }
}
