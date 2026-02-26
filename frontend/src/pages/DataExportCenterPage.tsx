import { useState } from 'react';
import { Download, FileText, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActor } from '../hooks/useActor';
import { useIsCallerAdmin } from '../hooks/useQueries';
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
  { id: 'projects', label: 'Projects Data', description: 'All client projects and statuses', formats: ['CSV', 'JSON'] },
  { id: 'crm', label: 'CRM Activities', description: 'All CRM pipeline activities', formats: ['CSV', 'JSON'] },
];

export default function DataExportCenterPage() {
  const { actor } = useActor();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingModule, setExportingModule] = useState<string | null>(null);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold font-display text-foreground">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Admin access required for data export.</p>
      </div>
    );
  }

  const handleModuleExport = async (moduleId: string, format: string) => {
    if (!actor) { toast.error('Not authenticated'); return; }
    setExportingModule(`${moduleId}-${format}`);
    try {
      const ts = getTimestamp();
      let data: unknown[] = [];
      let filename = '';

      switch (moduleId) {
        case 'leads': data = await actor.getAllLeads(); filename = `leads_${ts}`; break;
        case 'invoices': data = await actor.getAllInvoices(); filename = `invoices_${ts}`; break;
        case 'payments': data = await actor.getAllPaymentLogs(); filename = `payment_logs_${ts}`; break;
        case 'whatsapp': data = await actor.getAllWhatsAppLogs(); filename = `whatsapp_logs_${ts}`; break;
        case 'services': data = await actor.getAllServices(); filename = `services_${ts}`; break;
        case 'projects': data = await actor.getAllProjects(); filename = `projects_${ts}`; break;
        case 'crm': data = await actor.getAllCRMActivities(); filename = `crm_activities_${ts}`; break;
        default: break;
      }

      if (format === 'JSON') {
        const content = JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
        downloadFile(content, `${filename}.json`, 'application/json');
      } else {
        if (data.length === 0) {
          toast.info('No data to export');
          return;
        }
        const keys = Object.keys(data[0] as object);
        const rows = [keys.join(',')];
        data.forEach((item: unknown) => {
          const row = keys.map(k => {
            const val = (item as Record<string, unknown>)[k];
            return typeof val === 'bigint' ? val.toString() : String(val ?? '');
          });
          rows.push(row.join(','));
        });
        downloadFile(rows.join('\n'), `${filename}.csv`, 'text/csv');
      }
      toast.success(`${moduleId} exported as ${format}`);
    } catch (err: unknown) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExportingModule(null);
    }
  };

  const handleExportAll = async () => {
    if (!actor) { toast.error('Not authenticated'); return; }
    setExportingAll(true);
    try {
      const [leads, invoices, paymentLogs, whatsappLogs, services, projects, crmActivities] = await Promise.allSettled([
        actor.getAllLeads(),
        actor.getAllInvoices(),
        actor.getAllPaymentLogs(),
        actor.getAllWhatsAppLogs(),
        actor.getAllServices(),
        actor.getAllProjects(),
        actor.getAllCRMActivities(),
      ]);

      const allData = {
        leads: leads.status === 'fulfilled' ? leads.value : [],
        invoices: invoices.status === 'fulfilled' ? invoices.value : [],
        paymentLogs: paymentLogs.status === 'fulfilled' ? paymentLogs.value : [],
        whatsappLogs: whatsappLogs.status === 'fulfilled' ? whatsappLogs.value : [],
        services: services.status === 'fulfilled' ? services.value : [],
        projects: projects.status === 'fulfilled' ? projects.value : [],
        crmActivities: crmActivities.status === 'fulfilled' ? crmActivities.value : [],
        exportedAt: new Date().toISOString(),
      };

      const content = JSON.stringify(allData, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
      downloadFile(content, `quickbee_full_export_${getTimestamp()}.json`, 'application/json');
      toast.success('Full platform export complete');
    } catch {
      toast.error('Export failed');
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Data Export Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Export platform data in various formats</p>
        </div>
        <Button onClick={handleExportAll} disabled={exportingAll} className="gap-2">
          {exportingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORT_MODULES.map((mod) => (
          <Card key={mod.id} className="glass border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {mod.label}
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">{mod.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {mod.formats.map((fmt) => {
                  const key = `${mod.id}-${fmt}`;
                  const isExporting = exportingModule === key;
                  return (
                    <Button
                      key={fmt}
                      size="sm"
                      variant="outline"
                      disabled={isExporting || !!exportingModule}
                      onClick={() => handleModuleExport(mod.id, fmt)}
                      className="gap-1 text-xs"
                    >
                      {isExporting ? (
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
