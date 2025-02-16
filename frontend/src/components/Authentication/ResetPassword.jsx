import ReusableFormField from '@/common/Form/ReusableFormField';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Form } from '../ui/form';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate, useSearchParams } from 'react-router';
import PulsatingDots from '../ui/loaders/PulsatingDots';
import { resetPassowrdTokenCheck, resetPassword } from '@/service/auth.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { useMutation, useQuery } from '@tanstack/react-query';

const defaultValues = {
    password: '',
    confirmPassword: '',
}

const schema = yup.object().shape({
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/(?=.*[a-z])/, 'Password must include at least one lowercase letter')
        .matches(/(?=.*[A-Z])/, 'Password must include at least one uppercase letter')
        .matches(/(?=.*\d)/, 'Password must include at least one number')
        .matches(
            /(?=.*[@$!%*?&])/,
            'Password must include at least one special character (@, $, !, %, *, ?, or &)'
        )
        .matches(
            /^[A-Za-z\d@$!%*?&]{8,}$/,
            'Password can only contain letters, numbers, and special characters (@, $, !, %, *, ?, &)'
        ),
    confirmPassword: yup.string()
        .required('Confirm Password is required')
        .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const INITIAL_ERROR_STATE = {
    error: false,
    message: ''
};

export default function ResetPassword() {
    const userDetails = JSON.parse(window?.localStorage.getItem("userData") || "{}");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoding] = useState(true);
    const [isShowLoading, setIsShowLoading] = useState(true);
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);
    const token = searchParams.get('token');

    const form = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    })

    const { data: verifyData, isLoading: isVerifyLoading, error: verifyError } = useQuery({
        queryKey: ['resetPassowrdTokenCheck', token],
        queryFn: async () => {
            const res = await resetPassowrdTokenCheck(token);
            return res.data;
        },
        retry: false,
        enabled: !!token,
    });

    const resetPasswordMutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            toastSuccess('Password reset successfully')
            form.reset(defaultValues);
            resetError()
            navigate('/login')
        },
        onError: (error) => {
            toastError(`Error in reset Password : ${JSON.stringify(error)}`);
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
    })

    const onSubmitForm = (data) => {
        const token = searchParams.get('token');
        resetPasswordMutation.mutate({ newPassword: data?.password, token })
    }

    const resetError = () => {
        setErrors(INITIAL_ERROR_STATE);
    };

    useEffect(() => {
        if (token) {
            setIsLoding(false)
        } else {
            if (Object.keys(userDetails)?.length) {
                navigate('/')
            } else {
                navigate('/login')
            }
        }
    }, [])

    useEffect(() => {
        if (Object.keys(userDetails)?.length) {
            navigate('/')
        } else {
            if (verifyError) {
                toastError(verifyError?.response?.data?.message || "Invalid or expired token")
                navigate('/login')
            } else {
                setIsShowLoading(false)
            }
        }

    }, [verifyError, navigate, userDetails])


    if (isLoading || isVerifyLoading || isShowLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] lg:py-6">
                <PulsatingDots size={6} />
            </div>
        )
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] lg:py-6">
            <Card className="w-11/12 md:w-full lg:max-w-md max-w-lg">
                <CardHeader className="pb-0" >
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-y-2' >

                            <ReusableFormField control={form.control} name='password' type='password' label='Password' labelClassName='text-xs text-gray-600' onValueChange={resetError} disabled={resetPasswordMutation.isPending} />

                            <ReusableFormField control={form.control} name='confirmPassword' type='password' label='Confirm Password' labelClassName='text-xs text-gray-600' onValueChange={resetError} disabled={resetPasswordMutation.isPending} />

                            {errors?.error && (
                                <div className='text-red-500 text-[0.8rem] font-medium text-destructive'>
                                    {errors.message}
                                </div>
                            )}

                            <Button className='mt-3' variant="primary" disabled={resetPasswordMutation.isPending} isLoading={resetPasswordMutation.isPending} type='submit' loadingText=''  >
                                Submit
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
