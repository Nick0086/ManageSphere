import React from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import * as yup from 'yup'

const loginIdDefultValue = {
  loginId: '',
  loginType:'EMAIL',
}

const loginIdSchema = yup.object().shape({
  loginId: yup.string().when('loginType', {
    is: 'EMAIL',
    then: yup
      .string()
      .email('Invalid email address')
      .required('Email is required'),
    otherwise: yup
      .string()
      .matches(/^\d+$/, 'Phone number must be numeric')
      .required('Phone number is required'),
  }),
  loginType: yup
    .string()
    .oneOf(['EMAIL', 'PHONE'], 'Invalid login type')
    .required('Login type is required'),
});


export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
      <Card className="w-11/12 md:w-full lg:max-w-md max-w-lg">
        <CardHeader className="pb-0" >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
            <p className="text-gray-600 mx-auto text-sm md:max-w-[85%] max-w-[90%]">
              to access your account.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">

        </CardContent>
      </Card>
    </div>

  )
}
