import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { ManifestBlockEditorCustomView } from '@umbraco-cms/backoffice/extension-registry';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { OpenAPI } from './api/index.ts';

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
    
    _host.consumeContext(UMB_AUTH_CONTEXT, async (auth) => {
        if (!auth) return;

        const umbOpenApi = auth.getOpenApiConfiguration();
        OpenAPI.BASE = umbOpenApi.base;
        OpenAPI.TOKEN = umbOpenApi.token;
        OpenAPI.WITH_CREDENTIALS = umbOpenApi.withCredentials;
        OpenAPI.CREDENTIALS = umbOpenApi.credentials;
    });
  
    const manifestBlockPreview : ManifestBlockEditorCustomView = {
        alias: 'knowit-instant-block-preview',
        name: 'Knowit Instant Block Preview',
        type: 'blockEditorCustomView',
        elementName: 'knowit-instant-block-preview',
        js: () => import('./elements/knowit-instant-block-preview.ts'),
    }
    
    extensionRegistry.register(manifestBlockPreview);
};
