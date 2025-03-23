import React from 'react';
import { Tooltip } from 'react-tooltip';
import { flexRender } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";


export default function CommonTable({
    table, //  it is required
    tableStyle,
    tableHeadStyle,
    tableHeadRowStyle,
    tableHeadCellStyle,
    tableBodyStyle,
    tableBodyRowStyle,
    tableBodyCellStyle,
    stripedStyleTrue = false,
    tooltipPlacement = 'top',
    tableBodyClassName,
    selectRow, // this is required for make  selector row
}) {
    return (
        <div className={tableBodyClassName}>
            <Table parentClassName={cn('max-h-[65dvh] h-[65dvh]', tableStyle)} >
                <TableHeader className={cn("sticky top-0 bg-gray-100 z-[10]", tableHeadStyle)}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className={cn("", tableHeadRowStyle)}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={cn(
                                        "",
                                        tableHeadCellStyle,
                                        header.column.columnDef.HeaderClassName
                                    )}
                                    colSpan={header.colSpan}
                                    onClick={header?.column?.columnDef?.isSort ? header.column.getToggleSortingHandler() : () => console.log("Not Allowed")}
                                    data-tooltip-id={header.column.columnDef.headerTooltipText ? `tooltip-${header.id}` : undefined}
                                    data-tooltip-content={header.column.columnDef.headerTooltipText}
                                    data-tooltip-place={header.column.columnDef.headerTooltipPlacement ?? tooltipPlacement}
                                >
                                    {header?.isPlaceholder ? null : (
                                        <div>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {(header?.column?.columnDef?.isSort && header?.column?.getIsSorted() )? (
                                                header?.column?.getIsSorted() === 'asc' ? '▲' : '▼'
                                            ) : null}
                                        </div>
                                    )}
                                    {
                                        header.column.columnDef.headerTooltipText &&
                                        <Tooltip
                                            id={`tooltip-${header.id}`}
                                            className="text-xs"
                                        />
                                    }

                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className={cn("", tableBodyStyle)} >
                    {table.getRowModel()?.rows?.length > 0 ? (
                        table.getRowModel().rows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                className={cn(
                                    tableBodyRowStyle,
                                    selectRow && selectRow === row.original.unique_id && 'outline outline-1 outline-indigo-300 bg-indigo-50 hover:bg-indigo-50',
                                    index % 2 === 0 ? stripedStyleTrue ?? 'bg-[#ededed]' : ''
                                )}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={cn(
                                            "",
                                            tableBodyCellStyle,
                                            cell.column.columnDef.colClassName
                                        )}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={table.getAllColumns().length}
                                className="text-center py-20 font-semibold text-lg"
                            >
                                No Data
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
