import React, { useState } from 'react';
import { Invoice } from '../hooks/useQueries';
import { useGetAllInvoices } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Download, FileDown } from 'lucide-react';
import { exportInvoicesToCSV, exportToJSON } from '../utils/exportUtils';
import { toast } from 'sonner';

function formatINR(amount: bigint): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));
}

export default function InvoiceHistoryPage() {
  const { data: invoices = [], isLoading } = useGetAllInvoices();
  const [search, setSearch] = useState('');

  const filtered = invoices.filter(inv =>
    inv.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
    inv.serviceBreakdown.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    exportInvoicesToCSV(filtered);
    toast.success('Invoices exported as CSV');
  };

  const handleExportJSON = () => {
    exportToJSON(filtered, `invoices-${Date.now()}.json`);
    toast.success('Invoices exported as JSON');
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const content = [
      `Invoice ID: ${invoice.invoiceId}`,
      `Service Breakdown: ${invoice.serviceBreakdown}`,
      `GST Amount: ${formatINR(invoice.gstAmount)}`,
      `Total Paid: ${formatINR(invoice.totalPaid)}`,
      `Created At: ${new Date(Number(invoice.createdAt) / 1_000_000).toLocaleString()}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold font-heading text-foreground">Invoice History</h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportCSV} className="border-border text-xs">
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              CSV
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportJSON} className="border-border text-xs">
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              JSON
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="pl-9 bg-input border-border text-foreground"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card-glass rounded-xl p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Invoices Found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try a different search term.' : 'Invoices will appear here after payments are processed.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(invoice => (
              <div key={invoice.invoiceId} className="card-glass rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{invoice.invoiceId}</span>
                    <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">Paid</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{invoice.serviceBreakdown}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(Number(invoice.createdAt) / 1_000_000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">{formatINR(invoice.totalPaid)}</p>
                  <p className="text-xs text-muted-foreground">GST: {formatINR(invoice.gstAmount)}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadInvoice(invoice)}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-primary mt-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
