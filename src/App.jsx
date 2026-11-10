import React, { useState, useEffect, useMemo } from 'react';
import Toolbar from './components/Toolbar';
import InvoicePage from './components/InvoicePage';
import SavedInvoicesSidebar from './components/SavedInvoicesSidebar';
import { CheckCircle2 } from 'lucide-react';

const createDefaultRows = (count = 7) => {
  return Array.from({ length: count }, (_, index) => ({
    sr: index + 1,
    partNumber: '',
    description: '',
    brand: '',
    qty: '',
    rate: '',
    total: ''
  }));
};

const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getNextVoucherNo = (invoices = []) => {
  if (!Array.isArray(invoices) || invoices.length === 0) return 'INV-0001';
  let highest = 0;
  invoices.forEach(inv => {
    if (!inv) return;
    const match = String(inv.voucherNo || '').match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (!isNaN(val) && val > highest) highest = val;
    }
  });
  return `INV-${String(highest + 1).padStart(4, '0')}`;
};

const createEmptyInvoice = (voucherNo = 'INV-0001') => ({
  voucherNo,
  date: getTodayDate(),
  account: {
    customerName: '',
    address: '',
    city: '',
    contactInf: ''
  },
  voucher: {
    refNo: '',
    recNo: '',
    remarks: ''
  },
  items: createDefaultRows(7),
  transport: {
    name: '',
    date: getTodayDate(),
    trNo: '',
    noOfCases: '',
    deliverTo: ''
  },
  totals: {
    discount: '0',
    charges: '0',
    prevBalance: '0',
    receivings: '0'
  }
});

export default function App() {
  const [invoice, setInvoice] = useState(() => createEmptyInvoice('INV-0001'));
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load saved invoices from localStorage on mount & initialize next voucher #
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sale_invoices_storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedInvoices(parsed);
          const nextVoucher = getNextVoucherNo(parsed);
          setInvoice(prev => ({
            ...prev,
            voucherNo: nextVoucher
          }));
          if (parsed.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1280) {
            setIsSidebarOpen(true);
          }
        } else {
          setSavedInvoices([]);
        }
      }
    } catch (e) {
      console.error('Error loading saved invoices:', e);
      setSavedInvoices([]);
    }
  }, []);

  // Keyboard shortcuts (Ctrl+S for save, Ctrl+P for print)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveInvoice();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoice, savedInvoices]);

  // Extract unique customer suggestions from saved invoices
  const customerSuggestions = useMemo(() => {
    const map = new Map();
    if (Array.isArray(savedInvoices)) {
      savedInvoices.forEach(inv => {
        const name = inv?.account?.customerName?.trim();
        if (name && !map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), {
            customerName: name,
            address: inv?.account?.address || '',
            city: inv?.account?.city || '',
            contactInf: inv?.account?.contactInf || ''
          });
        }
      });
    }
    return Array.from(map.values());
  }, [savedInvoices]);

  // Extract unique item suggestions from saved invoices
  const itemSuggestions = useMemo(() => {
    const map = new Map();
    if (Array.isArray(savedInvoices)) {
      savedInvoices.forEach(inv => {
        if (Array.isArray(inv?.items)) {
          inv.items.forEach(it => {
            const part = it?.partNumber?.trim();
            if (part && !map.has(part.toLowerCase())) {
              map.set(part.toLowerCase(), {
                partNumber: part,
                description: it?.description || '',
                brand: it?.brand || '',
                rate: it?.rate || ''
              });
            }
          });
        }
      });
    }
    return Array.from(map.values());
  }, [savedInvoices]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // "New Invoice" button
  const handleNewInvoice = () => {
    const nextVoucher = getNextVoucherNo(savedInvoices);
    setInvoice(createEmptyInvoice(nextVoucher));
    showToast(`Created new invoice ${nextVoucher}`);
  };

  // "Clear" button
  const handleClearInvoice = () => {
    setInvoice(prev => ({
      ...createEmptyInvoice(prev?.voucherNo || 'INV-0001'),
      date: getTodayDate()
    }));
    showToast('Current invoice cleared');
  };

  // "Save Invoice" button
  const handleSaveInvoice = () => {
    const safeInvoice = {
      ...invoice,
      id: invoice?.id || Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    const currentList = Array.isArray(savedInvoices) ? savedInvoices : [];
    const updated = [safeInvoice, ...currentList.filter(i => i?.voucherNo !== safeInvoice.voucherNo)];
    setSavedInvoices(updated);

    try {
      localStorage.setItem('sale_invoices_storage', JSON.stringify(updated));
      showToast('Invoice Saved');
    } catch (e) {
      showToast('Error saving invoice');
      return;
    }

    // Auto-advance Voucher # for next invoice
    const nextVoucher = getNextVoucherNo(updated);
    setInvoice(createEmptyInvoice(nextVoucher));
    setIsSidebarOpen(true);
  };

  // Delete saved invoice with confirmation
  const handleDeleteSaved = (id) => {
    const currentList = Array.isArray(savedInvoices) ? savedInvoices : [];
    const updated = currentList.filter(item => item?.id !== id);
    setSavedInvoices(updated);
    try {
      localStorage.setItem('sale_invoices_storage', JSON.stringify(updated));
      showToast('Invoice deleted');
    } catch (e) {
      console.error(e);
    }
  };

  // Load saved invoice back into main form
  const handleLoadInvoice = (loadedInv) => {
    if (!loadedInv) return;
    setInvoice({
      ...createEmptyInvoice(),
      ...loadedInv,
      account: { ...loadedInv.account },
      voucher: { ...loadedInv.voucher },
      items: Array.isArray(loadedInv.items) ? loadedInv.items : createDefaultRows(7),
      transport: { ...loadedInv.transport },
      totals: { ...loadedInv.totals }
    });
    showToast(`Loaded Invoice #${loadedInv.voucherNo}`);
  };

  const handleImportInvoices = (imported) => {
    if (!Array.isArray(imported)) return;
    setSavedInvoices(imported);
    try {
      localStorage.setItem('sale_invoices_storage', JSON.stringify(imported));
      const nextVoucher = getNextVoucherNo(imported);
      setInvoice(prev => ({
        ...prev,
        voucherNo: nextVoucher
      }));
      showToast(`Imported ${imported.length} invoices successfully!`);
    } catch (e) {
      showToast('Error importing invoices');
    }
  };

  const handleLoadSample = () => {
    setInvoice({
      voucherNo: invoice?.voucherNo || 'INV-0001',
      date: getTodayDate(),
      account: {
        customerName: 'Al-Madina Auto Spares',
        address: 'Shop # 14, Montgomery Road',
        city: 'Lahore',
        contactInf: '0300-1234567'
      },
      voucher: {
        refNo: 'PO-8821',
        recNo: 'REC-90',
        remarks: 'Urgent Dispatch'
      },
      items: [
        { sr: 1, partNumber: 'BP-2041', description: 'Front Brake Pad Set Ceramic', brand: 'Akebono', qty: '4', rate: '3500', total: '14000' },
        { sr: 2, partNumber: 'OF-0912', description: 'Engine Oil Filter Element', brand: 'Toyota Genuine', qty: '10', rate: '1250', total: '12500' },
        { sr: 3, partNumber: 'SP-IK20', description: 'Iridium Spark Plugs (Pack of 4)', brand: 'Denso', qty: '6', rate: '4800', total: '28800' },
        { sr: 4, partNumber: 'AF-3320', description: 'Cabin AC Air Filter High Flow', brand: 'Bosch', qty: '5', rate: '1800', total: '9000' },
        { sr: 5, partNumber: 'FB-9910', description: 'Fan Alternator Belt 6PK1180', brand: 'Bando', qty: '8', rate: '2200', total: '17600' },
        { sr: 6, partNumber: 'CL-4412', description: 'Clutch Pressure Plate Kit', brand: 'Exedy', qty: '2', rate: '18500', total: '37000' },
        { sr: 7, partNumber: 'WR-0012', description: 'Silicone Wiper Blade Pair 24"/18"', brand: 'Michelin', qty: '6', rate: '1600', total: '9600' }
      ],
      transport: {
        name: 'Faisal Movers Cargo Service',
        date: getTodayDate(),
        trNo: 'FM-77124',
        noOfCases: '3',
        deliverTo: 'Main Branch Depot, Lahore'
      },
      totals: {
        discount: '1500',
        charges: '800',
        prevBalance: '5000',
        receivings: '50000'
      }
    });
    showToast('Loaded realistic sample data');
  };

  const handleResetRows = () => {
    setInvoice(prev => ({
      ...prev,
      items: createDefaultRows(7)
    }));
    showToast('Reset to 7 empty rows');
  };

  const handleAddRow = () => {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#d8dbdf] flex flex-col font-arial text-black selection:bg-blue-100">
      {/* Top Application Toolbar */}
      <Toolbar
        onNewInvoice={handleNewInvoice}
        onClearInvoice={handleClearInvoice}
        onSaveInvoice={handleSaveInvoice}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
        onPrint={handlePrint}
        onLoadSample={handleLoadSample}
        onResetRows={handleResetRows}
        onAddRow={handleAddRow}
        savedCount={Array.isArray(savedInvoices) ? savedInvoices.length : 0}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar for Saved Invoices */}
        <SavedInvoicesSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          savedInvoices={Array.isArray(savedInvoices) ? savedInvoices : []}
          onLoadInvoice={handleLoadInvoice}
          onDeleteInvoice={handleDeleteSaved}
          onImportInvoices={handleImportInvoices}
          currentVoucherNo={invoice?.voucherNo}
        />

        {/* Main Content: Printable A4 Invoice Sheet */}
        <main className={`flex-1 overflow-x-auto pb-12 transition-all duration-200 ${isSidebarOpen ? 'lg:pl-96' : ''}`}>
          <InvoicePage
            invoice={invoice}
            setInvoice={setInvoice}
            customerSuggestions={customerSuggestions}
            itemSuggestions={itemSuggestions}
            isPrintMode={false}
          />
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center space-x-2 text-sm z-50 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
