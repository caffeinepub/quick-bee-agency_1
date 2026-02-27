import React, { useState } from 'react';
import { AlertTriangle, Settings, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAIConfig } from '@/contexts/AIConfigContext';

interface AICredentialBannerProps {
  onOpenSettings?: () => void;
}

export default function AICredentialBanner({ onOpenSettings }: AICredentialBannerProps) {
  const { isConfigured } = useAIConfig();
  const [dismissed, setDismissed] = useState(false);

  if (isConfigured() || dismissed) return null;

  return (
    <Alert variant="destructive" className="mb-6 relative border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
      <AlertTriangle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
      <AlertTitle className="text-amber-700 dark:text-amber-400">AI Credentials Not Configured</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-amber-600 dark:text-amber-500">
          Please configure your AI API Endpoint and API Key to use this tool.
        </span>
        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500"
              onClick={onOpenSettings}
            >
              <Settings className="h-3 w-3 mr-1" />
              Configure Now
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-600 hover:bg-amber-500/20 h-7 w-7 p-0"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
