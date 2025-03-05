import * as React from "react";
import { Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

export function FacetedFilter({ title, options, onFilterChange, fixLength = 2, value: externalValue }) {
    // Manage selected values in local state
    const [selectedValues, setSelectedValues] = React.useState(new Set(externalValue || []));

    useEffect(() => {
        if (externalValue !== undefined) {
            setSelectedValues(new Set(externalValue));
        }
    }, [externalValue]);

    // Handle selection/deselection of an option
    const handleSelect = (value) => {
        const newSelectedValues = new Set(selectedValues);
        if (newSelectedValues.has(value)) {
            newSelectedValues.delete(value);
        } else {
            newSelectedValues.add(value);
        }
        setSelectedValues(newSelectedValues);
        // Notify parent component of the new selection
        onFilterChange(Array.from(newSelectedValues));
    };

    // Clear all selected filters
    const clearFilters = () => {
        setSelectedValues(new Set());
        onFilterChange([]);
    };

    // Sort options to prioritize selected ones (optional, mimics original behavior)
    const sortedOptions = [...options].sort((a, b) => {
        const aSelected = selectedValues.has(a.value);
        const bSelected = selectedValues.has(b.value);
        return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
    });

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {title}
                    {selectedValues.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > fixLength ? (
                                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.has(option.value))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option.value}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 text-xs md:text-sm" align="start" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            <ScrollArea className="h-max-56">
                                {sortedOptions.map((option) => {
                                    const isSelected = selectedValues.has(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className="h-4 w-4" />
                                            </div>
                                            {option.icon && (
                                                <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </ScrollArea>
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <CommandGroup className="sticky bottom-0 w-full bg-white border-t">
                                <CommandItem
                                    onSelect={clearFilters}
                                    className="justify-center text-center"
                                >
                                    Clear filters
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}