if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    try {
        const uaData = navigator.userAgentData;

        if (!uaData || !Array.isArray(uaData.brands)) {
            (navigator as any).userAgentData = {
                brands: [],
                mobile: false,
                getHighEntropyValues: async () => ({}),
            };
        }
    } catch (e) {
        (navigator as any).userAgentData = {
            brands: [],
            mobile: false,
            getHighEntropyValues: async () => ({}),
        };
    }
}
