import React, { useState, useMemo } from 'react';
import { useWebhookLog } from '../contexts/WebhookLogContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Webhook, Trash2, Search, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

export default function WebhookLogsPage() {
  const { logs, clearLogs } = useWebhookLog();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [eventFilter, setEventFilter] = useState('all');

  const eventTypes = useMemo(() => {
    const types = new Set(logs.map(l => l.eventName));
    return ['all', ...Array.from(types)];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (statusFilter === 'success' && log.isError) return false;
      if (statusFilter === 'error' && !log.isError) return false;
      if (eventFilter !== 'all' && log.eventName !== eventFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          log.eventName.toLowerCase().includes(q) ||
          log.url.toLowerCase().includes(q) ||
          log.payloadSummary.toLowerCase().includes(q) ||
          log.responseSummary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, statusFilter, eventFilter, search]);

  const successCount = logs.filter(l => !l.isError).length;
  const errorCount = logs.filter(l => l.isError).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <Webhook className="w-8 h-8 text-primary" />
              Webhook Logs
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor all API calls and webhook events
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                disabled={logs.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Clear All Logs?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will permanently delete all {logs.length} log entries. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearLogs}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border stat-card-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{logs.length}</p>
                <p className="text-xs text-muted-foreground">Total Logs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border stat-card-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{successCount}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border stat-card-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{errorCount}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-input border-border text-foreground"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-36 bg-input border-border text-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-48 bg-input border-border text-foreground">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {eventTypes.map(t => (
                    <SelectItem key={t} value={t}>{t === 'all' ? 'All Events' : t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge className="bg-muted text-muted-foreground border-border">
                {filtered.length} results
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-lg">Log Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No logs found</p>
                <p className="text-sm mt-1">
                  {logs.length === 0
                    ? 'Webhook events will appear here when triggered'
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-border">
                  {filtered.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 hover:bg-muted/30 transition-colors ${
                        log.isError ? 'border-l-2 border-l-destructive' : 'border-l-2 border-l-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {log.isError ? (
                            <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                          <Badge
                            className={log.isError
                              ? 'bg-red-500/20 text-red-400 border-red-500/30 text-xs'
                              : 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
                            }
                          >
                            {log.eventName}
                          </Badge>
                          {log.statusCode !== null && (
                            <Badge
                              className={`text-xs ${
                                log.statusCode >= 200 && log.statusCode < 300
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}
                            >
                              {log.statusCode}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        <span className="text-foreground/60">URL:</span> {log.url}
                      </p>
                      {log.payloadSummary && (
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          <span className="text-foreground/60">Payload:</span> {log.payloadSummary}
                        </p>
                      )}
                      {log.responseSummary && (
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="text-foreground/60">Response:</span> {log.responseSummary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
          <p>© {new Date().getFullYear()} QuickBee Agency. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
