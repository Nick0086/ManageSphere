import ReusableFormField from '@/common/Form/ReusableFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { userVerified } from '@/service/auth.service'
import { toastError, toastSuccess } from '@/utils/toast-utils'
import { useMutation } from '@tanstack/react-query'
import { Mail, Phone } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router'


const INITIAL_ERROR_STATE = {
    error: false,
    message: ''
};

export default function LoginIdVerifier({
    form,
    seiIsLoginIdVerified
}) {

    // Error states
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);

    const loginType = form.watch('loginType')

    const loginTypeOptions = [
        { label: <div className='flex items-center gap-2 text-sm'><Mail size={20} /> Email</div>, value: 'EMAIL' },
        { label: <div className='flex items-center gap-2 text-sm'><Phone size={20} /> Mobile</div>, value: 'MOBILE' },
    ]

    const loginIdVerifitionMutation = useMutation({
        mutationFn: userVerified,
        onSuccess: () => {
            seiIsLoginIdVerified(true)
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
        loginIdVerifitionMutation.mutate(data)
    }

    const resetError = () => {
        setErrors(INITIAL_ERROR_STATE)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} >
                <div className='flex gap-2' >
                    <ReusableFormField control={form.control} name='loginType' type='select' options={loginTypeOptions} coustomValue={loginType === 'EMAIL' ? <Mail size={20} /> : <Phone size={20} />} label='' className='tw-w-full' labelClassName='text-xs text-gray-600' placeholder={'Email Address'} onValueChange={() => {
                        form.setValue('loginId', '')
                        resetError();
                    }} />
                    {
                        loginType === 'EMAIL' ?
                            <ReusableFormField control={form.control} name='loginId' type='email' label='' labelClassName='text-xs text-gray-600' placeholder={'Email Address'} className='w-full' onValueChange={resetError} />
                            : <ReusableFormField control={form.control} name='loginId' type='PhoneInput' label='' labelClassName='text-xs text-gray-600' className='w-full' onValueChange={resetError} />

                    }
                </div>

                {
                    errors?.error && (
                        <div className='text-red-500 text-[0.8rem] font-medium text-destructive'>{errors.message}</div>
                    )
                }

                <Button className='mt-3 w-full' variant="primary" disabled={loginIdVerifitionMutation?.isPending} isLoading={loginIdVerifitionMutation?.isPending} type='submit' loadingText=' '  >
                    Next
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account yet?{' '}
                    <Link to={'/register-user'} className="text-blue-500 hover:text-blue-600">
                        Create Account
                    </Link>
                </p>
            </form>

        </Form>
    )
}