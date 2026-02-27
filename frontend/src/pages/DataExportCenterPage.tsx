import React, { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileDown, Database, Loader2, CheckCircle } from 'lucide-react';
import { exportToJSON, exportObjectsToCSV } from '../utils/exportUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExportModule {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MODULES: ExportModule[] = [
  { id: 'services', label: 'Services', description: 'All service catalog entries', icon: <Database className="w-4 h-4" /> },
  { id: 'managed-services', label: 'Managed Services', description: 'User-created managed services', icon: <Database className="w-4 h-4" /> },
  { id: 'recommendations', label: 'Recommendations', description: 'AI service recommendations', icon: <Database className="w-4 h-4" /> },
];

export default function DataExportCenterPage() {
  const { actor } = useActor();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());

  const handleExport = async (moduleId: string, format: 'csv' | 'json') => {
    if (!actor) { toast.error('Not connected to backend'); return; }
    setExporting(`${moduleId}-${format}`);
    try {
      let data: unknown[] = [];

      if (moduleId === 'services') {
        data = await actor.getAllServices().catch(() => []);
      } else if (moduleId === 'managed-services') {
        data = await actor.getManagedServices().catch(() => []);
      } else if (moduleId === 'recommendations') {
        data = await actor.getAllRecommendations().catch(() => []);
      }

      const filename = `${moduleId}-${Date.now()}`;
      if (format === 'json') {
        exportToJSON(data, `${filename}.json`);
      } else {
        exportObjectsToCSV(
          (data as Record<string, unknown>[]).map(item => {
            const flat: Record<string, unknown> = {};
            Object.entries(item).forEach(([k, v]) => {
              flat[k] = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
            });
            return flat;
          }),
          `${filename}.csv`
        );
      }
      setExported(prev => new Set([...prev, moduleId]));
      toast.success(`${moduleId} exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(`Failed to export ${moduleId}`);
    } finally {
      setExporting(null);
    }
  };

  const handleFullExport = async () => {
    if (!actor) { toast.error('Not connected to backend'); return; }
    setExporting('full');
    try {
      const [services, managedServices, recommendations] = await Promise.all([
        actor.getAllServices().catch(() => []),
        actor.getManagedServices().catch(() => []),
        actor.getAllRecommendations().catch(() => []),
      ]);

      exportToJSON({
        exportedAt: new Date().toISOString(),
        services,
        managedServices,
        recommendations,
      }, `full-export-${Date.now()}.json`);

      toast.success('Full platform export complete');
    } catch {
      toast.error('Failed to export platform data');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading text-foreground">Data Export Center</h1>
        </div>

        {/* Full Export */}
        <div className="card-glass rounded-xl p-5 mb-6 border-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">Full Platform Export</h2>
              <p className="text-sm text-muted-foreground">Export all available data as a single JSON file.</p>
            </div>
            <Button
              onClick={handleFullExport}
              disabled={exporting === 'full'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-shrink-0"
            >
              {exporting === 'full' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exporting...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Export All</>
              )}
            </Button>
          </div>
        </div>

        {/* Per-Module Exports */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Export by Module
        </h2>
        <div className="space-y-3">
          {MODULES.map(mod => {
            const isExporting = exporting?.startsWith(mod.id);
            const isDone = exported.has(mod.id);
            return (
              <div key={mod.id} className="card-glass rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {mod.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{mod.label}</span>
                      {isDone && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(mod.id, 'csv')}
                    disabled={!!exporting}
                    className="h-7 px-2.5 text-xs border-border hover:border-primary/50"
                  >
                    {exporting === `${mod.id}-csv` ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <><FileDown className="w-3 h-3 mr-1" />CSV</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(mod.id, 'json')}
                    disabled={!!exporting}
                    className="h-7 px-2.5 text-xs border-border hover:border-primary/50"
                  >
                    {exporting === `${mod.id}-json` ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <><FileDown className="w-3 h-3 mr-1" />JSON</>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
