import PulsatingDots from "@/components/ui/loaders/PulsatingDots";
import { checkUserToken } from "@/service/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

export function PrivateRoutes() {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const userCheckMutation = useMutation({
        mutationFn: checkUserToken,
        onSuccess: () => {
            setIsAuthenticated(true);
            setIsLoading(false);
        },
        onError: (error) => {
            console.error("Error while checking user token", error);
            setIsAuthenticated(false);
            setIsLoading(false);
        },
    });

    useEffect(() => {
        userCheckMutation.mutate();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PulsatingDots size={5} />
            </div>
        );
    }

    return (isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />);
}

export default PrivateRoutes;