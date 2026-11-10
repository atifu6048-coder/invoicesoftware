import React, { useRef } from 'react';
import { X, Trash2, FolderDown, Calendar, FileText, Download, Upload } from 'lucide-react';

export default function SavedInvoicesModal({
  isOpen,
  onClose,
  savedInvoices,
  onLoadInvoice,
  onDeleteInvoice,
  onImportInvoices
}) {
  const fileInputRef = useRef(null);
  if (!isOpen) return null;

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
          alert('Invalid invoice file format');
        }
      } catch (err) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FolderDown className="text-blue-400" size={22} />
            <h2 className="font-bold text-lg text-white">Saved Invoices</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {savedInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <FileText size={40} className="mx-auto text-gray-300 stroke-1" />
              <p className="font-medium text-base text-gray-700">No saved invoices yet</p>
              <p className="text-xs text-gray-400">
                Click "Save Invoice" on the toolbar to store your invoices locally.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
              {savedInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-sm">
                        Voucher #{inv.voucherNo || 'N/A'}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                        {inv.account?.customerName || 'Cash Customer'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar size={13} className="text-gray-400" />
                        <span>Date: {inv.date || 'N/A'}</span>
                      </span>
                      <span>Items: {inv.items?.length || 0}</span>
                      <span>
                        Saved on: {new Date(inv.timestamp).toLocaleDateString()} {new Date(inv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onLoadInvoice(inv);
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteInvoice(inv.id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                      title="Delete saved invoice"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Upload size={14} className="text-gray-500" />
                <span>Import JSON</span>
              </button>
            )}
            {savedInvoices.length > 0 && (
              <button
                type="button"
                onClick={exportInvoices}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Download size={14} className="text-gray-500" />
                <span>Export JSON</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

