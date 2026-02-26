import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { useSaveSalesSystemConfig, useGetSalesSystemConfig } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { SalesSystemConfig } from '../../backend';

interface SalesSystemConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemLabel: string;
  config: { apiEndpoint: string; apiKey: string };
  onSave?: (updated: { apiEndpoint: string; apiKey: string }) => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

const ANON_PRINCIPAL = Principal.anonymous();

export default function SalesSystemConfigDialog({
  open,
  onOpenChange,
  systemLabel,
  config,
  onSave,
}: SalesSystemConfigDialogProps) {
  const { identity } = useInternetIdentity();
  const userId: Principal = identity?.getPrincipal() ?? ANON_PRINCIPAL;

  const { data: savedConfig } = useGetSalesSystemConfig(userId);
  const saveSalesSystemConfig = useSaveSalesSystemConfig();

  const [apiEndpoint, setApiEndpoint] = useState(config.apiEndpoint || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');

  useEffect(() => {
    if (open) {
      setApiEndpoint(savedConfig?.apiEndpoint || config.apiEndpoint || '');
      setApiKey(savedConfig?.apiKey || config.apiKey || '');
      setConnectionStatus('idle');
    }
  }, [open, savedConfig, config.apiEndpoint, config.apiKey]);

  const handleTestConnection = async () => {
    if (!apiEndpoint) {
      toast.error('Please enter an API endpoint first');
      return;
    }
    setConnectionStatus('testing');
    try {
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      setConnectionStatus(response.ok ? 'success' : 'error');
      if (response.ok) {
        toast.success('Connection successful!');
      } else {
        toast.error(`Connection failed: HTTP ${response.status}`);
      }
    } catch {
      setConnectionStatus('error');
      toast.error('Connection failed. Check the endpoint URL.');
    }
  };

  const handleSave = async () => {
    const fullConfig: SalesSystemConfig = {
      systemName: systemLabel,
      description: `Configuration for ${systemLabel}`,
      enabled: true,
      apiEndpoint,
      apiKey,
      systemSettings: savedConfig?.systemSettings || '',
    };

    try {
      await saveSalesSystemConfig.mutateAsync(fullConfig);
      toast.success('Configuration saved successfully');
      onSave?.({ apiEndpoint, apiKey });
      onOpenChange(false);
    } catch {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            Configure {systemLabel}
          </DialogTitle>
          <DialogDescription>
            Enter your API credentials to connect the AI sales system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              connectionStatus === 'testing' ? 'bg-muted text-muted-foreground' :
              connectionStatus === 'success' ? 'bg-primary/10 text-primary border border-primary/20' :
              'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              {connectionStatus === 'testing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : connectionStatus === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {connectionStatus === 'testing' ? 'Testing connection...' :
               connectionStatus === 'success' ? 'Connection successful' :
               'Connection failed'}
            </div>
          )}

          {/* API Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="api-endpoint">API Endpoint</Label>
            <Input
              id="api-endpoint"
              placeholder="https://api.example.com/endpoint"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge
              variant="outline"
              className={apiEndpoint && apiKey
                ? 'border-primary text-primary bg-primary/10'
                : 'border-muted-foreground text-muted-foreground'
              }
            >
              {apiEndpoint && apiKey ? 'Configured' : 'Not configured'}
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={connectionStatus === 'testing' || !apiEndpoint}
            className="gap-2"
          >
            {connectionStatus === 'testing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            Test Connection
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveSalesSystemConfig.isPending}
            className="gap-2"
          >
            {saveSalesSystemConfig.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
