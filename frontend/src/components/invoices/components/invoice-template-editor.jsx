import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useFieldArray } from 'react-hook-form';

import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import BasicInfo from './basic-info';
import Taxes from './taxes';
import AdditionalCharges from './addtional-charges';



const InvoiceTemplateEditor = forwardRef(({ onSaveTemplate, form, isDisabled }, ref) => {

    const [selectedTab, setSelectedTab] = useState('basic-info');


    const { fields: taxFields, append: appendTax, remove: removeTax, } = useFieldArray({
        control: form.control,
        name: "tax_configurations",
    })

    const { fields: chargeFields, append: appendCharge, remove: removeCharge, } = useFieldArray({
        control: form.control,
        name: "additional_charges",
    })

    const onSubmit = (data) => {
        onSaveTemplate(data);
    }

    // Expose submit method to parent component
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            return form.handleSubmit(onSubmit)();
        }
    }));

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    }

    return (
        <div>
            <Tabs value={selectedTab} className='border-none w-full rounded overflow-hidden' onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-3 overflow-auto w-full border-gray-300 bg-gray-50 px-1.5">
                    <TabsTrigger value="basic-info" variant="team" className="text-xs text-blue-500 border-blue-500 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700 py-1.5 px-2">
                        Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="taxes" variant="team" className="text-xs text-green-500 border-green-500 data-[state=active]:bg-green-200 data-[state=active]:text-green-700 py-1.5 px-2">
                        Taxes
                    </TabsTrigger>
                    <TabsTrigger value="charges" variant="team" className="text-xs text-red-500 border-red-500 data-[state=active]:bg-red-200 data-[state=active]:text-red-700 py-1.5 px-2">
                        Charges
                    </TabsTrigger>
                </TabsList>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='border mt-2 rounded shadow min-h-[69dvh]' >
                        <TabsContent value="basic-info">
                            <BasicInfo form={form} isDisabled={isDisabled} />
                        </TabsContent>
                        <TabsContent value="taxes">
                            <Taxes form={form} taxFields={taxFields} appendTax={appendTax} removeTax={removeTax} isDisabled={isDisabled} />
                        </TabsContent>
                        <TabsContent value="charges">
                            <AdditionalCharges form={form} chargeFields={chargeFields} appendCharge={appendCharge} removeCharge={removeCharge} isDisabled={isDisabled} />
                        </TabsContent>

                    </form>
                </Form>


            </Tabs>
        </div>
    )
})

export default InvoiceTemplateEditor;
