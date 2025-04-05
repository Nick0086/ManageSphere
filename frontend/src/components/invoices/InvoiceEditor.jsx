import React, { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import InvoiceTemplateEditor from './components/invoice-template-editor';
import InvoiceViewer from './components/invoice-viwer';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvoiceTemplate, getInvoiceTemplateByIdWithItems, updateInvoiceTemplate } from '@/service/invoices.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import SlackLoader from '../ui/CustomLoaders/SlackLoader';
import { invoiceQueryKeyLookup } from './utils';

const taxItemSchema = z.object({
    id: z.string(),
    unique_id: z.string().optional().nullable(),
    name: z.string().min(1, "Tax name is required"),
    rate: z.coerce.number().min(0, "Rate must be positive"),
    appliesTo: z.enum(["all", "food", "beverage"]),
})

const additionalChargeSchema = z.object({
    id: z.string(),
    unique_id: z.string().optional().nullable(),
    name: z.string().min(1, "Additional charge name is required"),
    amount: z.coerce.number().min(0, "Amount must be positive"),
    type: z.enum(["fixed", "percentage"]),
})

const formSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    isDefault: z.boolean(),
    headerText: z.string().optional().nullable(),
    footerText: z.string().optional().nullable(),
    tax_configurations: z.array(taxItemSchema).optional().nullable(),
    additional_charges: z.array(additionalChargeSchema).optional().nullable(),
})

const defaultValues = {
    name: "",
    isDefault: false,
    headerText: "",
    footerText: "",
    tax_configurations: [],
    additional_charges: [],
}

export default function InvoiceEditor() {

    const { invoiceId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const templateEditorRef = useRef(null);

    const isNewInvoice = invoiceId === 'new';

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const { data: invoiceTemplate, isLoading: isInvoiceTemplateLoading, isError: isInvoiceTemplateError } = useQuery({
        queryKey: [invoiceQueryKeyLookup['INVOICE_TEMPLATES'], invoiceId],
        queryFn: () => getInvoiceTemplateByIdWithItems(invoiceId),
        enabled: !isNewInvoice,
    })

    useEffect(() => {
        if (invoiceTemplate) {
            const values = {
                name: invoiceTemplate?.data?.name,
                isDefault: invoiceTemplate?.data?.is_default ? true : false,
                headerText: invoiceTemplate?.data?.header_content || "",
                footerText: invoiceTemplate?.data?.footer_content || "",
                tax_configurations: invoiceTemplate?.data?.tax_configurations?.map(tax => ({
                    id: tax?.id?.toString(),
                    unique_id: tax?.unique_id,
                    name: tax?.tax_name,
                    rate: tax?.tax_percentage,
                    appliesTo: tax?.applies_to,
                })),
                additional_charges: invoiceTemplate?.data?.additional_charges?.map(charge => ({
                    id: charge?.id?.toString(),
                    unique_id: charge?.unique_id,
                    name: charge?.charge_name,
                    amount: charge?.charge_amount,
                    type: charge?.charge_type,
                })),
            }
            form.reset(values);
        }
    }, [invoiceTemplate])

    useEffect(() => {
        if (isInvoiceTemplateError) {
            toastError(`Error fetching Invoice Template: ${isInvoiceTemplateError?.err?.message}`);
        }
    }, [isInvoiceTemplateError])
    
    const handleModalClose = () => {
        queryClient.invalidateQueries(invoiceQueryKeyLookup['INVOICE_TEMPLATES']);
        navigate('/invoice-management');
    }

    const createInvoiceTemplateMutation = useMutation({
        mutationFn: createInvoiceTemplate,
        onSuccess: (res) => {
            toastSuccess(res?.message || `Invoice Template added successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error adding Invoice Template: ${error?.err?.message}`);
        }
    });

    const updateInvoiceTemplateMutation = useMutation({
        mutationFn: updateInvoiceTemplate,
        onSuccess: (res) => {
            toastSuccess(res?.message || `Invoice Template updated successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error updating Invoice Template: ${error?.err?.message}`);
        }
    });

    const onSaveTemplate = (data) => {
        if (isNewInvoice) {
            createInvoiceTemplateMutation.mutate(data);
        } else {
            updateInvoiceTemplateMutation.mutate({...data,templateId:invoiceId});
        }
    }
    
    const handleSaveButtonClick = () => {
        if (templateEditorRef.current) {
            templateEditorRef.current.submitForm();
        } else {
            console.error('Template editor reference is not available');
            toastError('Template editor reference is not available');
        }
    }

    if (isInvoiceTemplateLoading ) {
        return (
            <Card className='flex items-center justify-center min-h-[85dvh] ' >
                <CardHeader className='p-0 pb-2 border-b md:px-4 px-2 pt-3'>
                    <SlackLoader />
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className='border-none p-0 min-h-[85dvh]'>
            <CardHeader className='border-b md:px-4 py-2 px-2'>
                <div className="flex items-center justify-between">
                    <CardTitle className='text-primary lg:text-2xl text-lg font-semibold' >  {isNewInvoice ? 'New Invoice' : 'Edit Invoice'}</CardTitle>
                    <div className="flex items-center justify-end md:gap-x-2 gap-x-0.5">
                        <Button disabled={createInvoiceTemplateMutation?.isPending || updateInvoiceTemplateMutation?.isPending} className='md:px-3 px-1.5 md:py-2 py-1.5 ' size="sm" variant="outline" onClick={() => navigate('/invoice-management')}>
                            Back
                        </Button>
                        <Button isLoading={createInvoiceTemplateMutation?.isPending || updateInvoiceTemplateMutation?.isPending} className='md:px-3 px-1.5 md:py-2 py-1.5 ' variant="primary" onClick={handleSaveButtonClick}>
                            Save Template
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='md:px-4 py-2 px-2'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4' >
                    <div >
                        <InvoiceTemplateEditor isDisabled={createInvoiceTemplateMutation?.isPending || updateInvoiceTemplateMutation?.isPending} ref={templateEditorRef} form={form} onSaveTemplate={onSaveTemplate} />
                    </div>
                    <div  >
                        <InvoiceViewer form={form} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
