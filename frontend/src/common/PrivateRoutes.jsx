import { Navigate, Outlet, useLocation } from "react-router";



export function PrivateRoutes() {
    const location = useLocation();
    let token = window.localStorage.getItem("userData");

    // console.log("Userdata = ", (token))

    if (token === undefined) {
        return null; // or loading indicator/spinner/etc
    }

    return (token !== null ? <Outlet /> : <Navigate to="/register-user" replace state={{ from: location }} />)
}

export default PrivateRoutes;