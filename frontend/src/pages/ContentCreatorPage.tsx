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
import WorkflowResultDisplay from '../components/workflows/WorkflowResultDisplay';
import { useAIContentGeneration } from '../hooks/useAIContentGeneration';
import { useAIConfig } from '../contexts/AIConfigContext';
import { generateActionId, saveWorkflowExecution } from '../hooks/useWorkflowExecution';
import type { WorkflowResult, WorkflowExecution } from '../hooks/useWorkflowExecution';
import { exportContentAsText } from '../utils/exportContent';
import { useGetCallerUserRole } from '../hooks/useQueries';

interface ContentSections {
  blogContent: string;
  socialCaptions: string;
  linkedinPost: string;
  instagramCarousel: string;
}

export default function ContentCreatorPage() {
  const navigate = useNavigate();
  const { data: role } = useGetCallerUserRole();
  const { config } = useAIConfig();
  const { generateContent, isGenerating } = useAIContentGeneration();
  const [keyword, setKeyword] = useState('');
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
  const [content, setContent] = useState<ContentSections | null>(null);

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

    const prompt = `Generate SEO-optimized content for the keyword: "${keyword}". 
    Provide:
    1. A blog post introduction (200 words)
    2. Social media captions (3 variations)
    3. A LinkedIn post
    4. An Instagram carousel outline (5 slides)
    
    Format as JSON: { blogContent, socialCaptions, linkedinPost, instagramCarousel }`;

    const result = await generateContent(prompt, 'AIContentCreation');

    if (result.status === 'success' && result.content) {
      // Try to parse structured content from the AI response
      let parsedContent: ContentSections;
      try {
        const parsed = JSON.parse(result.content);
        parsedContent = {
          blogContent: parsed.blogContent || result.content,
          socialCaptions: parsed.socialCaptions || '',
          linkedinPost: parsed.linkedinPost || '',
          instagramCarousel: parsed.instagramCarousel || '',
        };
      } catch {
        // If not JSON, use the raw content as blog content
        parsedContent = {
          blogContent: result.content,
          socialCaptions: `Caption 1: Discover the power of ${keyword}! 🚀\nCaption 2: Transform your business with ${keyword} strategies.\nCaption 3: Ready to level up? ${keyword} is the key! 💡`,
          linkedinPost: `Excited to share insights about ${keyword}. In today's competitive landscape, understanding ${keyword} is crucial for business growth. Here's what you need to know...`,
          instagramCarousel: `Slide 1: ${keyword} - What You Need to Know\nSlide 2: Key Benefits\nSlide 3: How to Get Started\nSlide 4: Common Mistakes to Avoid\nSlide 5: Take Action Today!`,
        };
      }
      setContent(parsedContent);

      const res: WorkflowResult = {
        action_id: actionId,
        status: 'success',
        message: `Content generated successfully for keyword: "${keyword}"`,
        data_logged: result.data_logged,
        next_steps: ['Review and copy the generated content sections below.'],
      };
      setWorkflowResult(res);
      const execution: WorkflowExecution = { timestamp: Date.now(), result: res };
      saveWorkflowExecution('ai_content_creation', execution);
    } else {
      const res: WorkflowResult = {
        action_id: actionId,
        status: 'error',
        message: result.message || 'Content generation failed',
        data_logged: false,
        next_steps: ['Check your AI API configuration and try again.'],
      };
      setWorkflowResult(res);
      const execution: WorkflowExecution = { timestamp: Date.now(), result: res };
      saveWorkflowExecution('ai_content_creation', execution);
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

      <Card className="bg-card border-border">
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
                disabled={isGenerating}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isGenerating || !isAIConfigured}
                className="bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
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
              className="border-border"
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
              icon={<Share2 className="w-4 h-4 text-primary" />}
            />
            <ContentSectionCard
              title="LinkedIn Post"
              content={content.linkedinPost}
              icon={<Linkedin className="w-4 h-4 text-primary" />}
            />
            <ContentSectionCard
              title="Instagram Carousel"
              content={content.instagramCarousel}
              icon={<Instagram className="w-4 h-4 text-primary" />}
            />
          </div>
        </div>
      )}

      {!content && !isGenerating && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a keyword and click Generate to create content</p>
        </div>
      )}
    </div>
  );
}
