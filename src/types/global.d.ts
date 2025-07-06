export {};

declare global {
    interface NavigatorUADataBrand {
        brand: string;
        version: string;
    }

    interface NavigatorUAData {
        brands: NavigatorUADataBrand[];
        mobile?: boolean;
        getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
    }

    interface Navigator {
        userAgentData?: NavigatorUAData;
    }
}
