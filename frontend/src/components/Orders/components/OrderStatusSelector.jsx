import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import chroma from 'chroma-js';
import { getColor } from '../utils';
import { Chip } from '@/components/ui/chip';

const OptionBadge = ({ option, showActiveBadge }) => {
    return (
        <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={cn({ 'font-bold': showActiveBadge })}>{option.label}</span>
        </div>
    )
}

export default function OrderStatusSelector({
    value,
    onChange,
    isLoading,
    options,
    placeholder = "Select status...",
    searchPlaceholder = "Search...",
    emptyMessage = "No option found.",
    disabled,
    isDetail = false,
}) {

    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (open && /^[1-6]$/.test(e.key)) {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (options[index]) {
                    onChange?.(options[index].value);
                    setOpen(false);
                }
            }

            if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onChange, options]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled || isLoading} className={cn(disabled && 'disabled:opacity-100')}>
                <Button
                    ref={buttonRef}
                    variant="none"
                    role="combobox"
                    aria-expanded={open}
                    aria-label={placeholder}
                    className={cn('p-0')}
                    disabled={isLoading}
                    size="xs"
                >
                    {selectedOption ? (
                        <Chip className='capitalize' variant='light' color={getColor(value)} radius='md' size='sm' border='none' >
                            {
                                isLoading ? (
                                    <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
                                        <Loader
                                            className={cn("size-4 shrink-0 animate-spin")}
                                            aria-hidden="true"
                                        />
                                    </span>
                                ) : ("")
                            }
                            {value}
                            {!disabled && <ChevronDown size={14} className="shrink-0 fill-current" strokeWidth={0} />}
                        </Chip>
                    ) : (
                        placeholder
                    )}

                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-0" align="start" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }} sideOffset={5}>
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="border-none focus:ring-0"
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option, index) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onChange?.(currentValue);
                                        setOpen(false);
                                    }}
                                    className={cn("flex text-xs lg:text-sm items-center gap-2 px-2 py-1.5 cursor-pointer aria-selected:bg-accent", value === option.value && "bg-accent")}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <kbd className={cn("size-4 flex text-white items-center justify-center rounded text-xs font-medium", option.className)}>
                                                {index + 1}
                                            </kbd>
                                            <OptionBadge option={option} showActiveBadge={value === option.value} />
                                        </div>
                                        {option.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {option.description}
                                            </span>
                                        )}
                                    </div>
                                    {value === option.value && (
                                        <Check className="h-4 w-4 text-accent-foreground" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
