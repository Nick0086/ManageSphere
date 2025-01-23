import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import * as yup from 'yup'
import LoginIdVerifier from './components/LoginIdVerifier';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../ui/button';
import LoginWithPassoword from './components/LoginWithPassoword';
import LoginWithOTP from './components/LoginWithOTP';

const loginIdDefaultValue = {
  loginId: '',
  loginType: 'EMAIL',
};

const loginWithPassowrdDefaultValue = {
  password : '',
};

const loginWithOTPDefaultValue = {
  OTP : '',
};

const loginIdSchema = yup.object({
  loginType: yup
    .string()
    .oneOf(['EMAIL', 'MOBILE'], 'Invalid login type')
    .required('Login type is required'),
  loginId: yup.string().required('Please enter your email address or mobile number'),
});

const loginWithPassowrdSchema = yup.object({
  password : yup.string().required('Please enter your password'),
})

const loginWithOTPSchema = yup.object({
  OTP : yup.string().required('Please enter your OTP').min(6,'Please enter your OTP'),
})

export default function Login() {

  const [isLoginIdVerified, seiIsLoginIdVerified] = useState(false);
  const [isLoginWithOTP, setIsLoginWithOTP] = useState(false);

  const loginIdVerifiedForm = useForm({
    defaultValues: loginIdDefaultValue,
    resolver: yupResolver(loginIdSchema)
  })

  const loginWithPassowrdForm = useForm({
    defaultValues: loginWithPassowrdDefaultValue,
    resolver: yupResolver(loginWithPassowrdSchema)
  })

  const loginWithOTPForm = useForm({
    defaultValues: loginWithOTPDefaultValue,
    resolver: yupResolver(loginWithOTPSchema)
  })

  const loginId = loginIdVerifiedForm.watch('loginId');
  const loginType = loginIdVerifiedForm.watch('loginType');

  const onChangeLoginWithOption = () => {
    loginWithPassowrdForm.reset(loginWithPassowrdDefaultValue)
    loginWithOTPForm.reset(loginWithOTPDefaultValue)
    setIsLoginWithOTP(!isLoginWithOTP);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
      <Card className="w-11/12 md:w-full max-w-md">
        <CardHeader className="pb-0" >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
            <p className="text-gray-600 mx-auto text-sm md:max-w-[85%] max-w-[90%]">
              to access your account.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!isLoginIdVerified && (<LoginIdVerifier form={loginIdVerifiedForm} seiIsLoginIdVerified={seiIsLoginIdVerified} />)}

          {
            isLoginIdVerified && (
              <div className='space-y-4'>
                <div className='space-y-4'>
                  <div className="flex items-center justify-between w-fit gap-2 py-1 px-2 border border-indigo-200 rounded-md">
                    <span className='w-fit px-2'>{loginId}</span>
                    <Button
                      type='button'
                      variant="none"
                      size="sm"
                      className="text-blue-600 font-semibold"
                      onClick={() => {
                        loginIdVerifiedForm.reset(loginIdDefaultValue)
                        loginWithPassowrdForm.reset(loginWithPassowrdDefaultValue)
                        seiIsLoginIdVerified(false);
                        setIsLoginWithOTP(false);
                      }}
                    >
                      Change
                    </Button>
                  </div>

                  {
                    (!isLoginWithOTP && isLoginIdVerified) && <LoginWithPassoword form={loginWithPassowrdForm} loginId={loginId} loginType={loginType} onChangeLoginWithOption={onChangeLoginWithOption}  /> 
                  }
                  {
                    (isLoginWithOTP && isLoginIdVerified) && <LoginWithOTP form={loginWithOTPForm} loginId={loginId} loginType={loginType} onChangeLoginWithOption={onChangeLoginWithOption}  /> 
                  }
                </div>
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>

  )
}
