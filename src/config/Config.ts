import { MAINNET_BYTE } from '../consts';
import { IConfig, IConfigOptions } from './interface';

const DEFAULT_CONFIG: IConfigOptions = {
    networkByte: MAINNET_BYTE,
    logLevel: 'warning',
    minimalSeedLength: 15,
    crypto: 'waves'
};

class Config implements IConfig {

    private props: IConfigOptions = Object.assign(Object.create(null), DEFAULT_CONFIG);

    public getNetworkByte(): number {
        return this.props.networkByte;
    }

    public getLogLevel(): string {
        return this.props.logLevel;
    }

    public getCrypto(): string {
        return this.props.crypto;
    }

    public set(config: Partial<IConfigOptions>) {
        Object.assign(this.props, config);
    }

    public get<T extends keyof IConfigOptions>(key: T): IConfigOptions[T] {
        return this.props[key];
    }

    public clear() {
        this.props = Object.assign(Object.create(null), DEFAULT_CONFIG);
    }
}

export const config: IConfig = new Config();