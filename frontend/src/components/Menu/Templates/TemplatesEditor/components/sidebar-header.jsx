import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarHeader } from '@/components/ui/sidebar'
import React from 'react'

export default function SideBarHeader({
    templateName,
    setTemplateName
}) {
    return (
        <SidebarHeader className="border-b">
            <div className="flex items-center justify-end">
                <Button size="sm" variant="primary">
                    Save Template
                </Button>
            </div>
            <div className="py-1">
                <Label htmlFor="template-name" className="block mb-1">
                    Template Name
                </Label>
                <Input id="template-name" className='bg-white' value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            </div>
        </SidebarHeader>
    )
}
