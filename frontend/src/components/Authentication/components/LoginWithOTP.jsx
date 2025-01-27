import React, { useState } from 'react';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { useInterval } from 'usehooks-ts';
import { verifyOPT } from '@/service/auth.service';
import { useMutation } from '@tanstack/react-query';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { useNavigate } from 'react-router';

// Constants
const INITIAL_ERROR_STATE = {
    error: false,
    message: ''
};

export default function LoginWithOTP({
    form,
    sendOTPMutation,
    onChangeLoginWithOption,
    loginId,
    loginType,
}) {
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);
    const [resendTimer, setresendTimer] = useState(10);
    const navigate = useNavigate();

    const loginWithOTPMutation = useMutation({
        mutationFn: verifyOPT,
        onSuccess: () => {
            toastSuccess('Login Successful');
            navigate(`/`);
        },
        onError: (error) => {
            console.error("Error in verifying login id:", error);
            toastError(`Error in verifying login id: ${JSON.stringify(error)}`);

            const errorMessage =
                error?.err?.status === 404 || error?.err?.status === 401
                    ? error?.err?.message
                    : error?.err?.error || error?.err?.message || 'Something went wrong';

            setErrors(prev => ({
                ...prev,
                error: true,
                message: errorMessage
            }));
        }
    });

    const onSubmitForm = (data) => {
        console.log("LoginWithOTP --> onSubmitForm", data);
        loginWithOTPMutation.mutate(data);
    };

    const onResendOTPhandler = async () => {
        await sendOTPMutation.mutateAsync({ loginId, loginType })
        setresendTimer(60)
        resetError()
    }

    const resetError = () => {
        setErrors(INITIAL_ERROR_STATE);
    };

    useInterval(() => {
        if (resendTimer > 0) {
            setresendTimer(prev => prev - 1);
        }
    }, (resendTimer > 0) ? 1000 : null);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-4'>
                <div>
                    <ReusableFormField
                        control={form.control}
                        name='OTP'
                        type='OTP'
                        label=''
                        labelClassName='text-xs text-gray-600'
                        className='w-full'
                        onValueChange={resetError}
                        disabled={loginWithOTPMutation?.isPending || sendOTPMutation?.isPending}
                    />

                    {errors?.error && (
                        <div className='text-red-500 text-[0.8rem] font-medium text-destructive'>
                            {errors.message}
                        </div>
                    )}
                </div>

                <Button

                    className='w-full'
                    variant="primary"
                    type='submit'
                    loadingText=' '
                    disabled={loginWithOTPMutation?.isPending || sendOTPMutation?.isPending}
                    isLoading={loginWithOTPMutation?.isPending}
                >
                    Verify
                </Button>

                <div className='flex flex-row gap-2 items-center justify-between w-full'>
                    <Button
                        onClick={() => onChangeLoginWithOption(false)}
                        type='button'
                        variant="none"
                        size="sm"
                        disabled={loginWithOTPMutation?.isPending || sendOTPMutation?.isPending}
                        className="text-blue-600 font-semibold p-0"
                    >
                        Sign in using password
                    </Button>

                    {
                        resendTimer > 0 ? (
                            <span className='text-gray-600 text-sm font-semibold'>
                                Resend in {resendTimer}s
                            </span>
                        ) : (
                            <Button
                                type='button'
                                variant="none"
                                size="sm"
                                className="text-blue-600 font-semibold p-0"
                                onClick={onResendOTPhandler}
                                loadingText=' '
                                disabled={loginWithOTPMutation?.isPending || sendOTPMutation?.isPending}
                                isLoading={sendOTPMutation?.isPending}
                            >
                                Resend OTP
                            </Button>
                        )
                    }


                </div>
            </form>
        </Form>
    );
}