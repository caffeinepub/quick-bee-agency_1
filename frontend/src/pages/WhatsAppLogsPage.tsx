import React, { useState } from 'react';
import { WhatsAppMessageLog } from '../hooks/useQueries';
import { useGetAllWhatsAppLogs } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, FileDown, CheckCircle, XCircle, Clock } from 'lucide-react';
import { exportWhatsAppLogsToCSV, exportToJSON } from '../utils/exportUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function statusIcon(status: string) {
  if (status === 'delivered' || status === 'read') return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
  if (status === 'failed') return <XCircle className="w-3.5 h-3.5 text-red-400" />;
  return <Clock className="w-3.5 h-3.5 text-amber-400" />;
}

function statusColor(status: string): string {
  if (status === 'delivered' || status === 'read') return 'text-green-400 bg-green-400/10 border-green-400/30';
  if (status === 'failed') return 'text-red-400 bg-red-400/10 border-red-400/30';
  return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
}

export default function WhatsAppLogsPage() {
  const { data: logs = [], isLoading } = useGetAllWhatsAppLogs();
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.recipientPhone.includes(search) ||
    l.messageType.toLowerCase().includes(search.toLowerCase()) ||
    l.deliveryStatus.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    exportWhatsAppLogsToCSV(filtered);
    toast.success('Logs exported as CSV');
  };

  const handleExportJSON = () => {
    exportToJSON(filtered, `whatsapp-logs-${Date.now()}.json`);
    toast.success('Logs exported as JSON');
  };

  const stats = {
    total: logs.length,
    delivered: logs.filter(l => l.deliveryStatus === 'delivered' || l.deliveryStatus === 'read').length,
    failed: logs.filter(l => l.deliveryStatus === 'failed').length,
    pending: logs.filter(l => l.deliveryStatus === 'pending' || l.deliveryStatus === 'sent').length,
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold font-heading text-foreground">WhatsApp Logs</h1>
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Delivered', value: stats.delivered, color: 'text-green-400' },
            { label: 'Failed', value: stats.failed, color: 'text-red-400' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="card-glass rounded-xl p-3 text-center">
              <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by phone, type, or status..."
            className="pl-9 bg-input border-border text-foreground"
          />
        </div>

        {/* Logs */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card-glass rounded-xl p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Logs Found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try a different search term.' : 'WhatsApp message logs will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((log, i) => (
              <div key={i} className="card-glass rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {statusIcon(log.deliveryStatus)}
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.recipientPhone}</p>
                    <p className="text-xs text-muted-foreground">{log.messageType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className={cn('text-xs', statusColor(log.deliveryStatus))}>
                    {log.deliveryStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(Number(log.sentAt) / 1_000_000).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
