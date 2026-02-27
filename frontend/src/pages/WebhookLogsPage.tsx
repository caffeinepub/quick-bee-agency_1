import React, { useState } from 'react';
import { useWebhookLog, WebhookLogEntry } from '../contexts/WebhookLogContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString();
}

function StatusBadge({ entry }: { entry: WebhookLogEntry }) {
  if (entry.isSuccess) {
    return <Badge className="bg-success/20 text-success border-success/30 text-xs">✓ {entry.statusCode ?? 'OK'}</Badge>;
  }
  return (
    <Badge variant="destructive" className="text-xs">
      ✗ {entry.statusCode ?? 'Error'}
    </Badge>
  );
}

export default function WebhookLogsPage() {
  const { logs, clearLogs, getFilteredLogs } = useWebhookLog();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [eventFilter, setEventFilter] = useState('all');

  const uniqueEvents = Array.from(new Set(logs.map(l => l.eventName)));

  const filtered = getFilteredLogs({
    eventType: eventFilter !== 'all' ? eventFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }).filter(log =>
    !search ||
    log.eventName.toLowerCase().includes(search.toLowerCase()) ||
    log.url.toLowerCase().includes(search.toLowerCase()) ||
    log.payloadSummary.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = () => {
    clearLogs();
    toast.success('Webhook logs cleared.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Webhook Logs</h1>
            <p className="text-muted-foreground text-sm">Monitor all outgoing webhook and API requests in real time.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{logs.length} total entries</Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2" disabled={logs.length === 0}>
                <Trash2 className="h-4 w-4" />
                Clear Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all {logs.length} webhook log entries. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-glass">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEvents.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'success' | 'error')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Request Log</CardTitle>
          <CardDescription>Showing {filtered.length} of {logs.length} entries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Activity className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">No webhook logs yet</p>
              <p className="text-sm">Logs will appear here when you use AI tools or automation triggers.</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(log => (
                    <TableRow key={log.id} className={log.isSuccess ? '' : 'bg-destructive/5'}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">{log.eventName}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-xs font-mono truncate block text-muted-foreground" title={log.url}>
                          {log.url}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge entry={log} />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-xs font-mono truncate block text-muted-foreground" title={log.payloadSummary}>
                          {log.payloadSummary.slice(0, 80)}...
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className={`text-xs font-mono truncate block ${log.isSuccess ? 'text-success' : 'text-destructive'}`} title={log.responseSummary}>
                          {log.responseSummary.slice(0, 80)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
