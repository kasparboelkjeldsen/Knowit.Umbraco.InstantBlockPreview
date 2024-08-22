import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    client: 'fetch',
    debug: true,
    input: 'https://localhost:44377/umbraco/swagger/management/swagger.json',
    output: {
        path: 'src/api',
        format: 'prettier',
        lint: 'eslint',
    },
    schemas: false,
    services: {
        asClass: true,
    },
    types: {
        enums: 'typescript',
    }
});