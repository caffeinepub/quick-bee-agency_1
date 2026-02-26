import { Lead, Invoice } from '../backend';

export interface AutomationLog {
  id: bigint;
  leadId: bigint;
  eventType: string;
  status: string;
  timestamp: bigint;
}

export function computeQualificationTier(score: number): 'Cold' | 'Warm' | 'Hot' | 'Qualified' {
  if (score >= 75) return 'Qualified';
  if (score >= 50) return 'Hot';
  if (score >= 25) return 'Warm';
  return 'Cold';
}

function formatDate(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  return new Date(ms).toLocaleString();
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface LeadExportRow {
  Name: string;
  Email: string;
  Phone: string;
  Status: string;
  Source: string;
  'Assigned Agent': string;
  'Quote Base': string;
  'GST Rate': string;
  'Quote Total': string;
  Score: string;
  'Qualification Tier': string;
  'Created Date': string;
}

export function formatLeadForExport(lead: Lead & { quoteBase?: number; gstRate?: number; quoteTotal?: number }): LeadExportRow {
  const score = Number(lead.qualificationScore);
  const tier = computeQualificationTier(score);
  return {
    Name: lead.name,
    Email: lead.email,
    Phone: lead.phone ?? '',
    Status: lead.status,
    Source: lead.channel,
    'Assigned Agent': lead.assignedTo ? lead.assignedTo.toString() : '',
    'Quote Base': lead.quoteBase !== undefined ? formatCurrency(lead.quoteBase) : '',
    'GST Rate': lead.gstRate !== undefined ? `${lead.gstRate}%` : '',
    'Quote Total': lead.quoteTotal !== undefined ? formatCurrency(lead.quoteTotal) : '',
    Score: String(score),
    'Qualification Tier': tier,
    'Created Date': formatDate(lead.createdAt),
  };
}

function arrayToCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row => row.map(escapeCSV).join(','));
  return [headerLine, ...dataLines].join('\n');
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLeadsToCSV(leads: (Lead & { quoteBase?: number; gstRate?: number; quoteTotal?: number })[], filename: string = 'leads.csv'): void {
  const headers = ['Name', 'Email', 'Phone', 'Status', 'Source', 'Assigned Agent', 'Quote Base', 'GST Rate', 'Quote Total', 'Score', 'Qualification Tier', 'Created Date'];
  const rows = leads.map(lead => {
    const row = formatLeadForExport(lead);
    return headers.map(h => row[h as keyof LeadExportRow] ?? '');
  });
  const csv = arrayToCSV(headers, rows);
  triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportLeadsToPDF(leads: (Lead & { quoteBase?: number; gstRate?: number; quoteTotal?: number })[], filename: string = 'leads-report.pdf'): void {
  const rows = leads.map(formatLeadForExport);
  const headers = ['Name', 'Email', 'Status', 'Source', 'Score', 'Tier', 'Quote Total', 'Created Date'];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Leads Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #1a1a2e; }
        h1 { color: #1a1a2e; font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1a1a2e; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
        td { padding: 6px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        tr:nth-child(even) { background: #f9fafb; }
        .tier-qualified { color: #16a34a; font-weight: bold; }
        .tier-hot { color: #ea580c; font-weight: bold; }
        .tier-warm { color: #ca8a04; font-weight: bold; }
        .tier-cold { color: #6b7280; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <h1>QuickBee CRM — Leads Report</h1>
      <div class="subtitle">Generated on ${new Date().toLocaleString()} · Total: ${leads.length} leads</div>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${row.Name}</td>
              <td>${row.Email}</td>
              <td>${row.Status}</td>
              <td>${row.Source}</td>
              <td>${row.Score}</td>
              <td class="tier-${row['Qualification Tier'].toLowerCase()}">${row['Qualification Tier']}</td>
              <td>${row['Quote Total']}</td>
              <td>${row['Created Date']}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">QuickBee AI Agency Platform · Built with caffeine.ai</div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}

export function exportInvoicesToCSV(invoices: Invoice[], filename: string = 'invoices.csv'): void {
  const headers = ['Invoice Number', 'Client ID', 'Service Breakdown', 'GST Amount', 'Total Paid', 'Created Date'];
  const rows = invoices.map(inv => [
    inv.invoiceId,
    inv.clientId.toString(),
    inv.serviceBreakdown,
    String(Number(inv.gstAmount)),
    String(Number(inv.totalPaid)),
    formatDate(inv.createdAt),
  ]);
  const csv = arrayToCSV(headers, rows);
  triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportInvoiceToPDF(invoice: Invoice): void {
  const gstAmount = Number(invoice.gstAmount);
  const totalPaid = Number(invoice.totalPaid);
  const baseAmount = totalPaid - gstAmount;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a2e; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .company { font-size: 24px; font-weight: bold; color: #1a1a2e; }
        .invoice-title { font-size: 32px; font-weight: bold; color: #3b82f6; text-align: right; }
        .invoice-meta { text-align: right; font-size: 13px; color: #666; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .client-info { font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #1a1a2e; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 6px 0; font-size: 14px; }
        .total-final { font-size: 18px; font-weight: bold; color: #1a1a2e; border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 4px; }
        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        .paid-stamp { color: #16a34a; border: 3px solid #16a34a; padding: 4px 16px; font-size: 20px; font-weight: bold; display: inline-block; transform: rotate(-15deg); margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company">🐝 QuickBee</div>
          <div style="font-size:13px;color:#666;margin-top:4px;">AI Agency Platform</div>
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-meta"># ${invoice.invoiceId}</div>
          <div class="invoice-meta">Date: ${formatDate(invoice.createdAt)}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Bill To</div>
        <div class="client-info">${invoice.clientId.toString()}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.serviceBreakdown}</td>
            <td style="text-align:right">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color:#666">GST</td>
            <td style="text-align:right;color:#666">₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row total-final">
          <span>Total Paid</span>
          <span>₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div style="text-align:center;margin-top:30px;">
        <div class="paid-stamp">PAID</div>
      </div>

      <div class="footer">
        Thank you for your business! · QuickBee AI Agency Platform · Built with caffeine.ai
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}

export function exportAutomationLogsToCSV(logs: AutomationLog[], filename: string = 'automation-logs.csv'): void {
  const headers = ['Log ID', 'Lead ID', 'Event Type', 'Status', 'Timestamp'];
  const rows = logs.map(log => [
    String(log.id),
    String(log.leadId),
    log.eventType,
    log.status,
    formatDate(log.timestamp),
  ]);
  const csv = arrayToCSV(headers, rows);
  triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
}
