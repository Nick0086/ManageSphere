import { Route, Routes } from "react-router";
import OrderDetailes from "@/components/Orders/order-detailes";
import OrdersIndex from "@/components/Orders/OrdersIndex";

export default function OrderRoutes() {
    return (
        <Routes>
            <Route path="/" element={<OrdersIndex />} />
            <Route path="/:orderId" element={<OrderDetailes />} />
        </Routes>
    )
}
