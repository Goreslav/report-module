import { $fetch } from 'ofetch'
import { useRuntimeConfig, useCookie } from '#app'

export async function refreshSession() {
  try {
    await $fetch("/api/auth/session?update", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    throw error;
  }
}
function getAuthToken() {
  try {
    const accessTokenCookie = useCookie('access-token')
    if (accessTokenCookie.value) {
      // Ak je to JSON objekt s access_token property
      const tokenData = typeof accessTokenCookie.value === 'string'
        ? JSON.parse(accessTokenCookie.value)
        : accessTokenCookie.value

      return tokenData.access_token || tokenData
    }
    return null
  } catch (error) {
    console.warn('Could not get auth token:', error)
    return null
  }
}

export async function useApi<T>(
  url: string,
  options: any = {}
): Promise<{ data: { value: T }, error: { value: any } }> {
  const config = useRuntimeConfig().public.reportModule

  try {
    // KRITICKÉ: Kompletná URL - priamo na externú doménu, bez proxy!
    const fullUrl = `${config.apiUrl}${url}`

    console.log('🚀 Report Module API Call:', fullUrl) // Debug

    // Získaj aktuálny auth token z user session
    const authToken = getAuthToken()

    // Headers pre externú doménu
    const headers: Record<string, string> = {
      ...options.headers,
    }

    // Pridaj auth token ak existuje
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
      console.log('🔐 Using auth token:', authToken.substring(0, 10) + '...') // Debug
    }

    // KĽÚČOVÉ: Použiť priamo $fetch namiesto useFetch/proxy
    const result = await $fetch<T>(fullUrl, {
      ...options,
      headers,
      // Nepoužívame $api proxy - len čistý $fetch
      onResponseError: async ({ response }) => {
        console.error('❌ API Error:', response.status, response.statusText)
        if (response.status === 401) {
          await refreshSession();
        }
      },
    })

    console.log('✅ API Success:', result) // Debug

    return {
      data: { value: result },
      error: { value: null }
    }
  } catch (error) {
    console.error('❌ API Call failed:', error) // Debug
    return {
      data: { value: null as any },
      error: { value: error }
    }
  }
}
