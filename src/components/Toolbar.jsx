import React from 'react';
import { 
  Printer, 
  FilePlus, 
  Save, 
  FolderOpen, 
  Sparkles, 
  RotateCcw,
  PlusCircle,
  FileText,
  Eraser
} from 'lucide-react';

export default function Toolbar({
  onNewInvoice,
  onClearInvoice,
  onSaveInvoice,
  onToggleSidebar,
  isSidebarOpen,
  onPrint,
  onLoadSample,
  onResetRows,
  onAddRow,
  savedCount
}) {
  return (
    <header className="no-print bg-slate-900 text-white shadow-md sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* App Title & Badge */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm text-white flex items-center justify-center">
            <FileText size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-wide text-white">Sale Invoice Software</span>
              <span className="text-[10px] uppercase font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">Ready for editing and instant high-fidelity print</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Saved Invoices Sidebar Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition shadow-sm active:scale-95 ${
              isSidebarOpen 
                ? 'bg-purple-700 text-white border-purple-500 shadow-purple-900/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
            title="Toggle Saved Invoices Sidebar"
          >
            <FolderOpen size={15} className={isSidebarOpen ? 'text-white' : 'text-purple-400'} />
            <span>Saved Invoices</span>
            {savedCount > 0 && (
              <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {savedCount}
              </span>
            )}
          </button>

          {/* New Invoice */}
          <button
            type="button"
            onClick={onNewInvoice}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold border border-slate-600 transition shadow-sm active:scale-95"
            title="Create next invoice with new Voucher # and today's date"
          >
            <FilePlus size={15} className="text-emerald-400" />
            <span>New Invoice</span>
          </button>

          {/* Clear Current Invoice */}
          <button
            type="button"
            onClick={onClearInvoice}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs font-semibold border border-slate-600 transition shadow-sm active:scale-95"
            title="Clear fields on current invoice without deleting saved invoices"
          >
            <Eraser size={15} className="text-amber-400" />
            <span>Clear</span>
          </button>

          {/* Fill Sample Data */}
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold border border-slate-600 transition shadow-sm active:scale-95"
            title="Fill with realistic shop sample data"
          >
            <Sparkles size={15} className="text-yellow-400" />
            <span>Load Sample</span>
          </button>

          {/* Add Row */}
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold border border-slate-600 transition shadow-sm active:scale-95"
            title="Add a new row to items table"
          >
            <PlusCircle size={15} className="text-sky-400" />
            <span>Add Row</span>
          </button>

          {/* Reset Rows */}
          <button
            type="button"
            onClick={onResetRows}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded text-xs font-medium border border-slate-600 transition shadow-sm active:scale-95"
            title="Reset table to default 7 empty rows"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset 7 Rows</span>
          </button>

          {/* Save Invoice */}
          <button
            type="button"
            onClick={onSaveInvoice}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded text-xs font-bold transition shadow-sm active:scale-95 hover:shadow-blue-500/25"
            title="Save invoice to local storage (Ctrl+S)"
          >
            <Save size={15} />
            <span>Save Invoice</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-bold transition shadow-sm active:scale-95 hover:shadow-emerald-500/25"
            title="Print or export as PDF (Ctrl+P)"
          >
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}

