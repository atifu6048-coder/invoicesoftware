import React, { useState, useRef } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  FileText, 
  X, 
  Receipt,
  Download,
  Upload
} from 'lucide-react';
import { formatPKR } from '../utils/format';

export default function SavedInvoicesSidebar({
  isOpen,
  onClose,
  savedInvoices,
  onLoadInvoice,
  onDeleteInvoice,
  onImportInvoices,
  currentVoucherNo
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const exportInvoices = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedInvoices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sale_invoices_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed)) {
          onImportInvoices(parsed);
        } else {
          alert('Invalid file format. Please upload a valid JSON backup.');
        }
      } catch (err) {
        alert('Failed to read file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter invoices by Customer Name or Voucher #
  const filteredInvoices = savedInvoices.filter((inv) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const voucherMatch = (inv.voucherNo || '').toLowerCase().includes(term);
    const customerMatch = (inv.account?.customerName || '').toLowerCase().includes(term);
    return voucherMatch || customerMatch;
  });

  const handleDelete = (e, inv) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Invoice #${inv.voucherNo || 'N/A'} for ${inv.account?.customerName || 'Cash Customer'}?`
    );
    if (confirmDelete) {
      onDeleteInvoice(inv.id);
    }
  };

  const handleEdit = (e, inv) => {
    e.stopPropagation();
    onLoadInvoice(inv);
    // On mobile screens, auto-close sidebar on load
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  // Calculate grand total of an invoice
  const getInvoiceGrandTotal = (inv) => {
    const itemsTotal = (inv?.items || []).reduce((sum, item) => {
      const q = parseFloat(item?.qty) || 0;
      const r = parseFloat(item?.rate) || 0;
      return sum + (q * r);
    }, 0);
    const discount = parseFloat(inv?.totals?.discount) || 0;
    const charges = parseFloat(inv?.totals?.charges) || 0;
    return itemsTotal - discount + charges;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden no-print animate-in fade-in duration-200"
        title="Click to close"
      />

      <aside className="no-print fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[360px] sm:w-96 bg-white border-r border-slate-300 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
      {/* Sidebar Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Receipt className="text-blue-400" size={20} />
          <div>
            <h2 className="font-bold text-sm tracking-wide text-white">Saved Invoices</h2>
            <p className="text-[11px] text-slate-400">
              {savedInvoices.length} {savedInvoices.length === 1 ? 'invoice' : 'invoices'} stored
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          title="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <div className="relative">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Voucher # or Customer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Invoice List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {savedInvoices.length === 0 ? (
          <div className="text-center py-16 px-4 text-slate-400 space-y-2">
            <FileText size={36} className="mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-600">No saved invoices yet</p>
            <p className="text-xs text-slate-400">
              Fill in an invoice and click <span className="font-semibold text-slate-600">Save Invoice</span> to store it here.
            </p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400 space-y-1">
            <p className="text-xs font-medium text-slate-500">No matches found for "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isCurrent = currentVoucherNo === inv.voucherNo;
            const grandTotal = getInvoiceGrandTotal(inv);

            return (
              <div
                key={inv.id}
                onClick={(e) => handleEdit(e, inv)}
                className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                  isCurrent 
                    ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Top Row: Voucher # and Date */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {inv.voucherNo || 'N/A'}
                    </span>
                    {isCurrent && (
                      <span className="bg-blue-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium">
                    <Calendar size={11} className="text-slate-400" />
                    <span>{inv.date || 'N/A'}</span>
                  </div>
                </div>

                {/* Customer Name */}
                <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold mb-2 truncate">
                  <User size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">
                    {inv.account?.customerName || 'Cash Customer'}
                  </span>
                </div>

                {/* Bottom Row: Grand Total and Edit / Delete Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">
                      Grand Total
                    </span>
                    <span className="font-black text-xs text-slate-900">
                      PKR {formatPKR(grandTotal, true)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={(e) => handleEdit(e, inv)}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition active:scale-95"
                      title="Load and edit this invoice"
                    >
                      <Edit3 size={11} />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, inv)}
                      className="inline-flex items-center p-1 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete invoice (asks confirmation)"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer with Export/Import Backup */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Click any invoice to view or edit</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold text-xs"
          >
            Hide
          </button>
        </div>

        <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          {onImportInvoices && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition shadow-xs"
              title="Upload JSON backup file"
            >
              <Upload size={12} className="text-slate-500" />
              <span>Import</span>
            </button>
          )}
          {savedInvoices.length > 0 && (
            <button
              type="button"
              onClick={exportInvoices}
              className="flex-1 inline-flex items-center justify-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition shadow-xs"
              title="Download full invoice history as JSON"
            >
              <Download size={12} className="text-slate-500" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}

