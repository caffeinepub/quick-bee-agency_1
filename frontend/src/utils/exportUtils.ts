import { Lead, Invoice, WhatsAppMessageLog } from '../backend';

// ---- Types ----
export interface AutomationLog {
  id: bigint;
  leadId: bigint;
  eventType: string;
  status: string;
  timestamp: bigint;
}

// ---- Qualification tier helper ----
export function computeQualificationTier(score: number): 'Cold' | 'Warm' | 'Hot' | 'Qualified' {
  if (score >= 75) return 'Qualified';
  if (score >= 50) return 'Hot';
  if (score >= 25) return 'Warm';
  return 'Cold';
}

// ---- CSV helpers ----
function downloadFile(content: string, filename: string, mimeType: string) {
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

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  const headerRow = headers.map(escapeCsvCell).join(',');
  const dataRows = rows.map(row => row.map(escapeCsvCell).join(','));
  return [headerRow, ...dataRows].join('\n');
}

// ---- Leads CSV ----
export function exportLeadsToCSV(leads: Lead[], filename?: string): void {
  if (!leads || leads.length === 0) throw new Error('No data to export');
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Channel', 'Status', 'Score', 'Micro Niche', 'Created At'];
  const rows = leads.map(l => [
    String(l.id),
    l.name,
    l.email,
    l.phone ?? '',
    l.channel,
    l.status,
    String(l.qualificationScore),
    l.microNiche,
    new Date(Number(l.createdAt) / 1_000_000).toLocaleString(),
  ]);
  const csv = buildCsv(headers, rows);
  downloadFile(csv, filename ?? `leads-export-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

// ---- Leads PDF (HTML print) ----
export function exportLeadsToPDF(leads: Lead[], filename?: string): void {
  if (!leads || leads.length === 0) throw new Error('No data to export');
  const rows = leads.map(l => ({
    name: l.name,
    email: l.email,
    status: l.status,
    channel: l.channel,
    score: String(l.qualificationScore),
    tier: computeQualificationTier(Number(l.qualificationScore)),
    createdAt: new Date(Number(l.createdAt) / 1_000_000).toLocaleString(),
  }));

  const html = `
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
        .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <h1>QuickBee CRM — Leads Report</h1>
      <div class="subtitle">Generated on ${new Date().toLocaleString()} · Total: ${leads.length} leads</div>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Status</th><th>Channel</th>
            <th>Score</th><th>Tier</th><th>Created At</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${r.name}</td>
              <td>${r.email}</td>
              <td>${r.status}</td>
              <td>${r.channel}</td>
              <td>${r.score}</td>
              <td>${r.tier}</td>
              <td>${r.createdAt}</td>
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
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}

// ---- WhatsApp Logs CSV ----
export function exportWhatsAppLogsToCSV(logs: WhatsAppMessageLog[], filename?: string): void {
  if (!logs || logs.length === 0) throw new Error('No data to export');
  const headers = ['Recipient Phone', 'Message Type', 'Delivery Status', 'Sent At'];
  const rows = logs.map(l => [
    l.recipientPhone,
    l.messageType,
    l.deliveryStatus,
    new Date(Number(l.sentAt) / 1_000_000).toLocaleString(),
  ]);
  const csv = buildCsv(headers, rows);
  downloadFile(csv, filename ?? `whatsapp-logs-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

// ---- Invoices CSV ----
export function exportInvoicesToCSV(invoices: Invoice[], filename?: string): void {
  if (!invoices || invoices.length === 0) throw new Error('No data to export');
  const headers = ['Invoice ID', 'Client ID', 'Created At', 'Total Paid', 'GST Amount', 'Service Breakdown'];
  const rows = invoices.map(inv => [
    inv.invoiceId,
    inv.clientId.toString(),
    new Date(Number(inv.createdAt) / 1_000_000).toLocaleString(),
    String(inv.totalPaid),
    String(inv.gstAmount),
    inv.serviceBreakdown,
  ]);
  const csv = buildCsv(headers, rows);
  downloadFile(csv, filename ?? `invoices-export-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

// ---- Invoice PDF (HTML print) ----
export function exportInvoiceToPDF(invoice: Invoice): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceId}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1a56db; }
        .meta { margin: 20px 0; }
        .meta p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
        .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; font-size: 0.85em; color: #888; }
      </style>
    </head>
    <body>
      <h1>Invoice</h1>
      <div class="meta">
        <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
        <p><strong>Client ID:</strong> ${invoice.clientId.toString()}</p>
        <p><strong>Date:</strong> ${new Date(Number(invoice.createdAt) / 1_000_000).toLocaleString()}</p>
      </div>
      <table>
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>${invoice.serviceBreakdown}</td><td>₹${invoice.totalPaid}</td></tr>
          <tr><td>GST</td><td>₹${invoice.gstAmount}</td></tr>
        </tbody>
      </table>
      <div class="total">Total Paid: ₹${invoice.totalPaid}</div>
      <div class="footer">Generated by QuickBee Sales System</div>
    </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }
}

// ---- Automation Logs CSV ----
export function exportAutomationLogsToCSV(logs: AutomationLog[], filename?: string): void {
  if (!logs || logs.length === 0) throw new Error('No data to export');
  const headers = ['Log ID', 'Lead ID', 'Event Type', 'Status', 'Timestamp'];
  const rows = logs.map(log => [
    String(log.id),
    String(log.leadId),
    log.eventType,
    log.status,
    new Date(Number(log.timestamp) / 1_000_000).toLocaleString(),
  ]);
  const csv = buildCsv(headers, rows);
  downloadFile(csv, filename ?? `automation-logs-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

// ---- Generic JSON export ----
export function exportToJSON(data: unknown, filename: string): void {
  if (!data || (Array.isArray(data) && data.length === 0)) throw new Error('No data to export');
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

// ---- Text file export ----
export function exportToText(content: string, filename: string): void {
  if (!content) throw new Error('No content to export');
  downloadFile(content, filename, 'text/plain;charset=utf-8;');
}

// ---- Generic CSV from array of objects ----
export function exportObjectsToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) throw new Error('No data to export');
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(h => obj[h]));
  const csv = buildCsv(headers, rows);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}
