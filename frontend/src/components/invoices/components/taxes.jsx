import ReusableFormField from '@/common/Form/ReusableFormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Trash2 } from 'lucide-react'
import React from 'react'

export default function Taxes({ form, taxFields, appendTax, removeTax, isDisabled }) {
    // Add a new tax item
    const addTax = () => {
        appendTax({
            name: "",
            rate: 0,
            appliesTo: "all",
            id: Date.now().toString(),
        })
    }

    return (
        <div className="space-y-4 p-2 pt-0">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Tax Configuration</h3>
                <Button type="button" variant="add" size="sm" onClick={addTax} className="gap-1" disabled={isDisabled}>
                    <PlusCircle size={14} />
                    Add Tax
                </Button>
            </div>

            <div className="space-y-2">
                {
                    !taxFields?.length ? (
                        <div className="text-center text-gray-500">
                            No taxes configured. Click "Add Tax" to add one.
                        </div>
                    ) : (
                        taxFields?.map((field, index) => (
                            <Card key={field.id}>
                                <CardContent className="p-4 grid grid-cols-12  gap-2">
                                    <ReusableFormField
                                        control={form.control}
                                        name={`tax_configurations.${index}.name`}
                                        required={true}
                                        label="Name"
                                        className="col-span-4"
                                        disabled={isDisabled}
                                        placeholder="name of the tax"
                                    />
                                    <ReusableFormField
                                        control={form.control}
                                        type="number"
                                        name={`tax_configurations.${index}.rate`}
                                        required={true}
                                        label="Rate (%)"
                                        className="col-span-3"
                                        disabled={isDisabled}
                                    />
                                    <ReusableFormField
                                        control={form.control}
                                        type="select"
                                        name={`tax_configurations.${index}.appliesTo`}
                                        label="Applies To"
                                        options={[
                                            { value: "all", label: "All Items" },
                                            { value: "food", label: "Food Only" },
                                            { value: "beverage", label: "Beverages Only" }
                                        ]}
                                        className="col-span-4"
                                        disabled={isDisabled}
                                    />
                                    <div className="col-span-1 flex items-end justify-end">
                                        <Button
                                            disabled={isDisabled}
                                            size='xs' type='button' variant="ghost" className="rounded-full text-red-500 hover:bg-red-100 hover:text-red-600"
                                            onClick={() => removeTax(index)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )
                }
            </div>
        </div>
    )
}