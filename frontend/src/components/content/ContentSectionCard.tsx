import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ContentSectionCardProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

export function ContentSectionCard({ title, content, icon }: ContentSectionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(`${title} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="card-glass border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? (
              <><Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied</>
            ) : (
              <><Copy className="w-3 h-3 mr-1" /> Copy</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto bg-muted/20 rounded-md p-3 font-mono text-xs text-foreground/80">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
