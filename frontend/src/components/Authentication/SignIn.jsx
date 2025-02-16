import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { registerUser } from '@/service/user.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { Form } from '../ui/form';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import PulsatingDots from '../ui/loaders/PulsatingDots';

const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: "",
    password: ""
}

const schema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email().required('Email is required'),
    mobileNo: yup.string().required('Mobile number is required'),
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
        )
})

export default function SignIn() {
    const navigate = useNavigate();
    const userDetails = JSON.parse(window?.localStorage.getItem("userData") || "{}");
    const [isLoading, setIsLoading] = useState(true);
    const form = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    })

    const firstName = form.watch('firstName')
    const lastName = form.watch('lastName')

    const registerUserMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            toastSuccess(`Registertion Of ${firstName} ${lastName} successfully`);
            form.reset(defaultValues);
        },
        onError: (error) => {
            console.log(`Error in Registertion of ${firstName} ${lastName}`, error);
            toastError(`Error in registertion of ${firstName} ${lastName}: ${JSON.stringify(error)}`)
        }
    })

    const onSubmitForm = (data) => {
        registerUserMutation.mutate(data)
    }

    useEffect(() => {
        if (Object.keys(userDetails)?.length) {
            navigate('/')
        } else {
            setIsLoading(false)
        }
    }, [navigate, userDetails])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PulsatingDots size={5} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] lg:py-6">
            <Card className="w-11/12 md:w-full lg:max-w-md max-w-lg">
                <CardHeader className="pb-0" >
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                        <p className="text-gray-600 mx-auto text-sm md:max-w-[85%] max-w-[90%]">
                            Join our community to access exclusive features and personalized content. Start your journey with us today!
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-y-2' >

                            <ReusableFormField control={form.control} name='firstName' required={true} label='First Name' labelClassName='text-xs text-gray-600' />

                            <ReusableFormField control={form.control} name='lastName' required={true} label='Last Name' labelClassName='text-xs text-gray-600' />

                            <ReusableFormField control={form.control} name='email' type='email' required={true} label='Email' labelClassName='text-xs text-gray-600' />

                            <ReusableFormField control={form.control} name='mobileNo' type='PhoneInput' required={true} label='Mobile number' labelClassName='text-xs text-gray-600' />

                            <ReusableFormField control={form.control} name='password' type='password' required={true} label='Password' labelClassName='text-xs text-gray-600' />

                            <Button className='mt-3' variant="primary" disabled={registerUserMutation?.isPending} isLoading={registerUserMutation?.isPending} type='submit' loadingText=''  >
                                Create Account
                            </Button>

                            <p className="text-center text-sm text-gray-500 mt-2">
                                Already have an account?{' '}
                                <Link to={'/login'} className="text-blue-500 hover:text-blue-600">
                                    Sign in
                                </Link>
                            </p>

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

    )
}
