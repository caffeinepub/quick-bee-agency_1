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
import { useUpdateSalesSystemConfig, useGetSalesSystemConfig } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { SalesSystemConfig } from '../../backend';

interface SalesSystemConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemLabel: string;
  config: { apiEndpoint: string; apiKey: string };
  onSave?: (updated: { apiEndpoint: string; apiKey: string }) => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export default function SalesSystemConfigDialog({
  open,
  onOpenChange,
  systemLabel,
  config,
  onSave,
}: SalesSystemConfigDialogProps) {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal().toString();

  const { data: savedConfig } = useGetSalesSystemConfig(userId);
  const updateConfig = useUpdateSalesSystemConfig();

  const [apiEndpoint, setApiEndpoint] = useState(config.apiEndpoint || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');

  // Sync with saved config when dialog opens
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
        headers: {
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok || response.status === 405) {
        // 405 Method Not Allowed still means the endpoint exists
        setConnectionStatus('success');
        toast.success('Connection successful!');
      } else {
        setConnectionStatus('error');
        toast.error(`Connection failed: HTTP ${response.status}`);
      }
    } catch {
      setConnectionStatus('error');
      toast.error('Connection failed: Could not reach the endpoint');
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('You must be logged in to save configuration');
      return;
    }

    const fullConfig: SalesSystemConfig = {
      systemName: systemLabel,
      description: `Configuration for ${systemLabel}`,
      enabled: true,
      apiEndpoint,
      apiKey,
      systemSettings: savedConfig?.systemSettings || '',
    };

    try {
      await updateConfig.mutateAsync(fullConfig);
      toast.success('Configuration saved successfully');
      onSave?.({ apiEndpoint, apiKey });
      onOpenChange(false);
    } catch {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Wifi className="h-5 w-5 text-primary" />
            Configure {systemLabel}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your API credentials to connect the AI sales system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* API Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="api-endpoint" className="text-foreground">
              API Endpoint URL
            </Label>
            <Input
              id="api-endpoint"
              type="url"
              placeholder="https://your-api.example.com/endpoint"
              value={apiEndpoint}
              onChange={(e) => {
                setApiEndpoint(e.target.value);
                setConnectionStatus('idle');
              }}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-foreground">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                connectionStatus === 'testing'
                  ? 'bg-muted/50 text-muted-foreground'
                  : connectionStatus === 'success'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {connectionStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin" />}
              {connectionStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
              {connectionStatus === 'error' && <XCircle className="h-4 w-4" />}
              <span>
                {connectionStatus === 'testing'
                  ? 'Testing connection...'
                  : connectionStatus === 'success'
                  ? 'Connection successful'
                  : 'Connection failed'}
              </span>
            </div>
          )}

          {/* Test Connection Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={connectionStatus === 'testing' || !apiEndpoint}
            className="w-full border-border hover:border-primary hover:text-primary"
          >
            {connectionStatus === 'testing' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateConfig.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {updateConfig.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
