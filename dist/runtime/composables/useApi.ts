import { useFetch, useRuntimeConfig, useRequestHeaders, useNuxtApp } from '#app'
import type { UseFetchOptions } from 'nuxt/app'

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

export function useApi<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  const config = useRuntimeConfig().public.reportModule
  const headers = useRequestHeaders(["cookie", "authorization"]);

  const fullUrl = typeof url === 'function'
    ? () => `${config.apiUrl}${url()}`
    : `${config.apiUrl}${url}`

  const response = useFetch(fullUrl, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
    $fetch: useNuxtApp().$api as typeof $fetch,
    onResponseError: async ({ response }) => {
      if (response.status === 401) {
        await refreshSession();
      }
    },
  });

  return response;
}
