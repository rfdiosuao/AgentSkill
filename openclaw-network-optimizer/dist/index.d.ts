type SessionContext = {
    reply?: (message: string) => Promise<void> | void;
    logger?: {
        info?: (message: string) => void;
        warn?: (message: string) => void;
        error?: (message: string) => void;
    };
};
type Args = {
    action?: string;
    proxyPort?: number | string;
    interfaceAlias?: string;
};
export declare function main(ctx: SessionContext, args?: Args): Promise<void>;
export default main;
