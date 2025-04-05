import React from 'react';
import moment from 'moment';
import { sampleItems } from '../utils';

export default function InvoiceViewer({ form }) {
  const { watch } = form;
  const invoiceData = watch();

  const subtotal = sampleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const taxes = (invoiceData.tax_configurations || []).map(tax => ({
    name: tax.name || 'Tax',
    rate: tax.rate,
    amount: subtotal * (tax.rate / 100)
  }));
  
  const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  
  const additionalCharges = (invoiceData.additional_charges || []).map(charge => ({
    name: charge.name || 'Charge',
    type: charge.type,
    rate: charge.amount,
    amount: charge.type === 'fixed' ? parseFloat(charge.amount || 0) : parseFloat(subtotal * (charge.amount / 100) || 0)
  }));
  
  const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  
  const grandTotal = subtotal + totalTax + totalAdditionalCharges;

  return (
    <div className="invoice-viewer">
      <h3 className="text-lg text-center font-medium mb-4">Receipt Preview</h3>
      <div className="receipt-container bg-white p-4 max-w-[300px] mx-auto font-mono text-sm leading-tight shadow-md">
        <div className="text-center mb-2">
          <div className="font-bold">THE RAMESHWARAM CAFE</div>
          {invoiceData.headerText && <pre className="text-xs">{invoiceData.headerText}</pre>}
          <div className="text-xs">GURUGRAM SECTOR 14, 38 Huda Market, Gurugram 122001</div>
          <div className="text-xs">Ph: 7845123456</div>
        </div>

        <div className="border-t border-b border-dashed border-gray-300 py-2 mb-2 flex justify-between">
          <div>
            <div>Date: {moment().format('DD-MM-YYYY')}</div>
            <div>Time: {moment().format('HH:mm')}</div>
          </div>
          <div>
            <div>Bill No: #00001</div>
            <div>Table: 5</div>
          </div>
        </div>

        <div className="invoice-items mb-2">
          <div className="flex font-bold">
            <div className="w-5/12">Item</div>
            <div className="w-1/12 text-center">Qty</div>
            <div className="w-2/12 text-center">Rate</div>
            <div className="w-4/12 text-right">Amount</div>
          </div>
          <div className="border-b border-dashed border-gray-300 my-2"></div>
          {sampleItems.map((item, index) => (
            <div key={index} className="flex">
              <div className="w-5/12">{item.name}</div>
              <div className="w-1/12 text-center">{item.quantity}</div>
              <div className="w-2/12 text-center">₹ {item.price}</div>
              <div className="w-4/12 text-right">₹ {(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="border-b border-dashed border-gray-300 my-2"></div>
          <div className="flex justify-between">
            <div className='w-5/12'>Sub Total:</div>
            <div className='w-1/12 text-center'>{sampleItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
            <div className='w-4/12 text-right'>₹ {subtotal.toFixed(2)}</div>
          </div>
          <div className="border-b border-dashed border-gray-300 my-2"></div>
          {taxes.map((tax, index) => (
            <div key={index} className="flex justify-between">
              <div>{tax.name} ({tax.rate}%):</div>
              <div>₹ {tax.amount.toFixed(2)}</div>
            </div>
          ))}
          {additionalCharges.map((charge, index) => (
            <div key={index} className="flex justify-between">
              <div>{charge.name} {charge.type === 'percentage' ? `(${charge.rate}%)` : ''}</div>
              <div>₹ {charge.amount.toFixed(2)}</div>
            </div>
          ))}
          <div className="border-b border-dashed border-gray-300 my-2"></div>
          <div className="flex justify-between font-bold">
            <div>Grand Total:</div>
            <div>₹ {grandTotal.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-center text-xs">
          <pre>{invoiceData.footerText || 'Thank you, visit again'}</pre>
        </div>
      </div>
    </div>
  );
}