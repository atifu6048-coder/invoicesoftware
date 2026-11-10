# Sale Invoice Software Web App

A professional, full-featured **Sale Invoice Software** web application built with **React**, **Vite**, and **Tailwind CSS**. Designed to match real shop paper invoices with 1:1 pixel accuracy, instant live auto-calculations, persistent local storage, customer/item autocompletion, and crisp A4 print/PDF export.

---

## 🌟 Key Features

### 1. Exact 1:1 Paper Invoice Design
- **Header**: Large bold "Sale Invoice" title with top-right Voucher # and Date fields.
- **Account & Voucher Details**: Dual-section bordered container featuring `#C0C0C0` grey badge tabs (`[Account Detail]` and `[Voucher Detail]`) with Customer Name, Address, City, Contact Inf, Ref #, Rec #, and Remarks.
- **Products Table**: 7 default numbered rows with Arial bold grey header row (`Sr #`, `Item_Part_Number`, `Item Description`, `Brand`, `Qty`, `Rate`, `Total`).
- **Transportation & Totals**:
  - Left box: "Transportation Details" header with Transporter Name, Deliver Date, TR #, No Of Cases, and Deliver To.
  - Right box: Totals box with Total, Total Discount, Total Charges, Grand Total (highlighted with `#C0C0C0` grey bar), spacer row, italicized Previous Balance, Receivings, and Final Balance.
- **Checked By**: Signature line positioned at bottom-left.

### 2. Live Instant Calculations
- **Row Total**: `Qty × Rate` calculates live on keystroke; empty rows remain blank to keep print clean.
- **Total**: Live sum of all item rows.
- **Grand Total**: `Total - Total Discount + Total Charges`.
- **Final Balance**: `Grand Total + Previous Balance - Receivings`.
- **PKR Currency Formatting**: All numbers are formatted with standard comma separators (e.g. `1,250`, `37,000`, `140,000`).

### 3. Smart Autocomplete & Fast POS Data Entry
- **Customer Suggestions**: Auto-suggests existing customer names and automatically fills their address, city, and phone number when selected.
- **Item Suggestions**: Auto-suggests previous part numbers, descriptions, brands, and rates.
- **Keyboard Navigation**: Pressing `Enter` on the `Rate` input jumps straight to the next row, or automatically adds a new row on the last line.

### 4. Storage & History
- **LocalStorage Persistence**: Full invoices are saved to browser storage and never disappear after page reloads.
- **Auto-Incrementing Voucher Number**: Voucher numbers start from `INV-0001` and automatically increment sequentially after saving.
- **Saved Invoices Sidebar**: Search invoices by Customer Name or Voucher # with 1-click **Edit** and **Delete** (with confirmation).
- **JSON Backup & Restore**: Export full invoice history as a `.json` backup file or import previous backups.

### 5. High-Fidelity A4 Print / PDF
- Dedicated `@media print` stylesheet.
- Hides toolbar, sidebar, buttons, and toasts.
- Preserves exact black borders, `#C0C0C0` grey headers, and standard A4 portrait margins.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Save current invoice |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Print / Export as A4 PDF |
| <kbd>Enter</kbd> (in Rate cell) | Jump to next row or auto-create a new row |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/atifu6048-coder/invoicesoftware.git

# Navigate to project folder
cd invoicesoftware

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Technology Stack
- **React 18**
- **Vite 6**
- **Tailwind CSS 3**
- **Lucide React** (icons)

