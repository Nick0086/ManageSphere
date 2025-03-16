import React, { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TagList } from './tag-list';


export const TagPopover = ({ children, tags, customTagRenderer, activeTagIndex, setActiveTagIndex, ...tagProps }) => {
    const triggerRef = useRef(null);
    const [popoverWidth, setPopoverWidth] = useState(undefined);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleOpenChange = (open) => {
        if (open && triggerRef.current) {
            setPopoverWidth(triggerRef.current.offsetWidth);
        }
        setIsPopoverOpen(open);
    };

    const handleInputFocus = () => {
        setIsPopoverOpen(true);
    };

    const handleInputBlur = (event) => {
        const relatedTarget = event.relatedTarget;
        if (relatedTarget && triggerRef.current && triggerRef.current.contains(relatedTarget)) {
            return;
        }
        setIsPopoverOpen(false);
    };

    return (
        <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild ref={triggerRef}>
                {React.cloneElement(children, {
                    onFocus: handleInputFocus,
                    onBlur: handleInputBlur,
                })}
            </PopoverTrigger>
            <PopoverContent
                className="w-full space-y-3 max-w-[450px]"
                style={{
                    width: `${popoverWidth}px`,
                }}
            >
                <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">Entered Tags</h4>
                    <p className="text-sm text-muted-foreground text-left">These are the tags you&apos;ve entered.</p>
                </div>
                <TagList tags={tags} customTagRenderer={customTagRenderer} activeTagIndex={activeTagIndex} setActiveTagIndex={setActiveTagIndex} {...tagProps} />
            </PopoverContent>
        </Popover>
    );
};