import React from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { formatPKR } from '../utils/format';

export default function InvoicePage({ 
  invoice, 
  setInvoice, 
  customerSuggestions = [], 
  itemSuggestions = [],
  isPrintMode 
}) {
  // Update top-level or nested sections
  const updateField = (section, field, value) => {
    // Only allow numbers for numeric fields in totals
    let sanitized = value;
    if (section === 'totals') {
      sanitized = value.replace(/[^0-9.]/g, '');
      const parts = sanitized.split('.');
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    if (section) {
      setInvoice(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: sanitized
        }
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        [field]: sanitized
      }));
    }
  };

  // Update item field with instant calculation & numeric restriction for qty/rate
  const updateItem = (index, field, rawValue) => {
    let value = rawValue;

    // Qty and Rate only accept numbers (and at most one decimal point)
    if (field === 'qty' || field === 'rate') {
      value = rawValue.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    // If setting partNumber, check if it matches itemSuggestions to auto-fill description, brand, rate
    if (field === 'partNumber') {
      const match = itemSuggestions.find(
        it => it?.partNumber?.toLowerCase() === value.trim().toLowerCase()
      );
      if (match) {
        setInvoice(prev => {
          const items = [...(prev?.items || [])];
          const it = {
            ...items[index],
            partNumber: value,
            description: items[index]?.description || match.description || '',
            brand: items[index]?.brand || match.brand || '',
            rate: items[index]?.rate || match.rate || ''
          };
          const q = parseFloat(it.qty) || 0;
          const r = parseFloat(it.rate) || 0;
          it.total = (it.qty !== '' || it.rate !== '') ? (q * r).toString() : '';
          items[index] = it;
          return { ...prev, items };
        });
        return;
      }
    }

    setInvoice(prev => {
      const items = [...(prev?.items || [])];
      const item = { ...items[index], [field]: value };

      // Calculate row total: treat empty as 0
      const currentQty = field === 'qty' ? value : item.qty;
      const currentRate = field === 'rate' ? value : item.rate;

      // If both are completely empty, keep total empty for visual neatness on blank rows
      if (currentQty === '' && currentRate === '') {
        item.total = '';
      } else {
        const qtyNum = parseFloat(currentQty) || 0;
        const rateNum = parseFloat(currentRate) || 0;
        const rowTotal = qtyNum * rateNum;
        item.total = rowTotal.toString();
      }

      items[index] = item;
      return { ...prev, items };
    });
  };

  // Keyboard navigation: Enter on Rate jumps to next row or creates one
  const handleRateKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentItems = invoice?.items || [];
      if (index + 1 < currentItems.length) {
        const nextInput = document.getElementById(`part-input-${index + 1}`);
        nextInput?.focus();
      } else {
        addRow();
        setTimeout(() => {
          const nextInput = document.getElementById(`part-input-${index + 1}`);
          nextInput?.focus();
        }, 50);
      }
    }
  };

  // Handle customer name change and auto-fill details if known from previous customers
  const handleCustomerNameChange = (val) => {
    const match = customerSuggestions.find(
      c => c?.customerName?.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setInvoice(prev => ({
        ...prev,
        account: {
          customerName: val,
          address: match.address || prev?.account?.address || '',
          city: match.city || prev?.account?.city || '',
          contactInf: match.contactInf || prev?.account?.contactInf || ''
        }
      }));
    } else {
      updateField('account', 'customerName', val);
    }
  };

  // Add Row: auto-generates next Sr #
  const addRow = () => {
    setInvoice(prev => {
      const currentItems = Array.isArray(prev?.items) ? prev.items : [];
      return {
        ...prev,
        items: [
          ...currentItems,
          {
            sr: currentItems.length + 1,
            partNumber: '',
            description: '',
            brand: '',
            qty: '',
            rate: '',
            total: ''
          }
        ]
      };
    });
  };

  // Delete Row: auto-regenerates Sr # 1, 2, 3...
  const removeRow = (index) => {
    setInvoice(prev => {
      const currentItems = Array.isArray(prev?.items) ? prev.items : [];
      if (currentItems.length <= 1) {
        return {
          ...prev,
          items: [{
            sr: 1,
            partNumber: '',
            description: '',
            brand: '',
            qty: '',
            rate: '',
            total: ''
          }]
        };
      }
      const filtered = currentItems.filter((_, i) => i !== index);
      const renumbered = filtered.map((item, idx) => ({
        ...item,
        sr: idx + 1
      }));
      return { ...prev, items: renumbered };
    });
  };

  // Live Instant Calculations
  const calculatedTotal = (Array.isArray(invoice?.items) ? invoice.items : []).reduce((sum, item) => {
    const q = parseFloat(item?.qty) || 0;
    const r = parseFloat(item?.rate) || 0;
    return sum + (q * r);
  }, 0);

  const discount = parseFloat(invoice?.totals?.discount) || 0;
  const charges = parseFloat(invoice?.totals?.charges) || 0;
  const grandTotal = calculatedTotal - discount + charges;

  const prevBalance = parseFloat(invoice?.totals?.prevBalance) || 0;
  const receivings = parseFloat(invoice?.totals?.receivings) || 0;
  const finalBalance = grandTotal + prevBalance - receivings;

  return (
    <div className="w-full flex justify-center py-3 sm:py-8 px-2 sm:px-4">
      {/* A4 Sheet Container */}
      <div 
        id="invoice-print-area"
        className="print-page bg-white w-full max-w-[860px] min-h-[1050px] p-4 sm:p-8 md:p-12 shadow-2xl rounded-sm border border-gray-400 relative text-black text-[13px] leading-tight font-arial select-text"
      >
        {/* Top Header Section (Responsive: stacks on phone, row on tablet/desktop) */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-5 sm:mb-6 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black font-arial">
              Sale Invoice
            </h1>
          </div>
          <div className="w-full sm:w-72 space-y-1.5 sm:space-y-1 sm:text-right">
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <span className="font-bold text-xs sm:text-[14px] text-black whitespace-nowrap">Voucher #:</span>
              <input
                type="text"
                value={invoice?.voucherNo || ''}
                onChange={(e) => updateField(null, 'voucherNo', e.target.value)}
                placeholder="INV-0001"
                className="w-32 text-left font-semibold border-b border-black outline-none px-1 py-0.5 bg-transparent"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <span className="font-bold text-xs sm:text-[14px] text-black whitespace-nowrap">Date:</span>
              <input
                type="text"
                value={invoice?.date || ''}
                onChange={(e) => updateField(null, 'date', e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-32 text-left font-semibold border-b border-black outline-none px-1 py-0.5 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Account Detail & Voucher Detail Container */}
        <div className="relative border border-black mb-5">
          {/* Grey Tabs sitting on top border */}
          <div className="absolute -top-[13px] left-2 bg-[#C0C0C0] px-3 py-0.5 font-bold text-xs text-black border border-black z-10 select-none">
            Account Detail
          </div>
          <div className="absolute -top-[13px] right-2 sm:right-[30%] bg-[#C0C0C0] px-3 py-0.5 font-bold text-xs text-black border border-black z-10 select-none">
            Voucher Detail
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 min-h-[115px]">
            {/* Left Column: Account Details (Customer Name, Address, City, Contact Inf) */}
            <div className="col-span-1 md:col-span-8 print:col-span-8 p-3 pt-4 border-b md:border-b-0 md:border-r border-black print:border-r print:border-b-0 flex flex-col justify-between">
              {/* Customer Name with suggestions */}
              <div className="flex flex-col sm:flex-row sm:items-baseline space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                <label className="font-bold italic text-black whitespace-nowrap min-w-[110px] text-xs sm:text-[13px]">
                  Customer Name
                </label>
                <input
                  type="text"
                  list="customer-suggestions-list"
                  value={invoice?.account?.customerName || ''}
                  onChange={(e) => handleCustomerNameChange(e.target.value)}
                  placeholder="Enter or select customer"
                  className="flex-1 font-normal text-black bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1 sm:py-0.5 text-xs sm:text-[13px]"
                />
                <datalist id="customer-suggestions-list">
                  {customerSuggestions.map((cust, i) => (
                    <option key={i} value={cust.customerName}>
                      {cust.city ? `${cust.customerName} (${cust.city})` : cust.customerName}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Address */}
              <div className="flex flex-col sm:flex-row sm:items-baseline space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                <label className="font-bold italic text-black whitespace-nowrap min-w-[110px] text-xs sm:text-[13px]">
                  Address
                </label>
                <input
                  type="text"
                  value={invoice?.account?.address || ''}
                  onChange={(e) => updateField('account', 'address', e.target.value)}
                  className="flex-1 font-normal text-black bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1 sm:py-0.5 text-xs sm:text-[13px]"
                />
              </div>

              {/* City and Contact Inf */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-baseline space-x-2 flex-1">
                  <label className="font-bold italic text-black whitespace-nowrap text-xs sm:text-[13px]">
                    City
                  </label>
                  <input
                    type="text"
                    value={invoice?.account?.city || ''}
                    onChange={(e) => updateField('account', 'city', e.target.value)}
                    className="flex-1 font-normal text-black bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1 sm:py-0.5 text-xs sm:text-[13px]"
                  />
                </div>
                <div className="flex items-baseline space-x-2 flex-1">
                  <label className="font-bold italic text-black whitespace-nowrap text-xs sm:text-[13px]">
                    Contact Inf
                  </label>
                  <input
                    type="text"
                    value={invoice?.account?.contactInf || ''}
                    onChange={(e) => updateField('account', 'contactInf', e.target.value)}
                    className="flex-1 font-normal text-black bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1 sm:py-0.5 text-xs sm:text-[13px]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Voucher Detail (Ref #, Rec #, Remarks) */}
            <div className="col-span-1 md:col-span-4 print:col-span-4 p-3 pt-4 flex flex-col justify-between">
              {/* Ref # */}
              <div className="flex items-baseline space-x-2 mb-2">
                <label className="font-bold text-black whitespace-nowrap min-w-[65px] text-xs sm:text-[13px]">
                  Ref #
                </label>
                <input
                  type="text"
                  value={invoice?.voucher?.refNo || ''}
                  onChange={(e) => updateField('voucher', 'refNo', e.target.value)}
                  className="flex-1 font-normal text-black bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1 sm:py-0.5 text-xs sm:text-[13px]"
                />
              </div>

              {/* Rec # */}
              <div className="flex items-baseline space-x-2 mb-2">
                <label className="font-bold text-black whitespace-nowrap min-w-[65px] text-xs sm:text-[13px]">
                  Rec #
                </label>
                <input
                  type="text"
                  value={invoice?.voucher?.recNo || ''}
                  onChange={(e) => updateField('voucher', 'recNo', e.target.value)}
                  className="flex-1 font-normal text-black bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1 sm:py-0.5 text-xs sm:text-[13px]"
                />
              </div>

              {/* Remarks */}
              <div className="flex items-baseline space-x-2">
                <label className="font-bold text-black whitespace-nowrap min-w-[65px] text-xs sm:text-[13px]">
                  Remarks
                </label>
                <input
                  type="text"
                  value={invoice?.voucher?.remarks || ''}
                  onChange={(e) => updateField('voucher', 'remarks', e.target.value)}
                  className="flex-1 font-normal text-black bg-transparent border-b border-gray-300 focus:border-black outline-none px-1 py-1 sm:py-0.5 text-xs sm:text-[13px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="no-print sm:hidden text-[10px] text-slate-500 pb-1 flex items-center justify-end space-x-1">
          <span>Swipe table left/right</span>
          <ArrowRight size={10} />
        </div>

        {/* Products Table (Responsive scroll container on phone, full on desktop/print) */}
        <div className="border border-black mb-5 overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[620px] sm:min-w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#C0C0C0] text-black font-bold text-xs sm:text-[13px] border-b border-black">
                <th className="border-r border-black py-1.5 px-2 text-center w-[48px]">Sr #</th>
                <th className="border-r border-black py-1.5 px-2 w-[22%]">Item_Part_Number</th>
                <th className="border-r border-black py-1.5 px-2 w-[34%]">Item Description</th>
                <th className="border-r border-black py-1.5 px-2 w-[14%]">Brand</th>
                <th className="border-r border-black py-1.5 px-2 text-center w-[8%]">Qty</th>
                <th className="border-r border-black py-1.5 px-2 text-center w-[10%]">Rate</th>
                <th className="py-1.5 px-2 text-center w-[12%]">Total</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(invoice?.items) ? invoice.items : []).map((item, index) => {
                const itemQty = item?.qty !== '' && item?.qty !== undefined ? item.qty : '';
                const itemRate = item?.rate !== '' && item?.rate !== undefined ? item.rate : '';
                const hasValue = itemQty !== '' || itemRate !== '';
                const rowTotalVal = hasValue 
                  ? ((parseFloat(itemQty) || 0) * (parseFloat(itemRate) || 0)) 
                  : (item?.total !== '' && item?.total !== undefined ? parseFloat(item.total) || 0 : '');

                return (
                  <tr 
                    key={index}
                    className="border-b border-black group hover:bg-yellow-50/40 transition-colors h-[32px]"
                  >
                    {/* Auto-generated Sr # (1, 2, 3...) with hover delete button */}
                    <td className="border-r border-black text-center font-bold text-xs p-0 relative">
                      <span className="block text-center">{index + 1}</span>
                      {!isPrintMode && (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          title={`Delete row ${index + 1}`}
                          className="no-print opacity-0 group-hover:opacity-100 absolute left-1 top-1/2 -translate-y-1/2 p-0.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>

                    {/* Item_Part_Number with datalist suggestions */}
                    <td className="border-r border-black p-0">
                      <input
                        id={`part-input-${index}`}
                        type="text"
                        list="item-parts-datalist"
                        value={item?.partNumber || ''}
                        onChange={(e) => updateItem(index, 'partNumber', e.target.value)}
                        className="w-full h-full px-2 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-[13px]"
                      />
                    </td>

                    {/* Item Description */}
                    <td className="border-r border-black p-0">
                      <input
                        type="text"
                        value={item?.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full h-full px-2 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-[13px]"
                      />
                    </td>

                    {/* Brand */}
                    <td className="border-r border-black p-0">
                      <input
                        type="text"
                        value={item?.brand || ''}
                        onChange={(e) => updateItem(index, 'brand', e.target.value)}
                        className="w-full h-full px-2 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-[13px]"
                      />
                    </td>

                    {/* Qty (Numbers only) */}
                    <td className="border-r border-black p-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={itemQty}
                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                        placeholder=""
                        className="w-full h-full px-1 py-1 text-center outline-none bg-transparent font-normal text-black focus:bg-white text-[13px]"
                      />
                    </td>

                    {/* Rate (Numbers only) with Enter-to-next-row navigation */}
                    <td className="border-r border-black p-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={itemRate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        onKeyDown={(e) => handleRateKeyDown(e, index)}
                        placeholder=""
                        className="w-full h-full px-1 py-1 text-right outline-none bg-transparent font-normal text-black focus:bg-white text-[13px]"
                      />
                    </td>

                    {/* Total = Qty * Rate in PKR format */}
                    <td className="p-0 text-right font-normal text-black px-2 py-1 text-[13px]">
                      {rowTotalVal !== '' ? formatPKR(rowTotalVal, true) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Datalist for item suggestions */}
          <datalist id="item-parts-datalist">
            {itemSuggestions.map((it, i) => (
              <option key={i} value={it.partNumber}>
                {it.description ? `${it.partNumber} - ${it.description}` : it.partNumber}
              </option>
            ))}
          </datalist>

          {/* Table Footer Toolbar (Add Row button, hidden in print) */}
          {!isPrintMode && (
            <div className="no-print bg-gray-50 border-t border-gray-300 px-3 py-1 flex items-center justify-between text-xs text-gray-500">
              <span>{(invoice?.items || []).length} rows (Sr # 1 to {(invoice?.items || []).length})</span>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 rounded hover:bg-blue-50 transition"
              >
                <Plus size={14} className="stroke-[2.5]" />
                <span>Add Row</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: Transportation Details & Totals side by side (stacks on mobile, side-by-side in print & desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-5 mb-10">
          {/* Left Box: Transportation Details */}
          <div className="col-span-1 md:col-span-8 print:col-span-8 border border-black flex flex-col justify-between">
            {/* Box Header */}
            <div className="bg-[#C0C0C0] text-center font-bold text-xs sm:text-[13px] py-1 border-b border-black text-black">
              Transportation Details
            </div>

            {/* Row 1: Transporter Name */}
            <div className="flex border-b border-black min-h-[30px]">
              <div className="w-[130px] sm:w-[145px] px-2 py-1 font-bold text-xs sm:text-[13px] border-r border-black flex items-center shrink-0">
                Transporter Name
              </div>
              <div className="flex-1 p-0 flex items-center">
                <input
                  type="text"
                  value={invoice?.transport?.name || ''}
                  onChange={(e) => updateField('transport', 'name', e.target.value)}
                  className="w-full h-full px-2 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-xs sm:text-[13px]"
                />
              </div>
            </div>

            {/* Row 2: Deliver Date | TR # | No Of Cases */}
            <div className="flex border-b border-black min-h-[30px] flex-wrap sm:flex-nowrap">
              <div className="w-[130px] sm:w-[145px] px-2 py-1 font-bold text-xs sm:text-[13px] border-r border-black flex items-center shrink-0">
                Deliver Date
              </div>
              <div className="w-[90px] sm:w-[110px] border-r border-black p-0 flex items-center">
                <input
                  type="text"
                  value={invoice?.transport?.date || ''}
                  onChange={(e) => updateField('transport', 'date', e.target.value)}
                  className="w-full h-full px-1.5 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-xs"
                />
              </div>
              <div className="w-[50px] sm:w-[70px] px-1 py-1 font-bold text-xs sm:text-[13px] border-r border-black flex items-center justify-center shrink-0">
                TR #
              </div>
              <div className="flex-1 border-r border-black p-0 flex items-center min-w-[60px]">
                <input
                  type="text"
                  value={invoice?.transport?.trNo || ''}
                  onChange={(e) => updateField('transport', 'trNo', e.target.value)}
                  className="w-full h-full px-1.5 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-xs"
                />
              </div>
              <div className="w-[80px] sm:w-[95px] px-1 py-1 font-bold text-xs sm:text-[13px] border-r border-black flex items-center justify-center text-center shrink-0">
                No Of Cases
              </div>
              <div className="w-[45px] sm:w-[50px] p-0 flex items-center">
                <input
                  type="text"
                  value={invoice?.transport?.noOfCases || ''}
                  onChange={(e) => updateField('transport', 'noOfCases', e.target.value)}
                  className="w-full h-full px-1 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-center text-xs"
                />
              </div>
            </div>

            {/* Row 3: Deliver To */}
            <div className="flex min-h-[30px]">
              <div className="w-[130px] sm:w-[145px] px-2 py-1 font-bold text-xs sm:text-[13px] border-r border-black flex items-center shrink-0">
                Deliver To
              </div>
              <div className="flex-1 p-0 flex items-center">
                <input
                  type="text"
                  value={invoice?.transport?.deliverTo || ''}
                  onChange={(e) => updateField('transport', 'deliverTo', e.target.value)}
                  className="w-full h-full px-2 py-1 outline-none bg-transparent font-normal text-black focus:bg-white text-xs sm:text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* Right Box: Totals (Live Instant Auto-calculated in PKR format) */}
          <div className="col-span-1 md:col-span-4 print:col-span-4 border border-black flex flex-col justify-between">
            {/* Total = Sum of all rows Total */}
            <div className="flex border-b border-black min-h-[26px]">
              <div className="w-[140px] px-2 py-0.5 font-bold text-xs sm:text-[13px] border-r border-black flex items-center">
                Total
              </div>
              <div className="flex-1 px-2 py-0.5 text-right font-normal text-xs sm:text-[13px] flex items-center justify-end">
                {formatPKR(calculatedTotal, true)}
              </div>
            </div>

            {/* Total Discount */}
            <div className="flex border-b border-black min-h-[26px]">
              <div className="w-[140px] px-2 py-0.5 font-bold text-xs sm:text-[13px] border-r border-black flex items-center">
                Total Discount
              </div>
              <div className="flex-1 p-0 flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={invoice?.totals?.discount ?? '0'}
                  onChange={(e) => updateField('totals', 'discount', e.target.value)}
                  className="w-full h-full px-2 py-0.5 text-right font-normal outline-none bg-transparent focus:bg-white text-xs sm:text-[13px]"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Total Charges */}
            <div className="flex border-b border-black min-h-[26px]">
              <div className="w-[140px] px-2 py-0.5 font-bold text-xs sm:text-[13px] border-r border-black flex items-center">
                Total Charges
              </div>
              <div className="flex-1 p-0 flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={invoice?.totals?.charges ?? '0'}
                  onChange={(e) => updateField('totals', 'charges', e.target.value)}
                  className="w-full h-full px-2 py-0.5 text-right font-normal outline-none bg-transparent focus:bg-white text-xs sm:text-[13px]"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Grand Total (Grey Background) = Total - Total Discount + Total Charges */}
            <div className="flex bg-[#C0C0C0] border-b border-black min-h-[28px]">
              <div className="w-[140px] px-2 py-1 font-bold text-xs sm:text-[13px] border-r border-black flex items-center">
                Grand Total
              </div>
              <div className="flex-1 px-2 py-1 text-right font-bold text-xs sm:text-[13px] flex items-center justify-end">
                {formatPKR(grandTotal, true)}
              </div>
            </div>

            {/* Blank Spacer Row matching exact image */}
            <div className="border-b border-black h-[22px] bg-white"></div>

            {/* Previous Balance */}
            <div className="flex border-b border-black min-h-[25px]">
              <div className="w-[140px] px-2 py-0.5 italic font-bold text-xs border-r border-black flex items-center">
                Previous Balance
              </div>
              <div className="flex-1 p-0 flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={invoice?.totals?.prevBalance ?? '0'}
                  onChange={(e) => updateField('totals', 'prevBalance', e.target.value)}
                  className="w-full h-full px-2 py-0.5 text-right font-normal outline-none bg-transparent focus:bg-white text-xs"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Receivings */}
            <div className="flex border-b border-black min-h-[25px]">
              <div className="w-[140px] px-2 py-0.5 italic font-bold text-xs border-r border-black flex items-center">
                Receivings
              </div>
              <div className="flex-1 p-0 flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={invoice?.totals?.receivings ?? '0'}
                  onChange={(e) => updateField('totals', 'receivings', e.target.value)}
                  className="w-full h-full px-2 py-0.5 text-right font-normal outline-none bg-transparent focus:bg-white text-xs"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Final Balance = Grand Total + Previous Balance - Receivings */}
            <div className="flex min-h-[26px]">
              <div className="w-[140px] px-2 py-0.5 italic font-bold text-xs border-r border-black flex items-center">
                Final Balance
              </div>
              <div className="flex-1 px-2 py-0.5 text-right font-normal text-xs sm:text-[13px] flex items-center justify-end">
                {formatPKR(finalBalance, true)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Signature Line */}
        <div className="mt-12 sm:mt-16 w-56">
          <div className="border-b border-black w-full mb-1"></div>
          <div className="font-bold text-[13px] text-black">
            Checked By
          </div>
        </div>
      </div>
    </div>
  );
}
