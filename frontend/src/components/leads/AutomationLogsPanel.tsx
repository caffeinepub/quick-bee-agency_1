import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AutomationLog } from '../../utils/exportUtils';
import { exportAutomationLogsToCSV } from '../../utils/exportUtils';

interface AutomationLogsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: bigint | null;
  logs: AutomationLog[];
}

export default function AutomationLogsPanel({ open, onOpenChange, leadId, logs }: AutomationLogsPanelProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = logs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.eventName.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.payloadSummary.toLowerCase().includes(q) ||
        l.responseSummary.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, search]);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('en-IN');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Automation Logs
            {leadId != null && <Badge variant="outline" className="text-xs">Lead #{String(leadId)}</Badge>}
          </SheetTitle>
          <SheetDescription>
            {leadId != null ? `Events for lead #${String(leadId)}` : 'All automation events across all leads'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event name, URL, or payload..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAutomationLogsToCSV(filtered)}
            className="gap-2 h-9 shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No automation logs found</p>
            <p className="text-xs mt-1">Events will appear here when integrations are triggered</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log, idx) => (
                  <TableRow key={`${log.eventName}-${log.timestamp}-${idx}`}>
                    <TableCell className="font-medium text-sm max-w-[160px] truncate">{log.eventName}</TableCell>
                    <TableCell>
                      {log.isError ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="h-3 w-3" />Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-3 w-3" />Success
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.statusCode ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.timestamp)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Showing {filtered.length} of {logs.length} total events
        </div>
      </SheetContent>
    </Sheet>
  );
}
