import * as React from "react"
import { Check, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover,PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DataTableFacetedFilter({ column, title, options, fixLength = 2 }) {
    const facets = column?.getFacetedUniqueValues()
    const selectedValues = new Set(column?.getFilterValue())

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
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > fixLength ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
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
                                    const isSelected = selectedValues.has(option.value)
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => {
                                                if (isSelected) {
                                                    selectedValues.delete(option.value)
                                                } else {
                                                    selectedValues.add(option.value)
                                                }
                                                const filterValues = Array.from(selectedValues)
                                                column?.setFilterValue(
                                                    filterValues.length ? filterValues : undefined
                                                )
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            {option.icon && (
                                                <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span>{option.label}</span>
                                            {facets?.get(option.value) && (
                                                <span className="ml-auto rounded-full bg-indigo-200 flex h-4 w-4 items-center justify-center font-mono text-xs">
                                                    {facets.get(option.value)}
                                                </span>
                                            )}
                                        </CommandItem>
                                    )
                                })}
                            </ScrollArea>
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                {/* <CommandSeparator /> */}
                                <CommandGroup className='sticky bottom-0 w-full bg-white border-t' >
                                    <CommandItem
                                        onSelect={() => column?.setFilterValue(undefined)}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}