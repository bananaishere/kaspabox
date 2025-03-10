interface Window {
  kasware?: any
  ksprBot?: {
    address?: string
    isConnected?: boolean
    connect?: () => Promise<any>
    disconnect?: () => Promise<void>
    getBalance?: () => Promise<string>
    sendKaspa?: (params: {
      to: string
      amount: string
      message?: string
    }) => Promise<
      | {
          txid?: string
          hash?: string
          success?: boolean
          error?: string
        }
      | string
    >
    openExtension?: () => void
    [key: string]: any
  }
}

