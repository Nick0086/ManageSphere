import * as React from 'react';
import { CircleUser, LayoutGrid, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { logOut } from '@/service/auth.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';

const getInitials = (name) => {
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
};

export function UserNav() {
  const [userDetails, setUserDetails] = React.useState(() => window?.localStorage.getItem("userData"));
  const navigate = useNavigate();


  const logOutMutation = useMutation({
    mutationFn: logOut,
    onSuccess: (res) => {
      toastSuccess(res?.data?.message)
      window.localStorage.removeItem('userData')
      navigate('/login')
    },
    onError: (error) => {
      toastError(`Error in Send OTP to ${loginId} : ${JSON.stringify(error)}`);
    },

  })

  const onlogout = async () => {
    try {
      logOutMutation.mutate();
    } catch (error) {
      toast.error(`Error in Logout: ${JSON.stringify(error)}`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild disabled={logOutMutation.isPending}>
                <Button
                  variant="outline"
                  size='icon'
                  className="relative rounded-lg"
                >
                  <User size={16} className='text-black' />
                  {/* <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userDetails?.userImageUrl} alt="Avatar" onLoadingStatusChange={(status) => {
                      console.log("status", status)
                      if (status === 'error') {
                        getUserProfileImageUrl();
                      }
                    }} />
                    <AvatarFallback className="bg-transparent">
                      {getInitials(userDetails?.userName + ' ' + userDetails?.userLastname) || 'U'}
                    </AvatarFallback>
                  </Avatar> */}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent className="w-56" align="end" forceMount style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none">{userDetails?.first_name} {userDetails?.last_name}</span>
              <p className="text-xs leading-none text-muted-foreground">
                {userDetails?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="hover:cursor-pointer" asChild>
              <Link to="/dashboard" className="flex items-center text-gray-700 no-underline">
                <LayoutGrid className="size-5 mr-3 text-muted-foreground" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:cursor-pointer" asChild>
              <Link to="/my-profile" className="flex items-center text-gray-700 no-underline">
                <CircleUser className="size-5 mr-3 text-muted-foreground" />
                My Profile
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="hover:cursor-pointer text-red-500 hover:text-red-700" onClick={onlogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
