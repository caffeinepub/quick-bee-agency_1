import type { Lead, Invoice, WhatsAppMessageLog } from '../backend';

export interface AutomationLog {
  id: string;
  timestamp: number;
  eventName: string;
  url: string;
  payloadSummary: string;
  statusCode: number | null;
  responseSummary: string;
  isError: boolean;
}

export function computeQualificationTier(score: number): string {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'Lukewarm';
  return 'Cold';
}

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportLeadsToCSV(leads: Lead[]): void {
  const headers = [
    'ID', 'Name', 'Email', 'Phone', 'Channel', 'Micro Niche',
    'Status', 'Qualification Score', 'Budget Range', 'Urgency Level',
    'Company Size', 'Decision Maker', 'Created At',
  ];

  const rows = leads.map(lead => [
    escapeCSV(Number(lead.id)),
    escapeCSV(lead.name),
    escapeCSV(lead.email),
    escapeCSV(lead.phone ?? ''),
    escapeCSV(lead.channel),
    escapeCSV(lead.microNiche),
    escapeCSV(lead.status),
    escapeCSV(Number(lead.qualificationScore)),
    escapeCSV(lead.budgetRange !== undefined && lead.budgetRange !== null ? Number(lead.budgetRange) : ''),
    escapeCSV(lead.urgencyLevel !== undefined && lead.urgencyLevel !== null ? Number(lead.urgencyLevel) : ''),
    escapeCSV(lead.companySize ?? ''),
    escapeCSV(lead.decisionMakerStatus !== undefined && lead.decisionMakerStatus !== null ? String(lead.decisionMakerStatus) : ''),
    escapeCSV(new Date(Number(lead.createdAt) / 1_000_000).toISOString()),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(csv, `leads_export_${Date.now()}.csv`);
}

export function exportSelectedLeadsToCSV(leads: Lead[]): void {
  exportLeadsToCSV(leads);
}

export function exportLeadsToPDF(leads: Lead[]): void {
  const win = window.open('', '_blank');
  if (!win) return;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Leads Export</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f5a623; color: #000; }
        tr:nth-child(even) { background: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Leads Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Channel</th><th>Status</th><th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(l => `
            <tr>
              <td>${l.name}</td>
              <td>${l.email}</td>
              <td>${l.channel}</td>
              <td>${l.status}</td>
              <td>${Number(l.qualificationScore)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  win.document.write(html);
  win.document.close();
  win.print();
}

export function exportWhatsAppLogsToCSV(logs: WhatsAppMessageLog[]): void {
  const headers = ['Recipient Phone', 'Message Type', 'Delivery Status', 'Sent At'];
  const rows = logs.map(log => [
    escapeCSV(log.recipientPhone),
    escapeCSV(log.messageType),
    escapeCSV(log.deliveryStatus),
    escapeCSV(new Date(Number(log.sentAt) / 1_000_000).toISOString()),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(csv, `whatsapp_logs_${Date.now()}.csv`);
}

export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const headers = ['Invoice ID', 'Client ID', 'Service Breakdown', 'GST Amount', 'Total Paid', 'Created At'];
  const rows = invoices.map(inv => [
    escapeCSV(inv.invoiceId),
    escapeCSV(inv.clientId.toString()),
    escapeCSV(inv.serviceBreakdown),
    escapeCSV(Number(inv.gstAmount)),
    escapeCSV(Number(inv.totalPaid)),
    escapeCSV(new Date(Number(inv.createdAt) / 1_000_000).toISOString()),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(csv, `invoices_export_${Date.now()}.csv`);
}

export function exportInvoiceToPDF(invoice: Invoice): void {
  const win = window.open('', '_blank');
  if (!win) return;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceId}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .invoice-title { font-size: 32px; font-weight: bold; color: #f5a623; }
        .details { margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 20px; font-weight: bold; color: #f5a623; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="invoice-title">INVOICE</div>
        <div>
          <strong>Invoice ID:</strong> ${invoice.invoiceId}<br/>
          <strong>Date:</strong> ${new Date(Number(invoice.createdAt) / 1_000_000).toLocaleDateString()}
        </div>
      </div>
      <div class="details">
        <div class="row"><span>Service Breakdown</span><span>${invoice.serviceBreakdown}</span></div>
        <div class="row"><span>GST Amount</span><span>₹${Number(invoice.gstAmount).toLocaleString('en-IN')}</span></div>
        <div class="row total"><span>Total Paid</span><span>₹${Number(invoice.totalPaid).toLocaleString('en-IN')}</span></div>
      </div>
    </body>
    </html>
  `;
  win.document.write(html);
  win.document.close();
  win.print();
}

export function exportAutomationLogsToCSV(logs: AutomationLog[]): void {
  const headers = ['ID', 'Timestamp', 'Event Name', 'URL', 'Payload Summary', 'Status Code', 'Response Summary', 'Is Error'];
  const rows = logs.map(log => [
    escapeCSV(log.id),
    escapeCSV(new Date(log.timestamp).toISOString()),
    escapeCSV(log.eventName),
    escapeCSV(log.url),
    escapeCSV(log.payloadSummary),
    escapeCSV(log.statusCode ?? ''),
    escapeCSV(log.responseSummary),
    escapeCSV(String(log.isError)),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(csv, `automation_logs_${Date.now()}.csv`);
}

export function exportToJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadText(json, filename, 'application/json');
}

export function exportToText(content: string, filename: string): void {
  downloadText(content, filename);
}

export function exportObjectsToCSV(objects: Record<string, unknown>[], filename: string): void {
  if (objects.length === 0) return;
  const headers = Object.keys(objects[0]);
  const rows = objects.map(obj => headers.map(h => escapeCSV(String(obj[h] ?? ''))));
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(csv, filename);
}
