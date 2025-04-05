import ReusableFormField from '@/common/Form/ReusableFormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Trash2 } from 'lucide-react'
import React from 'react'

export default function AdditionalCharges({ form, chargeFields, appendCharge, removeCharge, isDisabled }) {

  const addCharge = () => {
    appendCharge({
      name: "",
      amount: 0,
      type: "fixed",
      id: Date.now().toString(),
    })
  }

  return (
    <div className="space-y-4 p-2 pt-0">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Additional Charges</h3>
        <Button type="button" variant="add" size="sm" onClick={addCharge} className="gap-1" disabled={isDisabled}   >
          <PlusCircle size={14} />
          Add Charge
        </Button>
      </div>
      <div className="space-y-2">
        {
          !chargeFields?.length ? (
            <div className="text-center text-gray-500">
              No additional charges configured. Click "Add Charge" to add one.
            </div>
          ) : (
            chargeFields?.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="p-4 grid grid-cols-12  gap-2">
                  <ReusableFormField
                    control={form.control}
                    name={`additional_charges.${index}.name`}
                    required={true}
                    label="Name"
                    className="col-span-4"
                    placeholder="name of the charge"
                    disabled={isDisabled}
                  />
                  <ReusableFormField
                    control={form.control}
                    type="select"
                    name={`additional_charges.${index}.type`}
                    required={true}
                    label="Type"
                    options={[
                      { value: "fixed", label: "Fixed" },
                      { value: "percentage", label: "Percentage" },
                    ]}
                    className="col-span-4"
                    disabled={isDisabled}
                  />
                  <ReusableFormField
                    control={form.control}
                    type="number"
                    name={`additional_charges.${index}.amount`}
                    required={true}
                    label="Amount"
                    className="col-span-3"
                    disabled={isDisabled}
                    />
                  <div className="col-span-1 flex items-end justify-center">
                    <Button
                      disabled={isDisabled}
                      size='xs' type='button' variant="ghost" className="rounded-full text-red-500 hover:bg-red-100 hover:text-red-600"
                      onClick={() => removeCharge(index)}
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
