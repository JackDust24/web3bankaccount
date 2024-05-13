import { clsx } from 'clsx'

export default function Button({
    onClick,
    isDisabled = false,
    text,
    className,
}: {
    onClick: () => void
    isDisabled?: boolean
    className?: string
    text: string
}) {
    return (
        <div className="m-10">
            <button
                className={clsx(
                    'py-2 px-4 bg-white shadow-2xl disabled:shadow-none disabled:bg-transparent rounded-xl text-[#2c12f5]',
                    className
                )}
                onClick={onClick}
                disabled={isDisabled}
            >
                {text}
            </button>
        </div>
    )
}
