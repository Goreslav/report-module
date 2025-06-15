import { $fetch } from 'ofetch';
import { moduleLogger } from '../utils/logger';
import type { ApiOptions } from '../types';
import { useRuntimeConfig } from '#app';

export async function useApi<T>(
  url: string,
  options: ApiOptions = {},
): Promise<{ data: { value: T | null }; error: { value: Error | null } }> {
  const config = useRuntimeConfig();
  const publicConfig = config.public.reportModule;

  const serverConfig = config.reportModule;

  if (publicConfig.debug) {
    console.log('ttttt')
    console.log(config)
    console.log(serverConfig)
    moduleLogger.info('🔧 API Config:', {
      apiUrl: publicConfig.apiUrl,
      hasApiKey: !!serverConfig?.apiKey,
      url: url,
    });
  }

  try {
    const fullUrl = `${publicConfig.apiUrl || ''}${url}`;
    const headers: Record<string, string> = {
      'X-API-Key': serverConfig?.apiKey || '', // ✅ API kľúč zo server config
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (publicConfig.debug) {
      moduleLogger.info('🚀 API Call:', {
        url: fullUrl,
        method: options.method || 'GET',
        hasApiKey: !!serverConfig?.apiKey, // ✅ Správna kontrola
      });
    }

    const result = await $fetch<T>(fullUrl, {
      ...options,
      headers,
      onResponseError: ({ response }) => {
        moduleLogger.error('❌ Report Module API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
        });

        if (response.status === 401) {
          throw new Error('No permission');
        }
      },
    });

    if (publicConfig.debug) {
      moduleLogger.success('✅ API Success:', result);
    }

    return {
      data: { value: result },
      error: { value: null },
    };
  }
  catch (apiError) {
    moduleLogger.error('❌ API Request failed:', apiError);
    return {
      data: { value: null },
      error: { value: apiError instanceof Error ? apiError : new Error(String(apiError)) },
    };
  }
}
