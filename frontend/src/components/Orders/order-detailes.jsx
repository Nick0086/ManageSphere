import React, { memo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import InfoCard from './components/info-card';
import { Info, MessageSquareMore, ReceiptText, ScrollText } from 'lucide-react';
import { getOrderById, updateOrderStatus } from '@/service/order.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SlackLoader from '../ui/CustomLoaders/SlackLoader';
import { toast } from 'react-toastify';
import { orderQueryKeyLookup, orderStatus } from './utils';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { AppTooltip } from '@/common/AppTooltip';
import { Chip } from '../ui/chip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import OrderStatusSelector from './components/OrderStatusSelector';

const StatusBadge = memo(({ type }) => {
  return (
    <AppTooltip content={type === "veg" ? "Veg" : "Non Veg"} >
      <Chip className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={type === "veg" ? 'green' : 'red'}>
        <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
      </Chip>
    </AppTooltip>
  )
})

export default function OrderDetailes() {

  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [orderQueryKeyLookup['ORDER_DETAILS'], orderId],
    queryFn: () => getOrderById(orderId?.replace('-', '_'))
  })

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error])

  const handleStatusChangeMutation = useMutation({
    mutationFn: (data) => updateOrderStatus(data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(
        [orderQueryKeyLookup['ORDER_DETAILS'], orderId],
        (oldData) => {
          console.log(oldData); 
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            order: {
              ...oldData.order,
              status: variables.status
            }
          };
        }
      );
      toastSuccess(res?.message || 'Status updated successfully');
    },
    onError: (error) => {
      toastError(`Error updating status: ${JSON.stringify(error)}`);
    },
  });

  return (
    <Card className="rounded-lg border">
      <CardHeader className="p-0 pb-2 border-b px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className='flex items-center gap-2' >
            <CardTitle className='text-primary text-2xl font-bold' >#{orderId}</CardTitle>
            {
              data?.order?.status ? (
                <OrderStatusSelector
                  value={data?.order?.status}
                  onChange={(value) => handleStatusChangeMutation.mutate({ uniqueId: data?.order?.unique_id, status: value })}
                  isLoading={handleStatusChangeMutation.isPending}
                  options={orderStatus}
                  placeholder='Select Status'
                  searchPlaceholder='Search Status...'
                  emptyMessage='No status found'
                />) : ""
            }
          </div>

          <Button variant="back" size='sm' border='none' onClick={() => navigate('/order-management')}>
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 py-4">
        {
          isLoading ?
            <div className='flex items-center justify-center min-h-[60dvh] ' >
              <SlackLoader />
            </div>
            : error ?
              <div className='px-4' >
                <InfoCard icon={<Info size={18} />} title='Error Loading Order' description=''>
                  <div className='space-y-2' >
                    <p>
                      We could not load the order details at this time. This may be due to a network issue or the order may not exist. try again.
                    </p>
                    <div>
                      <Button size="sm" variant="primary" onClick={() => queryClient.invalidateQueries(orderQueryKeyLookup['ORDER_DETAILS'], orderId)}>
                        Try Again
                      </Button>
                    </div>

                  </div>
                </InfoCard>
              </div>
              :
              <div className='space-y-6' >
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4' >
                  <InfoCard
                    icon={<Info size={18} />}
                    title='Order Information'
                    description=''
                  >
                    <div>
                      <span>Order Form : </span>
                      <span>{data?.order?.table_name}</span>
                    </div>
                    <div>
                      <span>Order Time : </span>
                      <span>{formatDistanceToNow(new Date(data?.order?.created_at), { addSuffix: true })}</span>
                    </div>
                  </InfoCard>
                  <InfoCard
                    icon={<ScrollText size={18} />}
                    title='Order Summary'
                    description=''
                  >
                    <div>
                      <span>Sub Amount : </span>
                      <span>${data?.order?.total_amount}</span>
                    </div>
                    <div>
                      <span>Total Amount : </span>
                      <span>${data?.order?.total_amount}</span>
                    </div>
                  </InfoCard>
                  <InfoCard
                    icon={<ReceiptText size={18} />}
                    title='Actions'
                    description=''
                  >
                    No Special Request for this order
                  </InfoCard>
                </div>
                <div className='px-4 space-y-4' >
                  <h4 className='text-lg font-bold' >Ordered Items</h4>
                  <div>
                    <Table parentClassName={'2xl:h-[69dvh] h-[60dvh]'} >
                      <TableBody className='' >
                        {data?.order?.items?.length > 0 ? (
                          data?.order?.items?.map((row) => (
                            <TableRow key={row.unique_id} className={'text-center bg-transparent hover:bg-indigo-50/50'}>
                              <TableCell className='text-left py-3 ' ><div className='flex items-center gap-2' ><StatusBadge type={row.veg_status} /> {row.menu_item_name}</div> </TableCell>
                              <TableCell > {row.quantity}</TableCell>
                              <TableCell > ${row.price}</TableCell>
                              <TableCell > ${row.price * row.quantity}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-20 font-semibold text-lg"
                            >
                              No Data
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className='px-4' >
                  <InfoCard icon={<MessageSquareMore size={18} />} title='Customer Notes' description=''>
                    {data?.order?.customer_notes || 'No Special Request for this order'}
                  </InfoCard>
                </div>

              </div>

        }
      </CardContent>
    </Card >
  )
}
