import { useGetAllLegalPages } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const REQUIRED_LEGAL_PAGES = [
  'Privacy Policy',
  'Terms & Conditions',
  'Refund Policy',
  'Service Agreement',
  'GST Invoice Support',
  'Disclaimer'
];

export default function LegalPage() {
  const { data: legalPages = [] } = useGetAllLegalPages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Legal Essentials</h1>
        <p className="text-soft-gray mt-1">View legal documents and policies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REQUIRED_LEGAL_PAGES.map((title) => {
          const page = legalPages.find(p => p.title === title);
          return (
            <Card key={title} className="glass-panel border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                {page ? (
                  <p className="text-sm text-soft-gray line-clamp-3">{page.content}</p>
                ) : (
                  <p className="text-sm text-soft-gray italic">Not yet created</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
