import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { cn } from '@/lib/utils'
import React from 'react'

export default function InfoCard({
    title,
    icon,
    children,
    headerClassName,
    bodyClassName
}) {
    return (
        <Card className='shadow-none border-none bg-violet-50' >
            <CardHeader className={cn('flex items-start gap-1  p-3 pb-1 flex-row items-center space-y-0 gap-2',headerClassName)}>
                {icon && <Chip className='text-violet-500 bg-violet-100 p-0 size-8 flex items-center justify-center rounded-full' variant='light' color={'indigo'} radius='md' size='sm' border='none' >{icon}</Chip>}
                <CardTitle className='text-lg' >
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className={cn('text-xs text-secondary px-4 pt-1 pb-3 space-y-1.5', bodyClassName)} >
                {children}
            </CardContent>
        </Card>
    )
}
