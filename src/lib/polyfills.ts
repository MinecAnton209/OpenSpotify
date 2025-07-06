if (typeof window !== 'undefined') {
    if (window.navigator && !window.navigator.userAgentData) {
        window.navigator.userAgentData = {
            brands: [],
            mobile: false,
            platform: '',
        };
    } else if (window.navigator && window.navigator.userAgentData) {
        if (!Array.isArray(window.navigator.userAgentData.brands)) {
            window.navigator.userAgentData.brands = [];
        }
    }
}