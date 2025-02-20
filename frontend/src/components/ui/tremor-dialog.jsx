import React from "react"
import * as DialogPrimitives from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const Dialog = (props) => {
    return <DialogPrimitives.Root {...props} />
}
Dialog.displayName = "Dialog"

const DialogTrigger = DialogPrimitives.Trigger

DialogTrigger.displayName = "DialogTrigger"

const DialogClose = DialogPrimitives.Close

DialogClose.displayName = "DialogClose"

const DialogPortal = DialogPrimitives.Portal

DialogPortal.displayName = "DialogPortal"

const DialogOverlay = React.forwardRef(({ className, ...props }, forwardedRef) => {
    return (
        <DialogPrimitives.Overlay
            ref={forwardedRef}
            className={cn(
                "fixed inset-0 z-[999] bg-black/70 !duration-150 data-[state=open]:animate-backdrop-in data-[state=closed]:animate-backdrop-out overflow-y-auto max-h-screen grid place-items-center",
                className
            )}
            /* className={cn(
                // base
                "fixed inset-0 z-[99] overflow-y-auto",
                // background color
                "bg-black/70",
                // transition
                "data-[state=open]:animate-dialogOverlayShow",
                className,
            )} */
            {...props}
        />
    )
})

DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(({ className, overlayClassName, showClose = true, stopOutsideClick, ...props }, forwardedRef) => {
    const [outsideClick, setOutsideClick] = React.useState(false);
    const handleInteractOutside = (e) => {
        e.preventDefault();
        setOutsideClick(true);
        setTimeout(() => setOutsideClick(false), 100);
    };
    return (
        <DialogPortal className='overflow-y-auto'>
            <DialogOverlay className={overlayClassName}>
                <DialogPrimitives.Content
                    ref={forwardedRef}
                    onInteractOutside={(e) => stopOutsideClick && handleInteractOutside(e)}
                    className={cn(
                        "z-[999] relative grid w-full max-w-md sm:max-w-lg gap-1 bg-background  shadow-lg ",
                        // "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "!duration-300 data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out",
                        /* "transition-all !duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-10 data-[state=open]:slide-in-from-top-10", */
                        "sm:rounded-lg md:w-full",
                        outsideClick && "!scale-[.98]",
                        className
                    )}
                    {...props}
                >
                    {props.children}
                    {showClose && <DialogPrimitives.Close className="absolute p-1 text-destructive hover:text-destructive/90 hover:bg-destructive/20 rounded right-3 top-3 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitives.Close>}
                </DialogPrimitives.Content>
            </DialogOverlay>
        </DialogPortal>
    )
})

DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => {
    return <div className={cn("flex flex-col gap-y-1 p-4 border-b ", className)} {...props} />
}

DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, forwardedRef) => (
    <DialogPrimitives.Title
        ref={forwardedRef}
        className={cn(
            // base
            "text-lg font-semibold mb-0",
            // text color
            "text-primary dark:text-gray-50",
            className,
        )}
        {...props}
    />
))

DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, forwardedRef) => {
    return (
        <DialogPrimitives.Description
            ref={forwardedRef}
            className={cn("text-gray-500 dark:text-gray-500 p-4", className)}
            {...props}
        />
    )
})

DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className,
            )}
            {...props}
        />
    )
}

DialogFooter.displayName = "DialogFooter"

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
}