import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function InvoiceIndex() {
  return (
    <Card className="rounded-lg border">
    <CardHeader className="p-0 pb-2 border-b px-4 pt-3">
      <div className="space-y-4">
        <div>
          <CardTitle className='text-primary text-2xl font-bold' >Invoice Management</CardTitle>
          <p className='text-secondary text-sm' >Manage Invoice for all your Orders</p>
        </div>
        <div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-0">
    </CardContent>
  </Card >
  )
}
