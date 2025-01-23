import ReusableFormField from '@/common/Form/ReusableFormField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { verifyPassword } from '@/service/auth.service';
import { toastError } from '@/utils/toast-utils';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'

const INITIAL_ERROR_STATE = {
    error: false,
    message: ''
};

const loginIdMap = {
    EMAIL: 'email',
    MOBILE: 'sms/whatsapp'
}

export default function LoginWithPassoword({
    form,
    onChangeLoginWithOption,
    loginId,
    loginType,
}) {

    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);

    const loginWithPasswordMutation = useMutation({
        mutationFn: verifyPassword,
        onSuccess: () => {

        },
        onError: (error) => {
            console.error("Error in verifying login id:", error);
            toastError(`Error in verifying login id: ${JSON.stringify(error)}`);

            const errorMessage = error?.err?.status === 404 || error?.err?.status === 401
                ? error?.err?.message
                : error?.err?.error || 'Something went wrong';

            setErrors(prev => ({
                ...prev,
                error: true,
                message: errorMessage
            }));
        }
    })

    const onSubmitForm = (data) => {
        // console.log("LoginWithPassoword --> onSubmitForm", data)
        loginWithPasswordMutation.mutate({ ...data, loginId, loginType })
    }

    const resetError = () => {
        setErrors(INITIAL_ERROR_STATE)
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-4' >
                <div>
                    <ReusableFormField control={form.control} name='password' type='password' label='Password' labelClassName='text-xs text-gray-600' onValueChange={resetError} />

                    {errors?.error && (<div className='text-red-500 text-[0.8rem] font-medium text-destructive'>{errors.message}</div>)}

                </div>

                <Button className='w-full' variant="primary" disabled={loginWithPasswordMutation?.isPending} isLoading={loginWithPasswordMutation?.isPending} type='submit' loadingText=' '  >
                    Sign In
                </Button>

                <div className='flex flex-row gap-2 items-center justify-between w-full' >

                    <Button onClick={() => onChangeLoginWithOption(false)} type='button' variant="none" size="sm" className="text-blue-600 font-semibold p-0">
                        Sign in using {loginIdMap[loginType]} OTP
                    </Button>

                    <Button type='button' variant="none" size="sm" className="text-blue-600 font-semibold p-0">
                        Resend
                    </Button>
                </div>
            </form>

        </Form>
    )
}
