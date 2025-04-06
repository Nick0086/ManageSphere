import React, { memo } from 'react';
import { useParams } from 'react-router';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useOrder, useOrderHistory } from '@/contexts/order-management-context';
import { Chip } from '../ui/chip';
import { AppTooltip } from '@/common/AppTooltip';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { createOrder } from '@/service/order.service';
import { captureInvoiceSnapshot } from '@/service/invoices.service';

const StatusBadge = memo(({ type }) => {
    return (
        <AppTooltip content={type === "veg" ? "Veg" : "Non Veg"} >
            <Chip className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={type === "veg" ? 'green' : 'red'}>
                <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
            </Chip>
        </AppTooltip>
    )
})

const OrderItem = ({ item }) => {
    const { addItem, removeItem } = useOrder();

    return (
        <Card className="mb-2">
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <StatusBadge type={item?.veg_status} />
                            <h4 className="font-medium text-primary">{item.name}</h4>
                        </div>
                        <div className='flex items-center gap-1' >
                            <p className="text-sm text-muted-foreground">${item.price} x {item.quantity}</p>
                            <p className="text-sm text-primary">(${item.price * item.quantity})</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => removeItem(item)}>
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => addItem(item)}>
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const OrderDrawer = () => {
    const { restaurantId, tableId } = useParams();
    const { orderItems, total, isOrderDrawerOpen, toggleOrderDrawer, clearOrder, submitOrder, isSubmitting } = useOrder();
    const { addItem } = useOrderHistory()

    const orderCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const orderCreateMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: (res, variables) => {
            captureInvoiceSnapshot({orderId : res?.orderId, restaurantId : restaurantId})
            toastSuccess(res?.message || 'Order successfully');
            addItem({ ...variables, orderUniqueId: res?.orderId })
            clearOrder()
        },
        onError: (error) => {
            toastError(`Error During Add Order: ${error?.err?.message}`);
        }
    });

    const handlePlaceOrder = () => {
        orderCreateMutation.mutate({ items: orderItems, totalAmount: total, restaurantId, tableId })
    };

    return (
        <Sheet open={isOrderDrawerOpen} >
            <SheetTrigger asChild>
                <Card
                    className="fixed bottom-4 right-4 z-50 flex items-center justify-between p-4 cursor-pointer bg-surface-background"
                    onClick={toggleOrderDrawer}
                >
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-500/10 text-indigo-500 rounded-full p-2">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium">Your Order</h3>
                            <p className="text-sm text-muted-foreground">
                                {orderCount} items · ${total.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </Card>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0" onClose={toggleOrderDrawer}>
                <SheetHeader className='p-4' >
                    <SheetTitle>Your Order</SheetTitle>
                </SheetHeader>
                <Separator className="bg-gray-400" />
                <div className="flex flex-col h-[88dvh] p-0">
                    {orderItems.length > 0 ? (
                        <>
                            <ScrollArea className="flex-1 p-4">
                                <div >
                                    {orderItems.map((item) => (
                                        <OrderItem key={item.id || item.unique_id} item={item} />
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="mt-auto pt-2">
                                <Separator className="my-2 bg-gray-400" />
                                <div className="flex justify-between py-2 px-4">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-semibold">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2 p-4 pt-2">
                                    <Button variant="outline" className="flex-1" onClick={clearOrder} disabled={isSubmitting}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Clear All
                                    </Button>

                                    <Button variant="primary" className="flex-1" onClick={handlePlaceOrder} disabled={isSubmitting || orderItems.length === 0 || orderCreateMutation?.isPending} isLoading={orderCreateMutation?.isPending || isSubmitting}>
                                        Place Order
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="font-medium text-lg">Your order is empty</h3>
                            <p className="text-muted-foreground mt-2">
                                Add items from the menu to start your order
                            </p>
                            <Button variant="outline" className="mt-4" onClick={toggleOrderDrawer}>
                                Browse Menu
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};