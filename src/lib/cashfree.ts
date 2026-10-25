/**
 * Cashfree Payments Web SDK v3 loader.
 * Loads https://sdk.cashfree.com/js/v3/cashfree.js and returns the Cashfree factory.
 */

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'production' | 'sandbox' }) => {
      checkout: (options: {
        paymentSessionId: string
        redirectTarget?: '_modal' | '_self' | '_blank'
      }) => Promise<{
        error?: { message?: string; code?: string }
        redirect?: boolean
        paymentDetails?: any
      }>
    }
  }
}

let cashfreeLoadPromise: Promise<Window['Cashfree'] | null> | null = null

export function loadCashfreeSDK(): Promise<Window['Cashfree'] | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree)
  }

  if (cashfreeLoadPromise) {
    return cashfreeLoadPromise
  }

  cashfreeLoadPromise = new Promise((resolve) => {
    let script = document.getElementById('cashfree-js-sdk') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'cashfree-js-sdk'
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.async = true
      document.head.appendChild(script)
    }

    const checkInterval = setInterval(() => {
      if (window.Cashfree) {
        clearInterval(checkInterval)
        resolve(window.Cashfree)
      }
    }, 100)

    script.addEventListener('load', () => {
      clearInterval(checkInterval)
      resolve(window.Cashfree || null)
    })
    script.addEventListener('error', () => {
      clearInterval(checkInterval)
      console.warn('Failed to load Cashfree JavaScript SDK.')
      cashfreeLoadPromise = null
      resolve(null)
    })

    setTimeout(() => {
      clearInterval(checkInterval)
      if (window.Cashfree) {
        resolve(window.Cashfree)
      } else {
        cashfreeLoadPromise = null
        resolve(null)
      }
    }, 10000)
  })

  return cashfreeLoadPromise
}
