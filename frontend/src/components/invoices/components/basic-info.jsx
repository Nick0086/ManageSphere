import ReusableFormField from '@/common/Form/ReusableFormField'
import React from 'react'

export default function BasicInfo({ form, isDisabled }) {
    return (
        <div className='space-y-4 p-2 pt-0 max-w-xs'>
            <ReusableFormField
                control={form.control}
                name="name"
                required={true}
                label="Template Name"
                placeholder="Enter the name of the template"
                disabled={isDisabled}
            />
            <ReusableFormField
                control={form.control}
                type="textarea"
                name="headerText"
                label="Header Text"
                placeholder="Enter the header text of the template"
                disabled={isDisabled}
            />
            <ReusableFormField
                control={form.control}
                type="textarea"
                name="footerText"
                label="Footer Text"
                placeholder="Enter the footer text of the template"
                disabled={isDisabled}
            />
            <ReusableFormField
                control={form.control}
                className='space-y-0'
                containerClassName='flex items-end gap-2 space-y-0'
                type="checkbox"
                name="isDefault"
                label="Default Template"
                disabled={isDisabled}
                placeholder="Select if this is the default template"
            />
        </div>
    )
}
