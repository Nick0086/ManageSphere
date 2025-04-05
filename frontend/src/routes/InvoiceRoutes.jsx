import React from 'react'
import InvoiceIndex from '@/components/invoices/InvoiceIndex'
import { Route, Routes } from 'react-router'
import InvoiceEditor from '@/components/invoices/invoiceEditor'

export default function InvoiceRoutes() {
    return (
        <Routes>
            <Route path="/" element={<InvoiceIndex />} />
            <Route path="/:invoiceId" element={<InvoiceEditor />} />
        </Routes>
    )
}
