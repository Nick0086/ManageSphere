import { Card } from '@/components/ui/card'
import React from 'react'

export default function TemplateMenuViewerLayout({ templateConfig }) {
    const categories = templateConfig?.categories || [];

    return (
        <div className='p-2  bg-gray-50 min-h-[90dvh] max-h-[90dvh] overflow-auto' >
            {categories?.filter(category => category?.visible)?.map((category) => (
                <Card key={category} className="p-4 mb-2">
                    {category?.name}
                </Card>
            ))}
        </div>
    )
}