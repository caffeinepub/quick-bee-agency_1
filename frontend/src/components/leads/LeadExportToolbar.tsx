import React from 'react';
import { Lead } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { exportLeadsToCSV, exportLeadsToPDF } from '../../utils/exportUtils';
import { toast } from 'sonner';

interface Props {
  leads: Lead[];
  selectedLeads?: Lead[];
}

export default function LeadExportToolbar({ leads, selectedLeads = [] }: Props) {
  const handleExportAll = () => {
    exportLeadsToCSV(leads);
    toast.success('All leads exported as CSV');
  };

  const handleExportSelected = () => {
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }
    exportLeadsToCSV(selectedLeads);
    toast.success(`${selectedLeads.length} leads exported as CSV`);
  };

  const handlePDFReport = () => {
    exportLeadsToPDF(leads);
    toast.success('PDF report generated');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="sm"
        variant="outline"
        onClick={handleExportAll}
        className="h-8 px-3 text-xs border-border hover:border-primary/50"
      >
        <FileDown className="w-3.5 h-3.5 mr-1.5" />
        Export All CSV
      </Button>
      {selectedLeads.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportSelected}
          className="h-8 px-3 text-xs border-border hover:border-primary/50"
        >
          <FileDown className="w-3.5 h-3.5 mr-1.5" />
          Export Selected ({selectedLeads.length})
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={handlePDFReport}
        className="h-8 px-3 text-xs border-border hover:border-primary/50"
      >
        <FileText className="w-3.5 h-3.5 mr-1.5" />
        PDF Report
      </Button>
    </div>
  );
}
