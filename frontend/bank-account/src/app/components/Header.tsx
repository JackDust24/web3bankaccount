import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Header() {
    return (
        <div className="flex justify-between w-full">
            <h1 className="float-left py-4 px-4 font-semibold text-3xl">Banking Text Account</h1>
            <div className="float-right py-2">
                <ConnectButton />
            </div>
        </div>
    )
}
