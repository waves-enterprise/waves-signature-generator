import { BaseProcessor } from "./BaseProcessor";
import { Base64Processor } from "./Base64Processor";
import { concatBytes, numberToBytes } from "@wavesenterprise/crypto-utils";
import { ContractApiVersion, StringWithLength } from "./ByteProcessor";

export type WasmParams = {
  bytecode: string,
  bytecodeHash: string
}

export type DockerParams = {
  image: string;
  imageHash: string;
  apiVersion: string;
}

class WasmStoredContract extends BaseProcessor {
  async getSignatureBytes(val: WasmParams): Promise<Uint8Array> {
    const b64processor = new Base64Processor(true, { appendLength: true })
    const stringProcessor = new StringWithLength(true)

    const codeBytes = await b64processor.getSignatureBytes(val.bytecode)
    const hashBytes = await stringProcessor.getSignatureBytes(val.bytecodeHash)

    return concatBytes(codeBytes, hashBytes)
  }
}

class DockerStoredContract extends BaseProcessor {
  async getSignatureBytes(val: DockerParams): Promise<Uint8Array> {
    const stringProcessor = new StringWithLength(true)

    return concatBytes(
      await stringProcessor.getSignatureBytes(val.image),
      await stringProcessor.getSignatureBytes(val.imageHash),
      await (new ContractApiVersion()).getSignatureBytes(String(val.apiVersion))
    )
  }
}

export class StoredContract extends BaseProcessor {
  async getSignatureBytes(val: WasmParams | DockerParams): Promise<Uint8Array> {
    let payloadBytes;

    const isWasm = 'bytecode' in val && 'bytecodeHash' in val
    const isDocker = 'apiVersion' in val && 'image' in val && 'imageHash' in val

    if (!isWasm && !isDocker) {
      throw new Error('invalid payload')
    }

    if (isWasm) {
      payloadBytes = await (new WasmStoredContract()).getSignatureBytes(val as WasmParams)
    } else {
      payloadBytes = await (new DockerStoredContract()).getSignatureBytes(val as DockerParams)
    }

    return concatBytes(numberToBytes(isWasm ? 1 : 0), payloadBytes)
  }
}
