import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Chip } from '@/components/ui/chip';
import CommonTable from '@/common/Table/CommonTable';
import { useQuery } from '@tanstack/react-query';
import { menuQueryKeyLoopUp } from './utils';
import { getAllCategory, getAllMenuItems } from '@/service/menu.service';
import SquareLoader from '@/components/ui/CustomLoaders/SquarLoader';
import { Card } from '@/components/ui/card';
import { toastError } from '@/utils/toast-utils';
import { Button } from '@/components/ui/button';
import { Info, Pencil } from 'lucide-react';
import RowDetailsModal from '@/common/Modal/RowDetailsModal';
import CommonTableToolbar from './components/CommonTableToolbar';
import { queryKeyLoopUp } from '../Categories/utils';
import { DataTablePagination } from '@/components/ui/table-pagination';

const columnsMapping = {
  id: "Sr No",
  name: "Item Name",
  price: "Price",
  category_name: "Category",
  availability: "Availability",
  status: "Status",
  actions: "Actions",
};


export default function MenuTable({
  setIsModalOpen
}) {

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([{ id: "status", value: [1] }])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [selectedRow, setSelectedRow] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [menuQueryKeyLoopUp['item']],
    queryFn: getAllMenuItems,
  });

  // Fetch categories
  const { data: categoryData, isLoading: categoryIsLoading, error: categoryError } = useQuery({
    queryKey: [queryKeyLoopUp['Category']],
    queryFn: getAllCategory,
  });

  useEffect(() => {
    if (error) {
      toastError(`Error fetching Menu Item: ${JSON.stringify(error)}`);
    }
    if (categoryError) {
      toastError(`Error fetching categories: ${JSON.stringify(categoryError)}`);
    }
  }, [error, categoryError]);

  const categoryOptions = useMemo(() => {
    if (categoryData) {
      const categories = categoryData?.data?.categories || [];
      return categories.map((category) => ({
        value: category?.name,
        label: category?.name,
      }));
    }
    return [];
  }, [categoryData]);

  const handleRowClick = useCallback((rowData) => {
    setSelectedRow(rowData);
  }, []);

  const handleClose = () => {
    setSelectedRow(null);
  };

  const handleEdit = useCallback((data) => {
    setIsModalOpen((prv) => ({ ...prv, isOpen: true, isEdit: true, data: data }));
  }, []);

  const columns = useMemo(() => [
    {
      header: "Sr No",
      accessorKey: "id",
      colClassName: "w-1/12",
    },
    {
      header: "Item Name",
      accessorKey: "name",
      colClassName: "w-33/12",
    },
    {
      header: "Price",
      accessorKey: "price",
      colClassName: "w-1/12",
      filterFn: (row, id, filterValue) => {
        // If no filter value, return all rows
        if (!filterValue) return true;

        try {
          // Parse the stringified filter value
          const { value, operator } = JSON.parse(filterValue);
          const rowValue = parseFloat(row.getValue(id));

          // Apply the appropriate comparison
          switch (operator) {
            case "lessThan":
              return rowValue < value;
            case "greaterThan":
              return rowValue > value;
            case "equals":
            default:
              return rowValue === value;
          }
        } catch (e) {
          // If there's an error parsing the filter, return true
          return true;
        }
      }
    },
    {
      header: "Category",
      accessorKey: "category_name",
      colClassName: "w-2/12",
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
    },
    {
      header: "Availability",
      accessorKey: "availability",
      HeaderClassName: "text-center",
      colClassName: "w-1/12 text-center",
      cell: ({ cell }) => (
        cell?.getValue() === 'in_stock' ? (
          <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'><span>Availabe</span></Chip>
        ) : (
          <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'><span>Out Of Stock</span></Chip>
        )
      ),
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      HeaderClassName: "text-center",
      colClassName: "w-1/12 text-center",
      cell: ({ cell }) => (
        cell?.getValue() === 1 ? (
          <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'><span>Active</span></Chip>
        ) : (
          <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'><span>Inactive</span></Chip>
        )
      ),
      filterFn: (row, id, value) => {
        return value?.includes(row?.getValue(id));
      },
    },
    {
      id: "actions",
      header: "Actions",
      HeaderClassName: "text-center",
      colClassName: "w-2/12 text-center",
      cell: ({ _, row }) => (
        <div>
          <Button size='xs' type='button' variant="ghost" className="rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600" onClick={() => handleRowClick(row?.original)}>
            <Info size={16} />
          </Button>
          <Button size='xs' type='button' variant="ghost" className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600" onClick={() => handleEdit(row?.original)}>
            <Pencil size={16} />
          </Button>
        </div>
      ),
    },
  ], [handleRowClick, handleEdit]);

  const tableInstance = useReactTable({
    columns,
    data: data?.data?.menuItems,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  if (isLoading) {
    return (
      <Card className='h-screen w-full transition ease-in-out duration-300'>
        <SquareLoader bodyClassName={'h-[70%]'} />
      </Card>
    )
  }

  return (
    <>
      <RowDetailsModal
        isOpen={selectedRow !== null}
        onClose={handleClose}
        data={selectedRow || {}}
        title="Menu Item Details"
      />
      <div className='border-y border-gray-200 p-2'>
        <CommonTableToolbar
          table={tableInstance}
          columnsMapping={columnsMapping}
          categoryOptions={categoryOptions}
          categoryIsLoading={categoryIsLoading}
          searchColumnId="name"
          searchPlaceholder="Filter by Menu..."
        />
      </div>
      <div className=' py-2'>
        <CommonTable table={tableInstance}  />
      </div>
      <div className="mt-2 pt-2 border-t">
        <DataTablePagination table={tableInstance} count={data?.data?.menuItems?.length || 0} />
      </div>
    </>

  )
}
