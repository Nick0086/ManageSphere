import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { orderQueryKeyLookup } from './utils';
import { getAllOrder } from '@/service/order.service';
import { useQuery } from '@tanstack/react-query';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { toastError } from '@/utils/toast-utils';
import CommonTable from '@/common/Table/CommonTable';
import { DataTablePagination } from '../ui/table-pagination';
import { Separator } from '../ui/separator';
import { ChevronsRight, Eye, ReceiptText, ScrollText } from 'lucide-react';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';
import OrderFilterBar from './orders-filter-bar';
import { getAllQrCode } from '@/service/table-qrcode.service';
import SlackLoader from '../ui/CustomLoaders/SlackLoader';
import { Chip } from '../ui/chip';
import { Link } from 'react-router';

export default function OrdersIndex() {

  const [filter, setFilter] = useState({
    status: null,
    table: null,
    id: '',
  })

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [orderQueryKeyLookup['ORDERS'], pagination?.pageSize, pagination?.pageIndex, filter],
    queryFn: () => getAllOrder({ offset: pagination?.pageIndex, limit: pagination?.pageSize, filter }),
  });

  const { data: tablesList, isLoading: isTablesListLoading, error: tablesListError } = useQuery({
    queryKey: [orderQueryKeyLookup['QRCODES']],
    queryFn: getAllQrCode,
  });

  useEffect(() => {
    if (error) {
      toastError(`Error fetching Orders: ${JSON.stringify(error)}`);
    }
    if (tablesListError) {
      toastError(`Error fetching Tables List: ${JSON.stringify(tablesListError)}`);
    }
  }, [tablesListError]);

  const tablesListOptions = useMemo(() => {
    return tablesList?.qrCodes?.map(table => ({
      value: table?.unique_id,
      label: table?.table_number,
    })) || [];
  }, [tablesList])


  const getColor = (color) => {
    switch (color) {
      case 'pending':
        return 'orange';
      case 'confirmed':
        return 'sky';
      case 'preparing':
        return 'violet';
      case 'ready':
        return 'green';
      case 'completed':
        return 'teal';
      case 'cancelled':
        return 'red';
      default:
        return 'slate'; 
    }
  }


  const columns = useMemo(() => [
    {
      header: 'Order ID',
      accessorKey: "unique_id",
      colClassName: 'text-start',
      HeaderClassName: 'text-start',
      cell: ({ cell }) => {
        return (
          <Link to={`/order-management/${cell.getValue()?.replace("_", "-")}`} key={cell?.id} className="flex items-center text-blue-600 cursor-pointer group gap-2" >
            <span className='whitespace-nowrap flex items-center gap-2'><ReceiptText size={16} />  #{cell.getValue()?.replace("_", "-")}</span>
            <div className="opacity-0 transition-all group-hover:opacity-100">
              <ChevronsRight size={18} />
            </div>
          </Link>
        );
      }
    },
    {
      header: 'Table Name',
      accessorKey: "table_name",
    },
    {
      header: 'Status',
      accessorKey: "status",
      cell: ({ getValue }) => <Chip className='capitalize' variant='light' color={getColor(getValue())} radius='md' size='sm' border='none' > {getValue()}</Chip>
    },
    {
      header: 'Amount',
      accessorKey: "total_amount",
      cell: ({ getValue }) => `$${getValue()?.replace("_", "-")}`
    },
    {
      header: 'Time',
      accessorKey: "created_at",
      cell: ({ getValue }) => formatDistanceToNow(new Date(getValue()), { addSuffix: true }),
    },
    {
      id: "actions",
      header: "Actions",
      HeaderClassName: "text-center",
      colClassName: "w-2/12 text-center",
      cell: ({ _, row }) => (
        <div>
          <Button size='xs' type='button' variant="ghost" className="rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600" >
            <Eye size={16} />
          </Button>
          <Button size='xs' type='button' variant="ghost" className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600">
            <ScrollText size={16} />
          </Button>
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: data?.data || [],
    rowCount: parseInt(data?.metadata?.total) || 0,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  return (
    <Card className="rounded-lg border">
      <CardHeader className="p-0 pb-2 border-b px-4 pt-3">
        <div className="space-y-4">
          <div>
            <CardTitle className='text-primary text-2xl font-bold' >Order Management</CardTitle>
            <p className='text-secondary text-sm' >Manage Orders for all your tables</p>
          </div>
          <div>
            <OrderFilterBar filte={filter} setFilter={setFilter} tablesListOptions={tablesListOptions} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-00">
        {
          (isLoading || isTablesListLoading) ?
            (
              <div className='flex items-center justify-center min-h-[60dvh] ' >
                <SlackLoader />
              </div>
            ) : (
              <>
                <CommonTable
                  table={table}
                  tableStyle='2xl:h-[69dvh] h-[60dvh] px-4'
                  tableHeadStyle='bg-transparent hover:bg-transparent'
                  tableHeadRowStyle='bg-transparent hover:bg-indigo-50/50'
                  tableBodyRowStyle='text-center bg-transparent hover:bg-indigo-50/50'
                  tableHeadCellStyle='text-center'
                />
                <Separator className='my-2 bg-gray-500' />
                <DataTablePagination table={table} count={parseInt(data?.metadata?.total) || 0} />
              </>
            )
        }

      </CardContent>
    </Card >
  )
}
