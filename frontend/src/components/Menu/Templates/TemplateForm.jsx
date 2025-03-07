import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { templateDefaultValue, templateQueryKeyLoopUp } from './utils';
import { createTemplate, updateTemplate } from '@/service/menu.service';

// Schema validation for the form
const formSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
});


// Set default values for the form fields
const defaultValues = {
    name: "",
    is_default: false,
    config: templateDefaultValue,
};

export default function TemplateForm({ open, onHide, isEdit, selectedRow }) {
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: yupResolver(formSchema),
        defaultValues: defaultValues,
    });

    const templateName = form.watch('name');

    // Populate form fields when in edit mode
    useEffect(() => {
        if (isEdit && selectedRow) {
            form.setValue("name", selectedRow.name);
            form.setValue("is_default", selectedRow.is_default);
            form.setValue("config", selectedRow.config || templateDefaultValue);
        }
    }, [isEdit, selectedRow, form]);

    // Reset form and close modal
    const handleModalClose = () => {
        form.reset(defaultValues);
        onHide();
    };

    const createTemplateMutation = useMutation({
        mutationFn: createTemplate,
        onSuccess: (res) => {
            queryClient.invalidateQueries(templateQueryKeyLoopUp['TEMPLATE_LIST']);
            toastSuccess(res?.data?.message || `Template ${templateName} added successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error adding Template: ${error?.err?.message}`);
        }
    });

    const updateTemplateMutation = useMutation({
        mutationFn: updateTemplate,
        onSuccess: (res) => {
            queryClient.invalidateQueries(templateQueryKeyLoopUp['TEMPLATE_LIST']);
            toastSuccess(res?.data?.message || `Template ${templateName} updated successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error updating Template: ${error?.err?.message}`);
        }
    });

    const handleFormSubmit = (data) => {
        if (isEdit) {
            updateTemplateMutation.mutate({ templateId: selectedRow?.unique_id,templateData : data });
        } else {
            createTemplateMutation.mutate(data);
        }
    };

    return (
        <Dialog className='p-0' open={open} onOpenChange={handleModalClose}>
            <DialogContent style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
                {open && (
                    <>
                        <DialogHeader closeButton>
                            <DialogTitle>{isEdit ? `Edit Template` : `Create Template`}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mx-auto">
                                    <ReusableFormField
                                        control={form.control}
                                        name='name'
                                        required={true}
                                        label='Template Name'
                                        placeholder='Enter template name'
                                    />
                                    <ReusableFormField
                                        control={form.control}
                                        type='checkbox'
                                        name='is_default'
                                        containerClassName={'flex items-center gap-x-2'}
                                        label='Is Default'
                                    />
                                    <div className='flex items-center gap-4 py-2'>
                                        <Button
                                            type="submit"
                                            variant="gradient"
                                            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                                            isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                                        >
                                            Submit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            color="ghost"
                                            className="cursor-pointer"
                                            onClick={handleModalClose}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogDescription>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
