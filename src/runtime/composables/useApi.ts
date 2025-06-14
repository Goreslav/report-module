import { $fetch } from 'ofetch';
import { useRuntimeConfig } from '#app';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: string | FormData | Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

export async function useApi<T>(
  url: string,
  options: ApiOptions = {},
): Promise<{ data: { value: T | null }; error: { value: Error | null } }> {
  const config = useRuntimeConfig().public.reportModule;

  if (config.debug) {
    console.log('🔧 Report Module API Config:', {
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
      console.log('🚀 Report Module API Call:', {
        url: fullUrl,
        method: options.method || 'GET',
        hasApiKey: !!config.apiKey,
        apiKeyPreview: config.apiKey.substring(0, 8) + '...',
      });
    }

    const result = await $fetch<T>(fullUrl, {
      ...options,
      headers,
      onResponseError: ({ response }) => {
        console.error('❌ Report Module API Error:', {
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
      console.log('✅ Report Module API Success:', result);
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
