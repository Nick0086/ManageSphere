import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginIdVerifier from './components/LoginIdVerifier';
import LoginWithPassword from './components/LoginWithPassword';
import LoginWithOTP from './components/LoginWithOTP';
import { useMutation } from '@tanstack/react-query';
import { sendOTP } from '@/service/auth.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';

// Constants
const DEFAULT_VALUES = {
  loginId: {
    loginId: '',
    loginType: 'EMAIL',
  },
  password: {
    password: '',
  },
  otp: {
    OTP: '',
  }
};

// Validation Schemas
const VALIDATION_SCHEMAS = {
  loginId: yup.object({
    loginType: yup
      .string()
      .oneOf(['EMAIL', 'MOBILE'], 'Invalid login type')
      .required('Login type is required'),
    loginId: yup.string().required('Please enter your email address or mobile number'),
  }),
  password: yup.object({
    password: yup.string().required('Please enter your password'),
  }),
  otp: yup.object({
    OTP: yup.string().required('Please enter your OTP').min(6, 'Please enter your OTP'),
  })
};

export default function Login() {
  const [isLoginIdVerified, setIsLoginIdVerified] = useState(false);
  const [isLoginWithOTP, setIsLoginWithOTP] = useState(false);

  // Form Hooks
  const loginIdForm = useForm({
    defaultValues: DEFAULT_VALUES.loginId,
    resolver: yupResolver(VALIDATION_SCHEMAS.loginId)
  });

  const loginPasswordForm = useForm({
    defaultValues: DEFAULT_VALUES.password,
    resolver: yupResolver(VALIDATION_SCHEMAS.password)
  });

  const loginOTPForm = useForm({
    defaultValues: DEFAULT_VALUES.otp,
    resolver: yupResolver(VALIDATION_SCHEMAS.otp)
  });

  const loginId = loginIdForm.watch('loginId');
  const loginType = loginIdForm.watch('loginType');

  const onChangeLoginWithOption = (isTrue) => {
    loginPasswordForm.reset(DEFAULT_VALUES.password);
    loginOTPForm.reset(DEFAULT_VALUES.otp);
    setIsLoginWithOTP(isTrue);
  };

  const resetForms = () => {
    loginIdForm.reset(DEFAULT_VALUES.loginId);
    loginPasswordForm.reset(DEFAULT_VALUES.password);
    loginOTPForm.reset(DEFAULT_VALUES.otp);
    setIsLoginIdVerified(false);
    setIsLoginWithOTP(false);
  };

  const sendOTPMutation = useMutation({
    mutationFn: sendOTP,
    onSuccess: () => {
      toastSuccess(`OTP sent successfully :- ${loginId}`)
      onChangeLoginWithOption(true)
    },
    onError: (error) => {
      toastError(`Error in Send OTP to ${loginId} : ${JSON.stringify(error)}`);
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
      <Card className="w-11/12 md:w-full max-w-md">
        <CardHeader className="pb-0">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
            <p className="text-gray-600 mx-auto text-sm md:max-w-[85%] max-w-[90%]">
              to access your account.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {!isLoginIdVerified && (
            <LoginIdVerifier
              form={loginIdForm}
              setIsLoginIdVerified={setIsLoginIdVerified}
            />
          )}

          {isLoginIdVerified && (
            <div className='space-y-4'>
              <div className="flex items-center justify-between w-fit gap-2 py-1 px-2 border border-indigo-200 rounded-md">
                <span className='w-fit px-2'>{loginId}</span>
                <Button
                  type='button'
                  variant="none"
                  size="sm"
                  className="text-blue-600 font-semibold"
                  onClick={resetForms}
                >
                  Change
                </Button>
              </div>

              {!isLoginWithOTP && (
                <LoginWithPassword
                  form={loginPasswordForm}
                  loginId={loginId}
                  loginType={loginType}
                  onChangeLoginWithOption={sendOTPMutation}
                />
              )}

              {isLoginWithOTP && (
                <LoginWithOTP
                  form={loginOTPForm}
                  loginId={loginId}
                  loginType={loginType}
                  onChangeLoginWithOption={onChangeLoginWithOption}
                  sendOTPMutation={sendOTPMutation}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}