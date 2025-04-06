import React, { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { FacetedFilter } from '../ui/FacetedFilter'
import { orderStatus } from './utils'
import { Button } from '../ui/button'
import { Search, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export default function OrderFilterBar({
    filte,
    setFilter,
    tablesListOptions,
    resetFilter
}) {
    // Local state to track input value without triggering API calls
    const [idInputValue, setIdInputValue] = useState(filte?.id || '')

    // Update local state when filte prop changes
    useEffect(() => {
        setIdInputValue(filte?.id || '')
    }, [filte?.id])

    // Handle search button click
    const handleSearch = () => {
        setFilter((prev) => ({ ...prev, id: idInputValue }))
    }

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className='flex flex-wrap items-center gap-2'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative flex items-center w-[150px] lg:w-[320px]">
                            <Input
                                placeholder="Filter By Order Id..."
                                value={idInputValue}
                                onChange={(e) => setIdInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-8 pr-8"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 h-8 px-2"
                                onClick={handleSearch}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Type and press Enter or click the search icon to filter</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <FacetedFilter
                title="Status"
                options={orderStatus}
                onFilterChange={(value) => setFilter((prev) => ({ ...prev, status: value }))}
                value={filte?.status}
            />

            <FacetedFilter
                title="Table"
                options={tablesListOptions}
                onFilterChange={(value) => setFilter((prev) => ({ ...prev, table: value }))}
                value={filte?.table}
            />

            {(!!idInputValue || filte?.status?.length || filte?.table) && (
                <Button variant="ghost" onClick={resetFilter} className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700">
                    Reset
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}