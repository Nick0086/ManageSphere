import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Info, Pencil, Plus, Star } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toastError, toastSuccess } from '@/utils/toast-utils'
import { getAllInvoiceTemplates, setDefaultInvoiceTemplate } from '@/service/invoices.service'
import { invoiceQueryKeyLookup } from './utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import SlackLoader from '../ui/CustomLoaders/SlackLoader'
import RowDetailsModal from '@/common/Modal/RowDetailsModal'
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import CommonTable from '@/common/Table/CommonTable'
import { DataTablePagination } from '../ui/table-pagination'
import InvoiceTableToolbar from './components/InvoiceTableToolbar'
import { Chip } from '../ui/chip'
import { format, parseISO } from 'date-fns';

export default function InvoiceIndex() {
  const navigate = useNavigate();

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [selectedRow, setSelectedRow] = useState(null);

  const { data: invoiceTemplates, isLoading: isInvoiceTemplatesLoading, isError: isInvoiceTemplatesError, refetch } = useQuery({
    queryKey: [invoiceQueryKeyLookup['INVOICE_TEMPLATES']],
    queryFn: () => getAllInvoiceTemplates(),
  });

  useEffect(() => {
    if (isInvoiceTemplatesError) {
      toastError('Error fetching invoice templates');
    }
  }, [isInvoiceTemplatesError]);

  const handleRowClick = (rowData) => {
    setSelectedRow(rowData);
  };

  const handleClose = () => {
    setSelectedRow(null);
  };

  const handleEdit = useCallback((data) => {
    navigate(`${data?.unique_id}`);
  }, []);

  const handleDefultMutation = useMutation({
    mutationFn: setDefaultInvoiceTemplate,
    onSuccess: (res) => {
        toastSuccess(res?.message || `Default Invoice Template set successfully`);
        refetch();
    },
    onError: (error) => {
        toastError(`Error setting default Invoice Template: ${error?.err?.message}`);
    }
  });

  const columns = useMemo(() => [
    {
      header: "Sr No",
      accessorKey: "id",
      colClassName: "w-1/12",
    },
    {
      header: "Template Name",
      accessorKey: "name",
      colClassName: "w-4/12 text-start",
      HeaderClassName: "text-start",
    },
    {
      header: "Default",
      accessorKey: "is_default",
      colClassName: "w-2/12",
      cell: ({ _, row }) => (
        <div>
          {
            row?.original?.is_default ?
              <Chip className='capitalize' variant='light' color='green' radius='md' size='sm' border='none' 
              >Default
              </Chip> :
              <Button size='xs' type='button' variant="ghost" className="px-1.5 py-1.5 rounded-lg text-gray-500 hover:bg-green-100 hover:text-green-600" onClick={() => handleDefultMutation.mutate(row?.original?.unique_id)}>
                <Star size={16} />
              </Button>
          }
        </div>
      ),
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      colClassName: "w-2/12",
      cell: ({ cell }) => {
        const value = cell?.getValue();
        return value ? format(parseISO(value), "dd MMM yyyy, hh:mm a") : "-";
      },
    },
    {
      header: "Last Modified",
      accessorKey: "updated_at",
      colClassName: "w-2/12",
      cell: ({ cell }) => {
        const value = cell?.getValue();
        return value ? format(parseISO(value), "dd MMM yyyy, hh:mm a") : "-";
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
  ], [handleEdit]);

  const tableInstance = useReactTable({
    columns,
    data: invoiceTemplates?.data,
    state: {
      sorting,
      columnFilters
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters
  });

  return (
    <>
      <RowDetailsModal
        isOpen={selectedRow !== null}
        onClose={handleClose}
        data={selectedRow || {}}
        title="Invoice Template Details"
      />
      <Card className="rounded-lg border space-y-4 ">
        <CardHeader className="p-0  md:px-4 px-2 pt-3">
          <div className="space-y-4">
            <div className='flex md:flex-row flex-row justify-between items-center ' >
              <div>
                <CardTitle className='text-primary lg:text-2xl text-lg  font-bold' >Invoice Management</CardTitle>
                <p className='text-secondary lg:text-sm text-xs' >Manage Invoice for all your Orders</p>
              </div>

              <Button onClick={() => navigate('new')} className='md:px-3 px-1.5 md:py-2 py-1.5 ' size='sm' variant='add'>
                <div className='flex items-center gap-0.5 '>
                  <Plus className='md:size-4 size-3' />
                  <span className='md:text-sm text-xs'>New Invoice</span>
                </div>
              </Button>
            </div>
            <div>
              <InvoiceTableToolbar
                table={tableInstance}
                searchColumnId="name"
                searchPlaceholder="Filter by Invoice Name..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {
            isInvoiceTemplatesLoading ? (
              <div className='flex items-center justify-center min-h-[85dvh] ' >
                <SlackLoader />
              </div>
            ) : (
              <>
                <div className='pb-2 border-t'>
                  <CommonTable
                    table={tableInstance}
                    tableStyle='2xl:h-[69dvh] lg:h-[56dvh] h-[60dvh] '
                    tableHeadStyle='bg-white hover:bg-transparent '
                    tableHeadRowStyle='bg-transparent hover:bg-indigo-50/50'
                    tableBodyRowStyle='text-center bg-transparent hover:bg-indigo-50/50'
                    tableHeadCellStyle='text-center'
                  />
                </div>
                <div className="mt-2 pt-2 border-t">
                  <DataTablePagination table={tableInstance} count={invoiceTemplates?.data?.length || 0} />
                </div>
              </>
            )
          }
        </CardContent>
      </Card >
    </>

  )
}
