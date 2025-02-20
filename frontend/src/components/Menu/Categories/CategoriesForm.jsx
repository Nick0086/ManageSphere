import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { createCategory, updateCategory } from '@/service/menu.service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { queryKeyLoopUp, statusOptions } from './utils';

const formSchema = yup.object().shape({
    name: yup.string().required("Category is required"),
    status: yup.number().notRequired(),
});

const defaultValues = {
    name: "",
    status: 1,
};

export default function CategoriesForm({ open, onHide, isEdit, selectedRow }) {

    const queryClient = useQueryClient();
    const form = useForm({
        resolver: yupResolver(formSchema),
        defaultValues: defaultValues,
    });

    const categoryName = form.watch('name')

    useEffect(() => {
        if (isEdit) {
            form.setValue("name", selectedRow?.name);
            form.setValue("status", selectedRow?.status?.toString());
        }
    }, [isEdit, selectedRow, form]);

    const handleModalClose = () => {
        form.reset(defaultValues);
        onHide();
    }

    const createCategoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: (res) => {
            queryClient.invalidateQueries(queryKeyLoopUp['Category']);
            toastSuccess(res?.data?.message || `Category ${categoryName} added successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error adding Lead Source: ${error?.err?.message}`);
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: (res) => {
            queryClient.invalidateQueries(queryKeyLoopUp['Category']);
            toastSuccess(res?.data?.message || `Category ${categoryName} updated successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error updating Lead Source: ${error?.err?.message}`);
        }
    });

    const handleFormSubmit = (data) => {
        if (isEdit) {
            updateCategoryMutation.mutate({ categoryId: selectedRow?.unique_id, ...data });
        } else {
            createCategoryMutation.mutate(data);
        }
    }

    return (
        <Dialog className='p-0' open={open} onOpenChange={handleModalClose} >
            <DialogContent  style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
                {
                    open && (
                        <>
                            <DialogHeader closeButton>
                                <DialogTitle>{isEdit ? `Edit Category` : `Create Category`}</DialogTitle>
                            </DialogHeader>

                            <DialogDescription>
                                <div >
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className=" space-y-4 mx-auto">

                                            <ReusableFormField control={form.control} name='name' required={true} label='Category Name'  placeholder='Add Category' />

                                            {
                                                isEdit && (
                                                    <ReusableFormField control={form.control} type='select' name='status'  label='Status' options={statusOptions} />
                                                )
                                            }

                                            <div className='flex items-center gap-4 py-2'>
                                                <Button type="submit" variant="gradient" disabled={createCategoryMutation?.isPending || updateCategoryMutation?.isPending} isLoading={createCategoryMutation?.isPending || updateCategoryMutation?.isPending}>
                                                    Submit
                                                </Button>
                                                <Button type="button" variant="outline" color="ghost" className={`cursor-pointer`} onClick={handleModalClose}>Cancel</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            </DialogDescription>
                        </>
                    )
                }
            </DialogContent>
        </Dialog>
    )
}
