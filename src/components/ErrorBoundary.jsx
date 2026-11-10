import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('sale_invoices_storage');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-arial">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invoice Software Notice</h2>
            <p className="text-sm text-slate-600 mb-6">
              The application encountered a display issue. Click below to reload.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-sm transition active:scale-95"
              >
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold text-xs transition active:scale-95"
              >
                Reset Stored Data
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

