import React, { useEffect, memo, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/tremor-dialog';
import { Form } from '@/components/ui/form';
import ReusableFormField from '@/common/Form/ReusableFormField';
import { Button } from '@/components/ui/button';
import { menuQueryKeyLoopUp, statusOptions, stockOptions } from './utils';
import { queryKeyLoopUp } from '../Categories/utils';
import { createMenuItem, getAllCategory, updateMenuItem } from '@/service/menu.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ImageAvatar from '@/components/ui/ImageAvatar';
import { toastError, toastSuccess } from '@/utils/toast-utils';

// Validation Schema
const formSchema = yup.object().shape({
    name: yup.string().required('Item name is required'),
    description: yup.string().required('Please provide a description for this item'),
    category_id: yup.string().required('Please select a category'),
    price: yup.number().typeError('Price must be a valid number').required('Price is required'),
});

// Default Values
const defaultValues = {
    name: '',
    description: '',
    price: '',
    cover_image: '',
    category_id: null,
    availability: 'in_stock',
    status: 1,
};

const MenuItemForm = memo(({ open, onHide, isEdit, selectedRow, isDireact }) => {

    const queryClient = useQueryClient();
    const [imageWarning, setImageWarning] = useState(true);

    const form = useForm({
        resolver: yupResolver(formSchema),
        defaultValues,
    });

    const menuItemName = form.watch('name')

    // Populate form fields when editing an existing item
    useEffect(() => {
        console.log(selectedRow)
        if ((isEdit && selectedRow) || isDireact) {
            if(isDireact){
                setImageWarning(true)
            }
            form.reset({
                name: selectedRow.name || '',
                description: selectedRow.description || '',
                price: parseFloat(selectedRow.price) || null,
                cover_image: selectedRow.cover_image || null,
                category_id: selectedRow.category_id || null,
                availability: selectedRow.availability || null,
                status: selectedRow.status?.toString() || '1',
            });
        } else {
            setImageWarning(true)
            form.reset(defaultValues);
        }
    }, [isEdit, selectedRow, form]);

    // Handle image upload
    const handleImageUpload = (image) => {
        setImageWarning(false)
        form.setValue('cover_image', image);
    };

    // Handle image deletion
    const handleDeleteImage = () => {
        setImageWarning(true)
        form.setValue('cover_image', selectedRow?.cover_image || null);
    };

    // Fetch categories
    const { data: categoryData, isLoading: categoryIsLoading, error: categoryError } = useQuery({
        queryKey: [queryKeyLoopUp['Category']],
        queryFn: getAllCategory,
    });

    // Handle category fetch errors
    useEffect(() => {
        if (categoryError) {
            toast.error(`Error fetching categories: ${JSON.stringify(categoryError)}`);
        }
    }, [categoryError]);

    // Generate category options
    const categoryOptions = useMemo(() => {
        if (categoryData) {
            const categories = categoryData?.data?.categories || [];
            return categories.map((category) => ({
                value: category?.unique_id,
                label: category?.name,
            }));
        }
        return [];
    }, [categoryData]);

    // Close modal and reset form
    const handleModalClose = () => {
        form.reset(defaultValues);
        onHide();
    };

    const createMenuItemMutation = useMutation({
        mutationFn: createMenuItem,
        onSuccess: (res) => {
            queryClient.invalidateQueries(menuQueryKeyLoopUp['item']);
            toastSuccess(res?.data?.message || `Menu ${menuItemName} added successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error adding Menu Item: ${error?.err?.message}`);
        }
    });
    const updateMenuItemMutation = useMutation({
        mutationFn: updateMenuItem,
        onSuccess: (res) => {
            queryClient.invalidateQueries(menuQueryKeyLoopUp['item']);
            toastSuccess(res?.data?.message || `Menu Item :- ${categoryName} updated successfully`);
            handleModalClose();
        },
        onError: (error) => {
            toastError(`Error updating Category: ${error?.err?.message}`);
        }
    });

    // Handle form submission
    const handleFormSubmit = (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });
        if (isEdit && !isDireact) {
            updateMenuItemMutation.mutate({menuData:formData, menuItemId:selectedRow?.unique_id})
        } else {
            createMenuItemMutation.mutate(formData)
        }
    };
    return (
        <Dialog open={open} onOpenChange={handleModalClose}>
            <DialogContent className='min-w-[40%]' >
                {open && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? 'Edit Menu Item' : 'Create New Menu Item'}</DialogTitle>
                        </DialogHeader>
                        <div className='max-h-[80dvh] overflow-auto p-0' >
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} >
                                    <div className="mx-auto grid grid-cols-12 gap-4 px-4 pt-2 mb-2" >
                                        {/* Item Name */}
                                        <ReusableFormField
                                            control={form.control}
                                            name="name"
                                            required={true}
                                            label="Item Name"
                                            placeholder="Enter the name of the menu item"
                                            className="col-span-12 "
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />

                                        {/* Description */}
                                        <ReusableFormField
                                            type="textarea"
                                            control={form.control}
                                            name="description"
                                            textAreaClassName="h-28"
                                            required={true}
                                            label="Description"
                                            placeholder="Describe the menu item in detail"
                                            className="col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />


                                        {/* Category */}
                                        <ReusableFormField
                                            control={form.control}
                                            type="select"
                                            required={true}
                                            name="category_id"
                                            label="Category"
                                            isLoading={categoryIsLoading}
                                            options={categoryOptions}
                                            placeholder="Select a category"
                                            className="md:col-span-6 col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending || isDireact}
                                        />

                                        {/* Price */}
                                        <ReusableFormField
                                            control={form.control}
                                            name="price"
                                            required={true}
                                            label="Price"
                                            placeholder="Enter the price (e.g., 9.99)"
                                            className="md:col-span-6 col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />

                                        {/* Availability */}
                                        <ReusableFormField
                                            control={form.control}
                                            type="select"
                                            required={true}
                                            name="availability"
                                            label="Availability"
                                            options={stockOptions}
                                            placeholder="Select availability status"
                                            className="md:col-span-6 col-span-12"
                                            disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                        />

                                        {/* Status (only visible in edit mode) */}
                                        {isEdit && (
                                            <ReusableFormField
                                                control={form.control}
                                                type="select"
                                                name="status"
                                                label="Status"
                                                options={statusOptions}
                                                placeholder="Select status"
                                                className="col-span-12 md:col-span-6"
                                                disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}
                                            />
                                        )}

                                        <div className="col-span-12  ">
                                            <label className="block text-sm font-medium mb-2">Cover Image</label>
                                            <ImageAvatar
                                                s3ImageUrl={selectedRow?.image_details?.url || ''} // Original S3 URL
                                                onImageUpload={handleImageUpload} // Handle image upload
                                                onDeleteImage={handleDeleteImage} // Handle image deletion
                                            />
                                            {
                                                imageWarning && (
                                                    <p className="text-orange-500 text-sm mt-2">
                                                        Warning: Uploading a cover image is optional but recommended for better visibility.
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>


                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-start gap-2 sticky bottom-0 border-t bg-white py-2 px-4">
                                        <Button type="submit" variant="gradient" disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending} isLoading={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending}>
                                            Save Changes
                                        </Button>
                                        <Button type="button" variant="outline" color="ghost" disabled={createMenuItemMutation?.isPending || updateMenuItemMutation?.isPending} onClick={handleModalClose}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
});

export default MenuItemForm;