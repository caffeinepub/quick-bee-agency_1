import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + 'Z';
}

interface ExportModule {
  id: string;
  label: string;
  description: string;
  formats: string[];
}

const EXPORT_MODULES: ExportModule[] = [
  { id: 'leads', label: 'Leads Database', description: 'All lead records with qualification scores', formats: ['CSV', 'JSON'] },
  { id: 'invoices', label: 'Invoice Archive', description: 'Complete invoice history with GST breakdown', formats: ['CSV', 'JSON'] },
  { id: 'payments', label: 'Payment Logs', description: 'All payment transactions and statuses', formats: ['CSV', 'JSON'] },
  { id: 'whatsapp', label: 'WhatsApp Logs', description: 'Message delivery logs and statuses', formats: ['CSV', 'JSON'] },
  { id: 'services', label: 'Services Catalog', description: 'All services with pricing tiers', formats: ['CSV', 'JSON'] },
  { id: 'projects', label: 'Projects', description: 'All project records and statuses', formats: ['CSV', 'JSON'] },
];

export default function DataExportCenterPage() {
  const { actor } = useActor();
  const [loadingExport, setLoadingExport] = useState<string | null>(null);

  const handleExport = async (moduleId: string, format: string) => {
    if (!actor) {
      toast.error('Backend not available');
      return;
    }
    const key = `${moduleId}-${format}`;
    setLoadingExport(key);
    try {
      let data: unknown[] = [];
      switch (moduleId) {
        case 'leads':
          data = await actor.getAllLeads().catch(() => []);
          break;
        case 'invoices':
          data = await actor.getAllInvoices().catch(() => []);
          break;
        case 'payments':
          data = await actor.getAllPaymentLogs().catch(() => []);
          break;
        case 'whatsapp':
          data = await actor.getAllWhatsAppLogs().catch(() => []);
          break;
        case 'services':
          data = await actor.getAllServices().catch(() => []);
          break;
        case 'projects':
          data = await actor.getAllProjects().catch(() => []);
          break;
        default:
          data = [];
      }

      const ts = getTimestamp();
      if (format === 'JSON') {
        const content = JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
        downloadFile(content, `${moduleId}-export-${ts}.json`, 'application/json');
      } else {
        if (data.length === 0) {
          toast.info('No data to export');
          return;
        }
        const headers = Object.keys(data[0] as object);
        const rows = (data as Record<string, unknown>[]).map(row =>
          headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            if (typeof val === 'bigint') return val.toString();
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val);
          }).join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        downloadFile(csv, `${moduleId}-export-${ts}.csv`, 'text/csv');
      }
      toast.success(`${moduleId} exported as ${format}`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setLoadingExport(null);
    }
  };

  const handleFullExport = async () => {
    if (!actor) {
      toast.error('Backend not available');
      return;
    }
    setLoadingExport('full');
    try {
      const [leads, invoices, payments, whatsapp, services, projects] = await Promise.all([
        actor.getAllLeads().catch(() => []),
        actor.getAllInvoices().catch(() => []),
        actor.getAllPaymentLogs().catch(() => []),
        actor.getAllWhatsAppLogs().catch(() => []),
        actor.getAllServices().catch(() => []),
        actor.getAllProjects().catch(() => []),
      ]);
      const fullData = { leads, invoices, payments, whatsapp, services, projects };
      const content = JSON.stringify(fullData, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
      downloadFile(content, `full-platform-export-${getTimestamp()}.json`, 'application/json');
      toast.success('Full platform export complete');
    } catch (err) {
      toast.error('Full export failed');
    } finally {
      setLoadingExport(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Download className="w-6 h-6" /> Data Export Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Export platform data in CSV or JSON format</p>
        </div>
        <Button
          onClick={handleFullExport}
          disabled={loadingExport === 'full'}
          className="gap-2"
        >
          {loadingExport === 'full' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Full Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXPORT_MODULES.map((mod) => (
          <Card key={mod.id} className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {mod.label}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{mod.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {mod.formats.map((fmt) => {
                  const key = `${mod.id}-${fmt}`;
                  const isLoading = loadingExport === key;
                  return (
                    <Button
                      key={fmt}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(mod.id, fmt)}
                      disabled={!!loadingExport}
                      className="gap-1.5 text-xs"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      {fmt}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
