import { useState } from 'react';
import { FileEdit, Download, Sparkles, Loader2, FileText, FileJson, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ProposalData {
  clientName: string;
  clientEmail: string;
  companyName: string;
  scope: string;
  deliverables: string[];
  timeline: string;
  basePrice: number;
  addons: { name: string; price: number }[];
  ctaText: string;
  generatedAt: string;
}

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

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + 'Z';
}

export default function ProposalGeneratorPage() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [scope, setScope] = useState('');
  const [timeline, setTimeline] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [addons, setAddons] = useState<{ name: string; price: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);

  const addDeliverable = () => setDeliverables([...deliverables, '']);
  const removeDeliverable = (i: number) => setDeliverables(deliverables.filter((_, idx) => idx !== i));
  const updateDeliverable = (i: number, val: string) => {
    const updated = [...deliverables];
    updated[i] = val;
    setDeliverables(updated);
  };

  const addAddon = () => setAddons([...addons, { name: '', price: '' }]);
  const removeAddon = (i: number) => setAddons(addons.filter((_, idx) => idx !== i));
  const updateAddon = (i: number, field: 'name' | 'price', val: string) => {
    const updated = [...addons];
    updated[i] = { ...updated[i], [field]: val };
    setAddons(updated);
  };

  const handleGenerate = async () => {
    if (!clientName || !scope || !basePrice) {
      toast.error('Please fill in client name, scope, and base price');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const proposalData: ProposalData = {
      clientName,
      clientEmail,
      companyName,
      scope,
      deliverables: deliverables.filter(d => d.trim()),
      timeline,
      basePrice: parseFloat(basePrice),
      addons: addons.filter(a => a.name).map(a => ({ name: a.name, price: parseFloat(a.price) || 0 })),
      ctaText: `Ready to transform your business? Let's get started today. Contact us at hello@quickbee.ai or reply to this proposal to proceed.`,
      generatedAt: new Date().toISOString(),
    };

    setProposal(proposalData);
    setLoading(false);
    toast.success('Proposal generated!');
  };

  const totalPrice = proposal
    ? proposal.basePrice + proposal.addons.reduce((sum, a) => sum + a.price, 0)
    : 0;

  const generateHTML = (p: ProposalData) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Proposal for ${p.clientName}</title>
<style>
  body { font-family: 'Space Grotesk', sans-serif; background: #0B0F14; color: #f0f0f0; margin: 0; padding: 40px; }
  .container { max-width: 800px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #00F5D4, #00B3A4); padding: 40px; border-radius: 16px; margin-bottom: 32px; }
  .header h1 { color: #0B0F14; font-size: 2rem; margin: 0 0 8px; }
  .header p { color: #0B0F14; opacity: 0.8; margin: 0; }
  .section { background: rgba(255,255,255,0.05); border: 1px solid rgba(0,245,212,0.2); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .section h2 { color: #00F5D4; font-size: 1.1rem; margin: 0 0 12px; }
  .deliverable { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .price-row { display: flex; justify-content: space-between; padding: 8px 0; }
  .total { font-size: 1.5rem; font-weight: bold; color: #00F5D4; }
  .cta { background: linear-gradient(135deg, #00F5D4, #00B3A4); padding: 32px; border-radius: 16px; text-align: center; margin-top: 32px; }
  .cta h2 { color: #0B0F14; margin: 0 0 8px; }
  .cta p { color: #0B0F14; opacity: 0.8; margin: 0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Business Proposal</h1>
    <p>Prepared for ${p.clientName}${p.companyName ? ` — ${p.companyName}` : ''}</p>
    <p>Generated: ${new Date(p.generatedAt).toLocaleDateString()}</p>
  </div>
  <div class="section">
    <h2>Project Scope</h2>
    <p>${p.scope}</p>
  </div>
  ${p.deliverables.length > 0 ? `<div class="section">
    <h2>Deliverables</h2>
    ${p.deliverables.map(d => `<div class="deliverable">✓ ${d}</div>`).join('')}
  </div>` : ''}
  ${p.timeline ? `<div class="section">
    <h2>Timeline</h2>
    <p>${p.timeline}</p>
  </div>` : ''}
  <div class="section">
    <h2>Pricing Breakdown</h2>
    <div class="price-row"><span>Base Service</span><span>$${p.basePrice.toLocaleString()}</span></div>
    ${p.addons.map(a => `<div class="price-row"><span>${a.name}</span><span>$${a.price.toLocaleString()}</span></div>`).join('')}
    <div class="price-row" style="border-top: 1px solid rgba(0,245,212,0.3); margin-top: 8px; padding-top: 8px;">
      <span>Total Investment</span>
      <span class="total">$${(p.basePrice + p.addons.reduce((s, a) => s + a.price, 0)).toLocaleString()}</span>
    </div>
  </div>
  <div class="cta">
    <h2>Ready to Get Started?</h2>
    <p>${p.ctaText}</p>
  </div>
</div>
</body>
</html>`;

  const downloadPDF = () => {
    if (!proposal) return;
    const html = generateHTML(proposal);
    downloadFile(html, `proposal_${getTimestamp()}.html`, 'text/html');
    toast.success('Proposal downloaded as HTML (open in browser to print as PDF)');
  };

  const downloadHTML = () => {
    if (!proposal) return;
    downloadFile(generateHTML(proposal), `proposal_${getTimestamp()}.html`, 'text/html');
    toast.success('HTML downloaded');
  };

  const downloadDOC = () => {
    if (!proposal) return;
    const html = generateHTML(proposal);
    downloadFile(html, `proposal_${getTimestamp()}.doc`, 'application/msword');
    toast.success('DOC downloaded');
  };

  const downloadJSON = () => {
    if (!proposal) return;
    downloadFile(JSON.stringify({ ...proposal, totalPrice }, null, 2), `proposal_${getTimestamp()}.json`, 'application/json');
    toast.success('JSON downloaded');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-teal flex items-center justify-center neon-glow-sm">
          <FileEdit className="w-6 h-6 text-[#0B0F14]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-teal-text">AI Proposal Generator</h1>
          <p className="text-sm text-[oklch(0.60_0.02_200)]">Generate branded proposals with one click</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form */}
        <div className="glass rounded-2xl p-6 border border-[oklch(0.82_0.18_175/0.15)] space-y-5">
          <h2 className="text-lg font-semibold text-[oklch(0.90_0.01_200)]">Proposal Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[oklch(0.75_0.01_200)] mb-2 block">Client Name *</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="John Smith"
                className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
            </div>
            <div>
              <Label className="text-[oklch(0.75_0.01_200)] mb-2 block">Client Email</Label>
              <Input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="john@company.com" type="email"
                className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
            </div>
          </div>

          <div>
            <Label className="text-[oklch(0.75_0.01_200)] mb-2 block">Company Name</Label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp"
              className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
          </div>

          <div>
            <Label className="text-[oklch(0.75_0.01_200)] mb-2 block">Project Scope *</Label>
            <Textarea value={scope} onChange={e => setScope(e.target.value)} placeholder="Describe the project scope..."
              rows={3} className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)] resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[oklch(0.75_0.01_200)]">Deliverables</Label>
              <Button onClick={addDeliverable} variant="ghost" size="sm" className="text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] h-7 px-2 rounded-lg">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {deliverables.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={d} onChange={e => updateDeliverable(i, e.target.value)} placeholder={`Deliverable ${i + 1}`}
                    className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
                  {deliverables.length > 1 && (
                    <Button onClick={() => removeDeliverable(i)} variant="ghost" size="icon" className="text-[oklch(0.55_0.22_25)] hover:bg-[oklch(0.55_0.22_25/0.1)] rounded-xl shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[oklch(0.75_0.01_200)] mb-2 block">Timeline</Label>
            <Input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 4-6 weeks"
              className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
          </div>

          <div>
            <Label className="text-[oklch(0.75_0.01_200)] mb-2 block">Base Price (USD) *</Label>
            <Input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="5000"
              className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[oklch(0.75_0.01_200)]">Add-ons</Label>
              <Button onClick={addAddon} variant="ghost" size="sm" className="text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] h-7 px-2 rounded-lg">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {addons.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={a.name} onChange={e => updateAddon(i, 'name', e.target.value)} placeholder="Add-on name"
                    className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
                  <Input type="number" value={a.price} onChange={e => updateAddon(i, 'price', e.target.value)} placeholder="Price"
                    className="w-28 bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]" />
                  <Button onClick={() => removeAddon(i)} variant="ghost" size="icon" className="text-[oklch(0.55_0.22_25)] hover:bg-[oklch(0.55_0.22_25/0.1)] rounded-xl shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading}
            className="w-full gradient-teal text-[#0B0F14] font-bold rounded-xl py-3 hover:opacity-90 transition-all neon-glow-sm disabled:opacity-50">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Proposal...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Generate Proposal</>
            )}
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          {proposal ? (
            <div className="space-y-4 animate-fade-in">
              <div className="glass rounded-2xl overflow-hidden border border-[oklch(0.82_0.18_175/0.3)] neon-glow-sm">
                {/* Proposal Header */}
                <div className="gradient-teal p-6">
                  <h2 className="text-2xl font-bold text-[#0B0F14]">Business Proposal</h2>
                  <p className="text-[#0B0F14]/80 mt-1">Prepared for {proposal.clientName}{proposal.companyName ? ` — ${proposal.companyName}` : ''}</p>
                  <p className="text-[#0B0F14]/60 text-sm mt-1">{new Date(proposal.generatedAt).toLocaleDateString()}</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Scope */}
                  <div className="glass rounded-xl p-4 border border-[oklch(0.82_0.18_175/0.15)]">
                    <h3 className="text-sm font-semibold text-[oklch(0.82_0.18_175)] mb-2">Project Scope</h3>
                    <p className="text-sm text-[oklch(0.80_0.01_200)]">{proposal.scope}</p>
                  </div>

                  {/* Deliverables */}
                  {proposal.deliverables.length > 0 && (
                    <div className="glass rounded-xl p-4 border border-[oklch(0.82_0.18_175/0.15)]">
                      <h3 className="text-sm font-semibold text-[oklch(0.82_0.18_175)] mb-2">Deliverables</h3>
                      <ul className="space-y-1">
                        {proposal.deliverables.map((d, i) => (
                          <li key={i} className="text-sm text-[oklch(0.80_0.01_200)] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full gradient-teal shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timeline */}
                  {proposal.timeline && (
                    <div className="glass rounded-xl p-4 border border-[oklch(0.82_0.18_175/0.15)]">
                      <h3 className="text-sm font-semibold text-[oklch(0.82_0.18_175)] mb-2">Timeline</h3>
                      <p className="text-sm text-[oklch(0.80_0.01_200)]">{proposal.timeline}</p>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="glass rounded-xl p-4 border border-[oklch(0.82_0.18_175/0.15)]">
                    <h3 className="text-sm font-semibold text-[oklch(0.82_0.18_175)] mb-3">Pricing Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[oklch(0.70_0.01_200)]">Base Service</span>
                        <span className="text-[oklch(0.90_0.01_200)]">${proposal.basePrice.toLocaleString()}</span>
                      </div>
                      {proposal.addons.map((a, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[oklch(0.70_0.01_200)]">{a.name}</span>
                          <span className="text-[oklch(0.90_0.01_200)]">${a.price.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t border-[oklch(0.82_0.18_175/0.2)] pt-2 flex justify-between">
                        <span className="font-semibold text-[oklch(0.90_0.01_200)]">Total Investment</span>
                        <span className="font-bold text-xl gradient-teal-text">${totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="gradient-teal rounded-xl p-4 text-center">
                    <h3 className="font-bold text-[#0B0F14] mb-1">Ready to Get Started?</h3>
                    <p className="text-xs text-[#0B0F14]/80">{proposal.ctaText}</p>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="glass rounded-2xl p-4 border border-[oklch(0.82_0.18_175/0.15)]">
                <h3 className="font-semibold text-[oklch(0.75_0.01_200)] mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[oklch(0.82_0.18_175)]" />
                  Export Proposal
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadPDF} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </Button>
                  <Button onClick={downloadHTML} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileText className="w-3 h-3 mr-1" /> HTML
                  </Button>
                  <Button onClick={downloadDOC} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileText className="w-3 h-3 mr-1" /> DOC
                  </Button>
                  <Button onClick={downloadJSON} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileJson className="w-3 h-3 mr-1" /> JSON
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 border border-[oklch(0.82_0.18_175/0.1)] flex flex-col items-center justify-center gap-3 text-center min-h-64">
              <div className="w-16 h-16 rounded-2xl bg-[oklch(0.82_0.18_175/0.1)] flex items-center justify-center">
                <FileEdit className="w-8 h-8 text-[oklch(0.82_0.18_175/0.5)]" />
              </div>
              <p className="text-[oklch(0.60_0.02_200)] text-sm">Fill in the proposal details and click Generate to create a branded proposal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
