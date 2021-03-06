export const PERMISSION_TRANSACTION_ROLE = {
    MINER: 'miner',
    ISSUER: 'issuer',
    DEX: 'dex',
    PERMISSIONER: 'permissioner',
    BLACKLISTER: 'blacklister',
    BANNED: 'banned',
    CONTRACT_DEVELOPER: 'contract_developer',
    CONNECTION_MANAGER: 'connection_manager'
};

export const PERMISSION_TRANSACTION_ROLE_BYTE = {
    MINER: 1,
    ISSUER: 2,
    DEX: 3,
    PERMISSIONER: 4,
    BLACKLISTER: 5,
    BANNED: 6,
    CONTRACT_DEVELOPER: 7,
    CONNECTION_MANAGER: 8
};

export const enum PERMISSION_TRANSACTION_OPERATION_TYPE {
    ADD = 'add',
    REMOVE = 'remove'
}

const PERMISSION_TRANSACTION_OPERATION_TYPE_ADD_BYTE = 'a'.charCodeAt(0);
const PERMISSION_TRANSACTION_OPERATION_TYPE_REMOVE_BYTE = 'r'.charCodeAt(0);

export const PERMISSION_TRANSACTION_OPERATION_TYPE_BYTE = {
    ADD: PERMISSION_TRANSACTION_OPERATION_TYPE_ADD_BYTE,
    REMOVE: PERMISSION_TRANSACTION_OPERATION_TYPE_REMOVE_BYTE
};

export const WAVES_ID = 'WAVES';
export const WAVES_BLOCKCHAIN_ID = '';

export const MAINNET_BYTE: number = 'D'.charCodeAt(0); // todo изменить когда формализируем коды байтов сетей
export const TESTNET_BYTE: number = 'D'.charCodeAt(0); // 68

export const ADDRESS_VERSION: number = 1;
export const ALIAS_VERSION: number = 2;

export const SET_SCRIPT_LANG_VERSION: number = 1;

export const TRANSFER_ATTACHMENT_BYTE_LIMIT: number = 140;
export const DATA_TX_SIZE_WITHOUT_ENTRIES = 52;

/*
todo
*  Лимит на всю транзакцию — 150 Кб. Постоянные значения которые идут всегда в
*  транзакции 152 байта для waves crypto и 216 байт для ГОСТ crypto.
*  Изменяется размер публичных ключе с 32 до 64 байт.
*/
export const DATA_ENTRIES_BYTE_LIMIT: number = 140 * 1024 - DATA_TX_SIZE_WITHOUT_ENTRIES; // 140 kb for the whole tx

export const INITIAL_NONCE: number = 0;

export const PRIVATE_KEY_LENGTH: number = 32;

export const PUBLIC_KEY_LENGTH: number = 32;
export const PUBLIC_KEY_GOST_LENGTH: number = 64;
