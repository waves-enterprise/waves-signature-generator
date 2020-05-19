// import {PERMISSION_TRANSACTION_ROLE, PERMISSION_TRANSACTION_OPERATION_TYPE} from '../constants'

export interface ISignatureGenerator {

    getSignature(privateKey: string): Promise<string>;

    getBytes(): Promise<Uint8Array>;

    getExactBytes(fieldName: string): Promise<Uint8Array>;
}

export interface ISignatureGeneratorConstructor<T> {
    new(data: T): ISignatureGenerator;
}

export interface IDEFAULT_PROPS {
    senderPublicKey: string;
    timestamp: number;
}

export interface IPERMIT_PROPS extends IDEFAULT_PROPS {
    fee: string;
    target: string;
    dueTimestamp: number;
    role: string;
    opType: string;
}

export interface IISSUE_PROPS extends IDEFAULT_PROPS {
    name: string;
    description: string;
    quantity: string;
    precision: number;
    reissuable: boolean;
    fee: string;
}

export interface ITRANSFER_PROPS extends IDEFAULT_PROPS {
    assetId: string;
    feeAssetId: string;
    amount: string;
    fee: string;
    recipient: string;
    attachment: string;
}

export interface IREISSUE_PROPS extends IDEFAULT_PROPS {
    assetId: string;
    quantity: string;
    reissuable: boolean;
    fee: string;
}

export interface IBURN_PROPS extends IDEFAULT_PROPS {
    assetId: string;
    quantity: string;
    fee: string;
}

export interface ILEASE_PROPS extends IDEFAULT_PROPS {
    recipient: string;
    amount: string;
    fee: string;
}

export interface ICANCEL_LEASING_PROPS extends IDEFAULT_PROPS {
    fee: string;
    transactionId: string;
}

export interface ICREATE_ALIAS_PROPS extends IDEFAULT_PROPS {
    alias: string;
    fee: string;
}

export interface IMASS_TRANSFER_PROPS extends IDEFAULT_PROPS {
    assetId: string;
    transfers: Array<IMASS_TRANSFER_TRANSFERS>;
    fee: string;
    attachment: string;
}

export interface IDATA_PROPS extends IDEFAULT_PROPS {
    authorPublicKey: string;
    data: Array<IDATA_ENTRY>;
    fee: string;
}

export interface IORDER_PROPS extends IDEFAULT_PROPS {
    matcherPublicKey: string;
    amountAsset: string;
    priceAsset: string;
    orderType: string;
    price: string;
    amount: string;
    expiration: number;
    matcherFee: string;
}

export interface ICANCEL_ORDER_PROPS {
    senderPublicKey: string;
    orderId: string;
}

export interface IMASS_TRANSFER_TRANSFERS {
    recipient: string;
    amount: string;
}


export interface ISET_SCRIPT_PROPS extends IDEFAULT_PROPS {
    script: string;
    chainId: number;
    fee: string;
}

export interface ISPONSORSHIP_PROPS extends IDEFAULT_PROPS {
    assetId: string;
    minSponsoredAssetFee: string;
    fee: string;
}

export interface IDOCKERCALL_PROPS extends IDEFAULT_PROPS {
    contractId: string;
    params: Array<IDATA_ENTRY>;
    fee: string;
}

export interface IDOCKERCALL_V2_PROPS extends IDOCKERCALL_PROPS {
    contractVersion: number;
}

export interface IDOCKERCREATE_PROPS extends IDEFAULT_PROPS {
    params: Array<IDATA_ENTRY>;
    fee: string;
    imageHash: string;
    image: string;
    contractName: string;
}

export interface IDOCKERCREATE_V2_PROPS extends IDOCKERCREATE_PROPS {
    feeAssetId: string;
}

export interface IDOCKERDISABLE_PROPS extends IDEFAULT_PROPS {
    fee: string;
    contractId: string;
}


// policy

export interface IPOLICY_REGISTER_NODE_PROPS extends IDEFAULT_PROPS {
    opType: string;
    nodeName: string;
}

export interface IPOLICY_CREATE_PROPS extends IDEFAULT_PROPS {
    description: string;
    policyName: string;
    recipients: string[];
    owners: string[];
}

export interface IPOLICY_UPDATE_PROPS extends IDEFAULT_PROPS {
    opType: string;
    policyId: string;
    recipients: string[];
    owners: string[];
}

export interface IDATA_ENTRY {
    key: string;
    type: string;
    value: any;
}

export type TTX_NUMBER_MAP = {
    3: ISignatureGeneratorConstructor<IISSUE_PROPS>;
    4: ISignatureGeneratorConstructor<ITRANSFER_PROPS>;
    5: ISignatureGeneratorConstructor<IREISSUE_PROPS>;
    6: ISignatureGeneratorConstructor<IBURN_PROPS>;
    7: ISignatureGeneratorConstructor<ILEASE_PROPS>;
    8: ISignatureGeneratorConstructor<ILEASE_PROPS>;
    9: ISignatureGeneratorConstructor<ICANCEL_LEASING_PROPS>;
    10: ISignatureGeneratorConstructor<ICREATE_ALIAS_PROPS>;
    11: ISignatureGeneratorConstructor<IMASS_TRANSFER_PROPS>;
    12: ISignatureGeneratorConstructor<IDATA_PROPS>;
    13: ISignatureGeneratorConstructor<ISET_SCRIPT_PROPS>;
    14: ISignatureGeneratorConstructor<ISPONSORSHIP_PROPS>;
    102: ISignatureGeneratorConstructor<IPERMIT_PROPS>;
    103: ISignatureGeneratorConstructor<IDOCKERCREATE_PROPS>;
    104: ISignatureGeneratorConstructor<IDOCKERCALL_PROPS>;
    106: ISignatureGeneratorConstructor<IDOCKERDISABLE_PROPS>;
    111: ISignatureGeneratorConstructor<IPOLICY_REGISTER_NODE_PROPS>;
    112: ISignatureGeneratorConstructor<IPOLICY_CREATE_PROPS>;
    113: ISignatureGeneratorConstructor<IPOLICY_UPDATE_PROPS>;
}

export type TTX_TYPE_MAP = {
    issue: ISignatureGeneratorConstructor<IISSUE_PROPS>;
    transfer: ISignatureGeneratorConstructor<ITRANSFER_PROPS>;
    reissue: ISignatureGeneratorConstructor<IREISSUE_PROPS>;
    burn: ISignatureGeneratorConstructor<IBURN_PROPS>;
    exchange: ISignatureGeneratorConstructor<ILEASE_PROPS>;
    lease: ISignatureGeneratorConstructor<ILEASE_PROPS>;
    cancelLeasing: ISignatureGeneratorConstructor<ICANCEL_LEASING_PROPS>;
    createAlias: ISignatureGeneratorConstructor<ICREATE_ALIAS_PROPS>;
    massTransfer: ISignatureGeneratorConstructor<IMASS_TRANSFER_PROPS>;
    data: ISignatureGeneratorConstructor<IDATA_PROPS>;
    setScript: ISignatureGeneratorConstructor<ISET_SCRIPT_PROPS>;
    sponsorship: ISignatureGeneratorConstructor<ISPONSORSHIP_PROPS>;
    permit: ISignatureGeneratorConstructor<IPERMIT_PROPS>;

    dockerCreate: ISignatureGeneratorConstructor<IDOCKERCREATE_PROPS>;
    dockerCreateV2: ISignatureGeneratorConstructor<IDOCKERCREATE_V2_PROPS>;
    dockerCall: ISignatureGeneratorConstructor<IDOCKERCALL_PROPS>;
    dockerCallV2: ISignatureGeneratorConstructor<IDOCKERCALL_V2_PROPS>;
    dockerDisable: ISignatureGeneratorConstructor<IDOCKERDISABLE_PROPS>;

    policyRegisterNode: ISignatureGeneratorConstructor<IPOLICY_REGISTER_NODE_PROPS>;
    policyCreate: ISignatureGeneratorConstructor<IPOLICY_CREATE_PROPS>;
    policyUpdate: ISignatureGeneratorConstructor<IPOLICY_UPDATE_PROPS>;
}
