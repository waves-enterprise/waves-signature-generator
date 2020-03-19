export type TLogLevel = 'none' | 'error' | 'warning' | 'info';

export type TCrypto = 'waves' | 'gost';

export interface IConfigOptions {
    networkByte: number;
    logLevel: TLogLevel;
    minimalSeedLength: number;
    crypto: TCrypto;
}

export interface IConfig {

    getNetworkByte(): number;

    getLogLevel(): string;

    set(config: Partial<IConfigOptions>): void;

    get<T extends keyof IConfigOptions>(key: T): IConfigOptions[T];

    clear(): void;

    getCrypto(): TCrypto;

    isCryptoGost(): boolean;
}
