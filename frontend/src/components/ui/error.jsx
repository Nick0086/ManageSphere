"use client"
import { RefreshCw } from "lucide-react"
import { ErrorAnimation } from "./error-animations"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { Button } from "./button"



export function ErrorState({
    title = "Unable to Load Data",
    message = "We're having trouble connecting to the service.",
    submessage = "This could be due to a network issue or the service may be temporarily unavailable.",
    onRetry,
    errorType = "generic",
}) {
    return (
        <Card className="max-w-md mx-auto mt-12 border-destructive/20">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <ErrorAnimation type={errorType} size="lg" />
                </div>
                <CardTitle className="text-2xl font-bold text-destructive">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
                <p className="text-muted-foreground">{message}</p>
                {submessage && <p className="text-sm text-muted-foreground">{submessage}</p>}
            </CardContent>
            {onRetry && (
                <CardFooter className="flex justify-center pb-6">
                    <Button onClick={onRetry} className="relative group">
                        <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin" />
                        <span>Try Again</span>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

