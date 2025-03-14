import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarHeader } from '@/components/ui/sidebar'
import { useTemplate } from '@/contexts/TemplateContext'
import { cn } from '@/lib/utils'
import React from 'react'
import { useNavigate } from 'react-router'

export default function SideBarHeader({
    templateName,
    setTemplateName,
    handleFormSubmit,
    isSubmitting
}) {

    const navigate = useNavigate();
    const { nameError,setNameError } = useTemplate();

    return (
        <SidebarHeader className="border-b">
            <div className="flex items-center justify-end gap-x-2">
                <Button size="sm" variant="outline" onClick={() => navigate('menu-management/tamplate')} isLoading={isSubmitting}>
                    Back
                </Button>
                <Button size="sm" variant="primary" onClick={handleFormSubmit} isLoading={isSubmitting}>
                    Save Template
                </Button>
            </div>
            <div className="py-1">
                <Label htmlFor="template-name" className="block mb-1">
                    Template Name
                </Label>
                <Input id="template-name" className='bg-white' value={templateName} onChange={(e) => {
                    setNameError(null)
                    setTemplateName(e.target.value)}} />
                {
                    nameError ? <p className={cn("text-sm font-semibold text-red-600")} >{nameError}</p> : null
                }

            </div>
        </SidebarHeader>
    )
}
