import { $fetch } from 'ofetch';
import type { ApiOptions } from '../types';
import { moduleLogger } from '../utils/logger';
import { useRuntimeConfig } from '#app';

export async function useApi<T>(
  url: string,
  options: ApiOptions = {},
): Promise<{ data: { value: T | null }; error: { value: Error | null } }> {
  const config = useRuntimeConfig().public.reportModule;

  if (config.debug) {
    moduleLogger.info('🔧 API Config:', {
      apiUrl: config.apiUrl,
      hasApiKey: !!config.apiKey,
      url: url,
    });
  }

  try {
    const fullUrl = `${config.apiUrl || ''}${url}`;
    const headers: Record<string, string> = {
      'X-API-Key': config.apiKey,
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (config.debug) {
      moduleLogger.log('🚀 API Call:', {
        url: fullUrl,
        method: options.method || 'GET',
        hasApiKey: !!config.apiKey,
      });
    }

    const result = await $fetch<T>(fullUrl, {
      ...options,
      headers,
      onResponseError: ({ response }) => {
        console.log('ttttttt');
        console.log(response);
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

    if (config.debug) {
      moduleLogger.log('✅ Report Module API Success:', result);
    }

    return {
      data: { value: result },
      error: { value: null },
    };
  }
  catch (error) {
    return {
      data: { value: null },
      error: { value: error instanceof Error ? error : new Error(String(error)) },
    };
  }
}
