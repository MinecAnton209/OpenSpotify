if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    if (
        !navigator.userAgentData ||
        !Array.isArray(navigator.userAgentData.brands)
    ) {
        navigator.userAgentData = {
            brands: [],
            mobile: false,
            getHighEntropyValues: async () => ({}),
        };
    }
}