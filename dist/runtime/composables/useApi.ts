import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#app'

export async function useApi<T>(
  url: string,
  options: any = {}
): Promise<{ data: { value: T }, error: { value: any } }> {
  const config = useRuntimeConfig().public.reportModule

  if (config.debug) {
    console.log('🔧 Report Module API Config:', {
      apiUrl: config.apiUrl,
      hasApiKey: !!config.apiKey,
      url: url
    })
  }

  try {
    // Validácia API key
    if (!config.apiKey) {
      throw new Error('API key is required for Report Module. Please configure apiKey in nuxt.config.ts')
    }

    // Kompletná URL
    const fullUrl = `${config.apiUrl || ''}${url}`

    // Headers s API key
    const headers: Record<string, string> = {
      'X-API-Key': config.apiKey,
      ...options.headers,
    }

    // Ak nie je FormData, pridaj Content-Type
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (config.debug) {
      console.log('🚀 Report Module API Call:', {
        url: fullUrl,
        method: options.method || 'GET',
        hasApiKey: !!config.apiKey,
        apiKeyPreview: config.apiKey.substring(0, 8) + '...'
      })
    }

    // API volanie
    const result = await $fetch<T>(fullUrl, {
      ...options,
      headers,
      onResponseError: ({ response }) => {
        console.error('❌ Report Module API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl
        })

        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your configuration.')
        }
        if (response.status === 403) {
          throw new Error('API key does not have permission for this operation.')
        }
      },
    })

    if (config.debug) {
      console.log('✅ Report Module API Success:', result)
    }

    return {
      data: { value: result },
      error: { value: null }
    }
  } catch (error) {
    console.error('❌ Report Module API Call failed:', {
      url,
      error: error.message || error
    })

    return {
      data: { value: null as any },
      error: { value: error }
    }
  }
}
