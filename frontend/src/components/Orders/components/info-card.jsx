import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import React from 'react'

export default function InfoCard({
    title,
    icon,
    children
}) {
    return (
        <Card className='shadow-none border-none bg-violet-50' >
            <CardHeader className='flex items-start gap-1  p-3 pb-1'>
                {icon && <Chip className='text-violet-500 bg-violet-100 p-0 size-8 flex items-center justify-center rounded-full' variant='light' color={'indigo'} radius='md' size='sm' border='none' >{icon}</Chip>}
                <CardTitle className='text-lg' >
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className='text-xs text-secondary px-3 space-y-0.5' >
                {children}
            </CardContent>
        </Card>
    )
}
