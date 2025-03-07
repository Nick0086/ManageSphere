import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CommonTableToolbar = ({
    table,
    searchColumnId,
    searchPlaceholder,
}) => {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder={searchPlaceholder || `Filter...`}
                    value={table.getColumn(searchColumnId)?.getFilterValue() ?? ""}
                    onChange={(event) =>
                        table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters();
                        }}
                        className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default CommonTableToolbar