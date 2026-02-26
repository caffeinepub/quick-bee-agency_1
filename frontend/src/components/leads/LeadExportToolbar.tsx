import React from 'react';
import { Button } from '@/components/ui/button';
import { Lead } from '../../backend';
import { exportLeadsToCSV, exportLeadsToPDF } from '../../utils/exportUtils';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

interface LeadExportToolbarProps {
  leads: Lead[];
  selectedIds: Set<bigint>;
}

export default function LeadExportToolbar({ leads, selectedIds }: LeadExportToolbarProps) {
  const selectedLeads = leads.filter(l => selectedIds.has(l.id));
  const hasSelection = selectedIds.size > 0;

  const timestamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportLeadsToCSV(leads, `leads-all-${timestamp}.csv`)}
        className="gap-2 h-8 text-xs"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Export All CSV
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => exportLeadsToCSV(selectedLeads, `leads-selected-${timestamp}.csv`)}
        disabled={!hasSelection}
        className="gap-2 h-8 text-xs"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Export Selected ({selectedIds.size})
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => exportLeadsToPDF(leads, `leads-report-${timestamp}.pdf`)}
        className="gap-2 h-8 text-xs"
      >
        <FileText className="h-3.5 w-3.5" />
        Download PDF Report
      </Button>
    </div>
  );
}
