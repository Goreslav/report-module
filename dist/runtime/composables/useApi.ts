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
    const fullUrl = `${config.apiUrl}${url}`

    const authToken = getAuthToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const result = await $fetch<T>(fullUrl, {
      ...options,
      headers,
      onResponseError: async ({ response }) => {
        if (response.status === 401) {
          await refreshSession();
        }
      },
    })

    return {
      data: { value: result },
      error: { value: null }
    }
  } catch (error) {
    return {
      data: { value: null as any },
      error: { value: error }
    }
  }
}
