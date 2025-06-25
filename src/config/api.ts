// API configuration utility
const getApiBaseUrl = (): string => {
  console.log(import.meta.env.DEV)
  if (import.meta.env.DEV) {
    return 'http://localhost:8788'
  }
  
  // In production (Cloudflare Workers), use relative paths
  return ''
}

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  
  // Helper function to build full API URLs
  buildUrl: (endpoint: string): string => {
    const base = getApiBaseUrl()
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${base}${cleanEndpoint}`
  }
}

export default API_CONFIG 