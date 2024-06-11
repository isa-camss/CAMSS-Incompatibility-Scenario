import { EuiEnvConfig } from '@eui/core';

export const environment: EuiEnvConfig = {
    production: false,
    enableDevToolRedux: true,
    envDynamicConfig: {
        uri: 'assets/env-json-config.json',
        deepMerge: true,
        merge: ['modules'],
    },
};
