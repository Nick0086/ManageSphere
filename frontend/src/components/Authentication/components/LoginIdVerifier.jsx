import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { userVerified } from '@/service/auth.service';
import { toastError } from '@/utils/toast-utils';
import { Link } from 'react-router';

// Constants
const INITIAL_ERROR_STATE = {
    error: false,
    message: ''
};

const LOGIN_TYPE_OPTIONS = [
    {
        label: (
            <div className='flex items-center gap-2 text-sm'>
                <Mail size={20} /> Email
            </div>
        ),
        value: 'EMAIL'
    },
    {
        label: (
            <div className='flex items-center gap-2 text-sm'>
                <Phone size={20} /> Mobile
            </div>
        ),
        value: 'MOBILE'
    }
];

export default function LoginIdVerifier({ form, setIsLoginIdVerified }) {
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);
    const loginType = form.watch('loginType');

    const loginIdVerificationMutation = useMutation({
        mutationFn: userVerified,
        onSuccess: () => {
            setIsLoginIdVerified(true);
        },
        onError: (error) => {
            console.error("Error in verifying login id:", error);
            toastError(`Error in verifying login id: ${JSON.stringify(error)}`);

            const errorMessage =
                error?.err?.status === 404 || error?.err?.status === 401
                    ? error?.err?.message
                    : error?.err?.error || 'Something went wrong';

            setErrors(prev => ({
                ...prev,
                error: true,
                message: errorMessage
            }));
        }
    });

    const onSubmitForm = (data) => {
        loginIdVerificationMutation.mutate(data);
    };

    const resetError = () => {
        setErrors(INITIAL_ERROR_STATE);
    };

    const handleLoginTypeChange = () => {
        form.setValue('loginId', '');
        resetError();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)}>
                <div className='flex gap-2'>
                    <ReusableFormField
                        control={form.control}
                        name='loginType'
                        type='select'
                        options={LOGIN_TYPE_OPTIONS}
                        coustomValue={loginType === 'EMAIL' ? <Mail size={20} /> : <Phone size={20} />}
                        label=''
                        labelClassName='text-xs text-gray-600'
                        placeholder='Email Address'
                        onValueChange={handleLoginTypeChange}
                    />

                    {loginType === 'EMAIL' ? (
                        <ReusableFormField
                            control={form.control}
                            name='loginId'
                            type='email'
                            label=''
                            labelClassName='text-xs text-gray-600'
                            placeholder='Email Address'
                            className='w-full'
                            onValueChange={resetError}
                        />
                    ) : (
                        <ReusableFormField
                            control={form.control}
                            name='loginId'
                            type='PhoneInput'
                            label=''
                            labelClassName='text-xs text-gray-600'
                            className='w-full'
                            onValueChange={resetError}
                        />
                    )}
                </div>

                {errors.error && (
                    <div className='text-red-500 text-[0.8rem] font-medium text-destructive'>
                        {errors.message}
                    </div>
                )}

                <Button
                    className='mt-3 w-full'
                    variant="primary"
                    disabled={loginIdVerificationMutation?.isPending}
                    isLoading={loginIdVerificationMutation?.isPending}
                    type='submit'
                    loadingText=' '
                >
                    Next
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account yet?{' '}
                    <Link to='/register-user' className="text-blue-500 hover:text-blue-600">
                        Create Account
                    </Link>
                </p>
            </form>
        </Form>
    );
}