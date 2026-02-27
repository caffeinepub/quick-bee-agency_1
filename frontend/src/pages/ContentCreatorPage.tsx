import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Sparkles, AlertTriangle, Loader2, Download, FileText, Share2, Linkedin, Instagram } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContentSectionCard } from '../components/content/ContentSectionCard';
import { WorkflowResultDisplay } from '../components/workflows/WorkflowResultDisplay';
import { useAIContentGeneration } from '../hooks/useAIContentGeneration';
import { useAIConfig } from '../contexts/AIConfigContext';
import { generateActionId, postToWebhook, saveWorkflowExecution } from '../hooks/useWorkflowExecution';
import type { WorkflowResult } from '../hooks/useWorkflowExecution';
import { exportContentAsText } from '../utils/exportContent';
import { useGetCallerUserRole } from '../hooks/useQueries';

export default function ContentCreatorPage() {
  const navigate = useNavigate();
  const { data: role } = useGetCallerUserRole();
  const { config } = useAIConfig();
  const { generate, isLoading, error, content } = useAIContentGeneration();
  const [keyword, setKeyword] = useState('');
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);

  React.useEffect(() => {
    if (role === 'guest') {
      toast.error('Access denied. Redirecting to dashboard.');
      navigate({ to: '/authenticated/client-dashboard' });
    }
  }, [role, navigate]);

  if (role === 'guest') return null;

  const isAIConfigured = !!(config.apiEndpointEnabled && config.apiEndpoint && config.apiKeyEnabled && config.apiKey);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      toast.error('Please enter a keyword or topic');
      return;
    }

    if (!isAIConfigured) {
      toast.error('AI API is not configured. Please configure it in Settings.');
      return;
    }

    const actionId = generateActionId();
    const sections = await generate(keyword);

    // POST to Automation Webhook (non-blocking)
    if (config.automationWebhookUrl && config.automationWebhookUrlEnabled) {
      postToWebhook(
        config.automationWebhookUrl,
        {
          tool: 'ai_content_creation',
          keyword,
          timestamp: new Date().toISOString(),
        },
        config.apiKey,
        'AI Content Creation'
      ).catch(() => {
        // webhook failure is non-blocking
      });
    }

    if (sections) {
      const res: WorkflowResult = {
        action_id: actionId,
        status: 'success',
        message: `Content generated successfully for keyword: "${keyword}"`,
        data_logged: !!(config.automationWebhookUrl && config.automationWebhookUrlEnabled),
        next_steps: 'Review and copy the generated content sections below.',
      };
      setWorkflowResult(res);
      saveWorkflowExecution('ai_content_creation', res);
    } else if (error) {
      const res: WorkflowResult = {
        action_id: actionId,
        status: 'error',
        message: error,
        data_logged: false,
        next_steps: 'Check your AI API configuration and try again.',
      };
      setWorkflowResult(res);
      saveWorkflowExecution('ai_content_creation', res);
    }
  };

  const handleExportAll = () => {
    if (!content) return;
    exportContentAsText({
      keyword,
      blogContent: content.blogContent,
      socialCaptions: content.socialCaptions,
      linkedinPost: content.linkedinPost,
      instagramCarousel: content.instagramCarousel,
      generatedAt: new Date().toISOString(),
    });
    toast.success('Content exported as text file');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Content Creator</h1>
          <p className="text-sm text-muted-foreground">Generate SEO-optimized content and social media posts</p>
        </div>
      </div>

      {!isAIConfigured && (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-sm">
            AI API endpoint and key are not configured.{' '}
            <button
              onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
              className="underline font-medium"
            >
              Configure Now
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="card-glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Content Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Keyword / Topic</Label>
              <Input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="e.g. AI marketing automation for small businesses"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isLoading || !isAIConfigured}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {workflowResult && <WorkflowResultDisplay result={workflowResult} />}

      {content && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Generated Content</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAll}
              className="border-border/50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ContentSectionCard
              title="Blog Content"
              content={content.blogContent}
              icon={<FileText className="w-4 h-4 text-primary" />}
            />
            <ContentSectionCard
              title="Social Media Captions"
              content={content.socialCaptions}
              icon={<Share2 className="w-4 h-4 text-cyan-400" />}
            />
            <ContentSectionCard
              title="LinkedIn Post"
              content={content.linkedinPost}
              icon={<Linkedin className="w-4 h-4 text-blue-400" />}
            />
            <ContentSectionCard
              title="Instagram Carousel"
              content={content.instagramCarousel}
              icon={<Instagram className="w-4 h-4 text-pink-400" />}
            />
          </div>
        </div>
      )}

      {!content && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a keyword and click Generate to create content</p>
        </div>
      )}
    </div>
  );
}
