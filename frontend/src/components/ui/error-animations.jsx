import { AlertCircle, WifiOff, ServerCrash } from "lucide-react"

export function ErrorAnimation({ type = "generic", size = "md", className = "" }) {
    const sizeMap = {
        sm: "h-12 w-12",
        md: "h-16 w-16",
        lg: "h-24 w-24",
    }

    const smallIconSize = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    }

    return (
        <div className={`relative inline-block ${className}`}>
            {type === "network" && (
                <>
                    <AlertCircle className={`${sizeMap[size]} text-destructive animate-pulse`} />
                    <WifiOff className={`${smallIconSize[size]} text-destructive absolute bottom-0 right-0 animate-bounce`} />
                </>
            )}

            {type === "server" && (
                <>
                    <AlertCircle className={`${sizeMap[size]} text-destructive animate-pulse`} />
                    <ServerCrash className={`${smallIconSize[size]} text-destructive absolute bottom-0 right-0 animate-bounce`} />
                </>
            )}

            {type === "generic" && <AlertCircle className={`${sizeMap[size]} text-destructive animate-pulse`} />}
        </div>
    )
}

