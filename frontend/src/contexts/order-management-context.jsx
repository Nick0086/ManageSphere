// First, add a function to send the order to the server in your order-management-context.js file

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import moment from "moment";


// Order context for state management
const OrderContext = createContext();
const OrderHistoryContext = createContext();


// Initial state
const initialState = {
    orderItems: [],
    total: 0,
    isOrderDrawerOpen: false,
    isSubmitting: false
};

// Order reducer
function orderReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.orderItems.findIndex(
                item => item.id === action.payload.id
            );

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const updatedItems = [...state.orderItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };

                return {
                    ...state,
                    orderItems: updatedItems,
                    total: calculateTotal(updatedItems)
                };
            } else {
                // New item
                const newItem = { ...action.payload, quantity: 1 };

                return {
                    ...state,
                    orderItems: [...state.orderItems, newItem],
                    total: calculateTotal([...state.orderItems, newItem])
                };
            }
        }

        case 'REMOVE_ITEM': {
            const existingItemIndex = state.orderItems.findIndex(
                item => item.id === action.payload.id
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...state.orderItems];

                if (updatedItems[existingItemIndex].quantity > 1) {
                    // Reduce quantity
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: updatedItems[existingItemIndex].quantity - 1
                    };
                } else {
                    // Remove item
                    updatedItems.splice(existingItemIndex, 1);
                }

                return {
                    ...state,
                    orderItems: updatedItems,
                    total: calculateTotal(updatedItems)
                };
            }
            return state;
        }

        case 'CLEAR_ORDER':
            return {
                ...state,
                orderItems: [],
                total: 0
            };

        case 'TOGGLE_ORDER_DRAWER':
            return {
                ...state,
                isOrderDrawerOpen: !state.isOrderDrawerOpen
            };

        case 'SET_SUBMITTING':
            return {
                ...state,
                isSubmitting: action.payload
            };

        default:
            return state;
    }
}

// Helper function to calculate total
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Order Provider component
export const OrderProvider = ({ children }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState);

    // Save order to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('restaurantOrder', JSON.stringify(state.orderItems));
        }
    }, [state.orderItems]);

    // Load order from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedOrder = localStorage.getItem('restaurantOrder');
            if (savedOrder) {
                const parsedOrder = JSON.parse(savedOrder);
                parsedOrder.forEach(item => {
                    dispatch({ type: 'ADD_ITEM', payload: item });
                });
            }
        }
    }, []);

    const addItem = (item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
        toast({
            title: "Item added",
            description: `${item.name} added to your order`,
            duration: 2000,
        });
    };

    const removeItem = (item) => {
        dispatch({ type: 'REMOVE_ITEM', payload: item });
    };

    const clearOrder = () => {
        dispatch({ type: 'CLEAR_ORDER' });
    };

    const toggleOrderDrawer = () => {
        dispatch({ type: 'TOGGLE_ORDER_DRAWER' });
    };

    // New function to submit the order
    const submitOrder = async (tableId, restaurantId) => {
        // Don't submit if no items
        if (state.orderItems.length === 0) {
            toast({
                title: "Error",
                description: "Cannot place an empty order",
                status: "error",
                duration: 3000,
            });
            return;
        }

        dispatch({ type: 'SET_SUBMITTING', payload: true });

        try {
            // Format the order data
            const orderData = {
                restaurantId,
                tableId,
                items: state.orderItems.map(item => ({
                    itemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    veg_status: item.veg_status
                })),
                total: state.total
            };

            // Make API call to submit order
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            const data = await response.json();

            // Clear the order after successful submission
            clearOrder();

            // Close the drawer
            toggleOrderDrawer();

            // Show success message
            toast({
                title: "Order placed",
                description: `Your order has been submitted successfully. Order ID: ${data.orderId}`,
                status: "success",
                duration: 5000,
            });
        } catch (error) {
            console.error('Error placing order:', error);
            toast({
                title: "Error",
                description: "Failed to place your order. Please try again.",
                status: "error",
                duration: 3000,
            });
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
    };

    return (
        <OrderContext.Provider
            value={{
                ...state,
                addItem,
                removeItem,
                clearOrder,
                toggleOrderDrawer,
                submitOrder
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

// Custom hook for using the order context
export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

export const OrderHistoryProvider = ({ restaurantId, tableId, children }) => {

    const [orderHistory, setOrderHistory] = useState({});

    // Load order from local storage when restaurantId or tableId changes
    useEffect(() => {
        const savedOrder = localStorage.getItem(`order_${restaurantId}_${tableId}`);
        console.log("OrderHistoryProvider",savedOrder)
        if (savedOrder) {
            setOrderHistory(JSON.parse(savedOrder));
        } else {
            setOrderHistory([]);
        }
    }, [restaurantId, tableId]);

    useEffect(() => {
        if(Object.keys(orderHistory || {})?.length > 0){
            localStorage.setItem(`order_${restaurantId}_${tableId}`, JSON.stringify(orderHistory));
        }
    }, [orderHistory]);

    // Context functions
    const addItem = (item) => {
        setOrderHistory((prevItems) => ({
            ...prevItems,
            [moment().format('DD-MM-YYYY HH:mm:ss')]: item
        }));
    };

    const clearOrder = () => {
        setOrderHistory([]);
    };


    return (
        <OrderHistoryContext.Provider value={{ orderHistory, clearOrder, addItem }}>
            {children}
        </OrderHistoryContext.Provider>
    );
};

// Custom hook for using the order context
export const useOrderHistory = () => {
    const context = useContext(OrderHistoryContext);
    if (!context) {
        throw new Error('useOrderHistory must be used within an OrderHistoryProvider');
    }
    return context;
};