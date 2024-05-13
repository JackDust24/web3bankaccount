'use client'

import Image from 'next/image'
import Header from './components/Header'
import {
    type BaseError,
    useReadContract,
    useReadContracts,
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi'
import { wagmiContractConfig } from '@/data/abi'
import { useState } from 'react'
import Button from './components/Button'

export default function Home() {
    const { abi, address } = wagmiContractConfig
    const { isConnected } = useAccount()
    const [showAccountOptions, setShowAccountOptions] = useState(false)
    const [ownedAccounts, setOwnedAccounts] = useState([])

    const add = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // work out what's wrong with the address
    const { data, error, isPending } = useReadContracts({
        contracts: [
            {
                address: add,
                abi: abi,
                functionName: 'getTest',
            },
            {
                address: add,
                abi: abi,
                functionName: 'getAccounts',
            },
        ],
    })

    const [getTest, getAccounts] = data || []

    const { data: hash, isPending: isPendingWrite, writeContract } = useWriteContract()

    const handleViewAccounts = async () => {
        const getBalance = extractContractFunction(getAccounts)
        if (getBalance && getBalance.length > 0) {
            setOwnedAccounts(getBalance)
        }
    }

    const handleCreateAccount = async () => {
        writeContract?.({
            address: add,
            abi: abi,
            functionName: 'createAccount',
            args: [['0x90F79bf6EB2c4f870365E785982E1f101E93b906']],
        })
    }

    const handleConnectConfirmation = async () => {
        const getBalance = extractContractFunction(getTest)
        if (getBalance === 'Hello World') setShowAccountOptions(true)
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    const isScreenLoading = isPending || isPendingWrite

    return (
        <main className="flex min-h-screen items-center flex-col p-24">
            <div className="z-10 w-full items-center font-mono text-sm flex">
                <Header />
            </div>
            {isConnected && address && (
                <Button
                    onClick={() => handleConnectConfirmation()}
                    isDisabled={showAccountOptions}
                    text={showAccountOptions ? 'Connected to account' : 'Click to connect'}
                    className="text-2xl"
                />
            )}

            {showAccountOptions && (
                <div className="flex m-4 justify-between gap-6">
                    <Button onClick={() => handleViewAccounts()} text="View Account" />
                    <Button onClick={() => handleCreateAccount()} text="Create Account" />
                </div>
            )}
            {isScreenLoading && (
                <div className="flex m-4 justify-between gap-6">
                    <div>Loading...</div>
                </div>
            )}
            {error && (
                <div className="flex m-4 justify-between gap-6">
                    <div>Error: {(error as BaseError).shortMessage || error.message}</div>
                </div>
            )}
            <div className="flex m-4 justify-between gap-6">
                {hash && <div>Transaction Hash: {hash}</div>}
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && <div>Transaction confirmed.</div>}
                {ownedAccounts.map((account) => (
                    <>
                        <div>Account: {account}</div>
                    </>
                ))}
            </div>
        </main>
    )
}

function extractContractFunction(item: any) {
    console.log(item)
    if (!item) return ''
    return JSON.parse(JSON.stringify(item?.result))
}
