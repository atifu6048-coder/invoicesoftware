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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-2">
          {/* App Title & Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg shadow-sm text-white flex items-center justify-center shrink-0">
              <FileText size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm sm:text-base tracking-wide text-white truncate">
                  Sale Invoice
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.2 rounded shrink-0">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                Ready for editing & instant print
              </p>
            </div>
          </div>

          {/* Primary Quick Actions (Always visible on mobile & desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Saved Invoices Sidebar Toggle */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold border transition shadow-sm active:scale-95 ${
                isSidebarOpen 
                  ? 'bg-purple-700 text-white border-purple-500 shadow-purple-900/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
              title="Toggle Saved Invoices"
            >
              <FolderOpen size={14} className={isSidebarOpen ? 'text-white' : 'text-purple-400'} />
              <span className="hidden xs:inline">Invoices</span>
              {savedCount > 0 && (
                <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Save Invoice */}
            <button
              type="button"
              onClick={onSaveInvoice}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2.5 sm:px-3.5 py-1.5 rounded text-xs font-bold transition shadow-sm active:scale-95 hover:shadow-blue-500/25 shrink-0"
              title="Save invoice (Ctrl+S)"
            >
              <Save size={14} />
              <span>Save</span>
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 sm:px-4 py-1.5 rounded text-xs font-bold transition shadow-sm active:scale-95 hover:shadow-emerald-500/25 shrink-0"
              title="Print or export as PDF (Ctrl+P)"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Secondary Action Bar (Horizontal swipeable on mobile, inline on desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-2 pb-0.5 border-t border-slate-800/80 mt-1.5 text-xs">
          {/* New Invoice */}
          <button
            type="button"
            onClick={onNewInvoice}
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700 transition shadow-xs whitespace-nowrap shrink-0 active:scale-95"
            title="Create next invoice"
          >
            <FilePlus size={13} className="text-emerald-400" />
            <span>New Invoice</span>
          </button>

          {/* Clear Current Invoice */}
          <button
            type="button"
            onClick={onClearInvoice}
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700 transition shadow-xs whitespace-nowrap shrink-0 active:scale-95"
            title="Clear fields on current invoice"
          >
            <Eraser size={13} className="text-amber-400" />
            <span>Clear</span>
          </button>

          {/* Add Row */}
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700 transition shadow-xs whitespace-nowrap shrink-0 active:scale-95"
            title="Add a new row to items table"
          >
            <PlusCircle size={13} className="text-sky-400" />
            <span>Add Row</span>
          </button>

          {/* Reset 7 Rows */}
          <button
            type="button"
            onClick={onResetRows}
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs font-medium border border-slate-700 transition shadow-xs whitespace-nowrap shrink-0 active:scale-95"
            title="Reset table to default 7 empty rows"
          >
            <RotateCcw size={12} />
            <span>Reset 7 Rows</span>
          </button>

          {/* Fill Sample Data */}
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700 transition shadow-xs whitespace-nowrap shrink-0 active:scale-95 ml-auto"
            title="Fill with realistic shop sample data"
          >
            <Sparkles size={13} className="text-yellow-400" />
            <span>Load Sample</span>
          </button>
        </div>
      </div>
    </header>
  );
}
