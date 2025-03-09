import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getAllTemplates } from '@/service/menu.service';
import { useQuery } from '@tanstack/react-query';
import { templateQueryKeyLoopUp } from './utils';
import SquareLoader from '@/components/ui/CustomLoaders/SquarLoader';
import { Card } from '@/components/ui/card';
import { toastError } from '@/utils/toast-utils';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Info, Pencil, Plus } from 'lucide-react';
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import RowDetailsModal from '@/common/Modal/RowDetailsModal';
import CommonTable from '@/common/Table/CommonTable';
import TemplateForm from './TemplateForm';
import CommonTableToolbar from './components/CommonTableToolbar';
import { useNavigate } from 'react-router';

export default function TemplateIndex() {

  const navigate = useNavigate();
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState({ data: null, isEdit: false, isOpen: false });

  const { data, isLoading, error } = useQuery({
    queryKey: [templateQueryKeyLoopUp['TEMPLATE_LIST']],
    queryFn: getAllTemplates,
  });

  useEffect(() => {
    if (error) {
      toastError(`Error fetching Templates List: ${JSON.stringify(error)}`);
    }
  }, [error]);

  const handleOpenModal = ({ data, isOpen, isEdit }) => {
    setSelectedCategory((prv) => ({ ...prv, data, isOpen, isEdit }))
  };

  const handleClose = () => {
    setSelectedRow(null);
  };

  const handleRowClick = useCallback((rowData) => {
    setSelectedRow(rowData);
  }, []);

  const handleEdit = useCallback((data) => {
    navigate(`../tamplate-editor/${data?.unique_id}`)
    // handleOpenModal({ data, isOpen: true, isEdit: true });
  }, []);

  const columns = useMemo(() => [
    {
      header: "Sr No",
      accessorKey: "id",
      colClassName: "w-1/12"
    },
    {
      header: "Template Name",
      accessorKey: "name",
      colClassName: "w-4/12",
    },
    {
      header: "Current Template",
      accessorKey: "is_default",
      HeaderClassName: "text-center",
      colClassName: "w-2/12 text-center",
      cell: ({ cell }) => (
        cell?.getValue() === 1 ? (
          <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'><span>Selecrted</span></Chip>
        ) : (
          <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'><span>Not Selected</span></Chip>
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
    data: data?.data?.templates,
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
        title="Template Details"
      />

      <TemplateForm
        open={selectedCategory?.isOpen}
        selectedRow={selectedCategory?.data}
        isEdit={selectedCategory?.isEdit}
        onHide={() => handleOpenModal({ data: null, isOpen: false, isEdit: false })}
      />

      <div className="w-full" >
        <div className=" px-2 my-2 flex justify-between items-center">
          <h2 className='text-2xl font-medium' >Templates</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('../tamplate-editor/new')} size='sm' className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500'>
              <div className='flex items-center gap-1 '>
                <Plus size={18} />
                <span className='text-sm'>Add Template</span>
              </div>
            </Button>
          </div>
        </div>
        <div className='border-y border-gray-200 p-2'>
          <CommonTableToolbar
            table={tableInstance}
            searchColumnId="name"
            searchPlaceholder="Filter by Template..."
          />
        </div>
        <div className='border-y border-gray-200 py-2'>
          <CommonTable table={tableInstance} />
        </div>
      </div>
    </>
  )
}
