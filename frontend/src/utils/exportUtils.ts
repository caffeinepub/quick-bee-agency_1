export interface AutomationLog {
  timestamp: number;
  eventName: string;
  url: string;
  payloadSummary: string;
  statusCode: number;
  responseSummary: string;
  isError: boolean;
}

export interface Lead {
  id: bigint;
  name: string;
  email: string;
  phone?: string;
  channel: string;
  microNiche: string;
  status: string;
  createdAt: bigint;
  createdBy: { toString(): string };
  qualificationScore: bigint;
  budgetRange?: bigint;
  urgencyLevel?: bigint;
  companySize?: string;
  decisionMakerStatus?: boolean;
}

export interface Invoice {
  invoiceId: string;
  clientId: { toString(): string };
  serviceBreakdown: string;
  gstAmount: bigint;
  totalPaid: bigint;
  createdAt: bigint;
}

export interface WhatsAppMessageLog {
  recipientPhone: string;
  messageType: string;
  deliveryStatus: string;
  sentAt: bigint;
}

export function computeQualificationTier(score: number): string {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'Lukewarm';
  return 'Cold';
}

export function exportLeadsToCSV(leads: Lead[]): void {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Channel', 'Micro Niche', 'Status', 'Score', 'Created At'];
  const rows = leads.map(l => [
    l.id.toString(),
    l.name,
    l.email,
    l.phone ?? '',
    l.channel,
    l.microNiche,
    l.status,
    l.qualificationScore.toString(),
    new Date(Number(l.createdAt) / 1_000_000).toISOString(),
  ]);
  downloadCSV('leads.csv', headers, rows);
}

export function exportLeadsToPDF(leads: Lead[]): void {
  const content = leads.map(l =>
    `${l.name} | ${l.email} | ${l.status} | Score: ${l.qualificationScore}`
  ).join('\n');
  downloadText('leads-report.txt', content);
}

export function exportWhatsAppLogsToCSV(logs: WhatsAppMessageLog[]): void {
  const headers = ['Phone', 'Message Type', 'Delivery Status', 'Sent At'];
  const rows = logs.map(l => [
    l.recipientPhone,
    l.messageType,
    l.deliveryStatus,
    new Date(Number(l.sentAt) / 1_000_000).toISOString(),
  ]);
  downloadCSV('whatsapp-logs.csv', headers, rows);
}

export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const headers = ['Invoice ID', 'GST Amount', 'Total Paid', 'Created At'];
  const rows = invoices.map(i => [
    i.invoiceId,
    i.gstAmount.toString(),
    i.totalPaid.toString(),
    new Date(Number(i.createdAt) / 1_000_000).toISOString(),
  ]);
  downloadCSV('invoices.csv', headers, rows);
}

export function exportInvoiceToPDF(invoice: Invoice): void {
  const content = `Invoice: ${invoice.invoiceId}\nTotal: ₹${invoice.totalPaid}\nGST: ₹${invoice.gstAmount}`;
  downloadText(`invoice-${invoice.invoiceId}.txt`, content);
}

export function exportAutomationLogsToCSV(logs: AutomationLog[]): void {
  const headers = ['Event', 'URL', 'Status Code', 'Is Error', 'Timestamp'];
  const rows = logs.map(l => [
    l.eventName,
    l.url,
    l.statusCode.toString(),
    l.isError ? 'Yes' : 'No',
    new Date(l.timestamp).toISOString(),
  ]);
  downloadCSV('automation-logs.csv', headers, rows);
}

export function exportToJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToText(content: string, filename: string): void {
  downloadText(filename, content);
}

export function exportObjectsToCSV(objects: Record<string, unknown>[], filename: string): void {
  if (objects.length === 0) return;
  const headers = Object.keys(objects[0]);
  const rows = objects.map(o => headers.map(h => String(o[h] ?? '')));
  downloadCSV(filename, headers, rows);
}

function downloadCSV(filename: string, headers: string[], rows: string[][]): void {
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
