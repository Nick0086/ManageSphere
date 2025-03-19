import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const AppTooltip = ({
    children,
    content,
    side = "top",
    align = "center",
    contentClassName = "",
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className={cn("z-50", contentClassName)}
                >
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};