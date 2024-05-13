'use client'

import * as React from 'react'
import { RainbowKitProvider, getDefaultWallets, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { argentWallet, trustWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets'
import { WagmiProvider } from 'wagmi'
import { arbitrum, base, mainnet, optimism, polygon, sepolia, localhost } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import dotenv from 'dotenv'
import '@rainbow-me/rainbowkit/styles.css'

dotenv.config()
const { wallets } = getDefaultWallets()

const projectId = process.env.NEXT_PUBLIC_WAGMI_APP_ID as string

const config = getDefaultConfig({
    appName: 'Bank-Account',
    projectId,
    wallets: [
        ...wallets,
        {
            groupName: 'Other',
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: [mainnet, polygon, optimism, arbitrum, base, sepolia, localhost],
    ssr: true, // If your dApp uses server side rendering (SSR)
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
