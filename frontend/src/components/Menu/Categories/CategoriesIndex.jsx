import RowDetailsModal from '@/common/Modal/RowDetailsModal';
import CommonTable from '@/common/Table/CommonTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SquareLoader from '@/components/ui/CustomLoaders/SquarLoader';
import { getAllCategory } from '@/service/menu.service';
import { toastError } from '@/utils/toast-utils';
import { useQuery } from '@tanstack/react-query';
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Info, Pencil, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { queryKeyLoopUp } from './utils';
import CategoriesForm from './CategoriesForm';
import { Chip } from '@/components/ui/chip';
import CommonTableToolbar from './components/CommonTableToolbar';

const columnsMapping = {
  id: "Unique No",
  name: "Category",
  count: "Count",
  status: "Status",
  actions: "Actions",
};

export default function CategoriesIndex() {

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([{ id: "status", value: [1] }])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState({ data: null, isEdit: false, isOpen: false });

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeyLoopUp['Category']],
    queryFn: getAllCategory,
  });

  useEffect(() => {
    if (error) {
      console.log(error);
      toastError(`Error fetching Category: ${JSON.stringify(error)}`);
    }
  }, [error]);

  const handleRowClick = (rowData) => {
    setSelectedRow(rowData);
  };

  const handleClose = () => {
    setSelectedRow(null);
  };

  const handleOpenModal = ({ data, isOpen, isEdit }) => {
    setSelectedCategory((prv) => ({ ...prv, data, isOpen, isEdit }))
  };

  const handleEdit = useCallback((data) => {
    handleOpenModal({ data, isOpen: true, isEdit: true });
  }, []);

  const columns = useMemo(() => [
    {
      header: "Unique No",
      accessorKey: "id",
      colClassName:"w-2/12",
    },
    {
      header: "Category",
      accessorKey: "name",
      colClassName:"w-4/12",
    },
    {
      header: "Count",
      accessorKey: "count",
      HeaderClassName:"text-center",
      colClassName:"w-2/12 text-center",
    },
    {
      header: "Status",
      accessorKey: "status",
      HeaderClassName:"text-center",
      colClassName:"w-2/12 text-center",
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
      HeaderClassName:"text-center",
      colClassName:"w-2/12 text-center",
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
  ], [handleEdit]);

  const tableInstance = useReactTable({
    columns,
    data: data?.data?.categories,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 100,
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
        title="Lead Source Details"
      />

      <CategoriesForm
        open={selectedCategory?.isOpen}
        selectedRow={selectedCategory?.data}
        isEdit={selectedCategory?.isEdit}
        onHide={() => handleOpenModal({ data: null, isOpen: false, isEdit: false })}
      />

      <div className="w-full" >
        <div className=" px-5 my-2 flex justify-end items-center">
          <div className="flex items-center gap-2">
            <Button onClick={() => handleOpenModal({ isOpen: true, isEdit: false, data: null })} size='sm' className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500'>
              <div className='flex items-center gap-1 '>
                <Plus size={18} />
                <span className='text-sm'>Add Category</span>
              </div>
            </Button>
          </div>
        </div>
        <div className='border-y border-gray-200 p-2'>
          <CommonTableToolbar
            table={tableInstance}
            columnsMapping={columnsMapping}
            searchColumnId="name"
            searchPlaceholder="Filter by Category..."
          />
        </div>
        <div className='border-y border-gray-200 py-2'>
          <CommonTable table={tableInstance} />
        </div>
      </div>
    </>

  )
}
