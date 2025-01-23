import React, { useState } from 'react';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import ReusableFormField from '@/common/Form/ReusableFormField';

// Constants
const INITIAL_ERROR_STATE = {
    error: false,
    message: ''
};

export default function LoginWithOTP({
    form,
    onChangeLoginWithOption,
    loginId,
    loginType,
}) {
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);

    const onSubmitForm = (data) => {
        console.log("LoginWithOTP --> onSubmitForm", data);
        // Add OTP verification logic here
    };

    const resetError = () => {
        setErrors(INITIAL_ERROR_STATE);
    };

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
                >
                    Verify
                </Button>

                <div className='flex flex-row gap-2 items-center justify-between w-full'>
                    <Button
                        onClick={() => onChangeLoginWithOption(false)}
                        type='button'
                        variant="none"
                        size="sm"
                        className="text-blue-600 font-semibold p-0"
                    >
                        Sign in using password
                    </Button>

                    <Button
                        type='button'
                        variant="none"
                        size="sm"
                        className="text-blue-600 font-semibold p-0"
                    >
                        Resend OTP?
                    </Button>
                </div>
            </form>
        </Form>
    );
}