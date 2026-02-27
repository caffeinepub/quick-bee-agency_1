import { useState, useCallback } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';

export interface ContentSections {
  blogContent: string;
  socialCaptions: string;
  linkedinPost: string;
  instagramCarousel: string;
}

export function useAIContentGeneration() {
  const { config } = useAIConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ContentSections | null>(null);

  const generate = useCallback(async (keyword: string): Promise<ContentSections | null> => {
    if (!config.apiEndpoint || !config.apiKey) {
      setError('AI API endpoint and key are not configured. Please configure them in Settings.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    const prompt = `You are an expert SEO content creator and social media strategist for Quick Bee AI Growth Engine.

Generate comprehensive content for the keyword/topic: "${keyword}"

Please provide the following sections, clearly labeled:

## BLOG CONTENT
Write an SEO-optimized blog post including:
- Title (H1)
- Meta description (150-160 characters)
- Introduction paragraph
- H2 sections with content
- Call-to-action
- Internal linking suggestions

## SOCIAL MEDIA CAPTIONS
Write 3 engaging social media captions with relevant hashtags for Facebook, Twitter, and general use.

## LINKEDIN POST
Write a professional LinkedIn article post (300-500 words) with a hook, value content, and CTA.

## INSTAGRAM CAROUSEL
Create an outline for a 5-7 slide Instagram carousel with slide titles and key points for each slide.`;

    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawText: string = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';

      if (!rawText) {
        throw new Error('AI API returned empty response');
      }

      const sections = parseContentSections(rawText);
      setContent(sections);
      return sections;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI API request failed';
      setError(`AI API Error: ${msg}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  return { generate, isLoading, error, content, setContent };
}

function parseContentSections(text: string): ContentSections {
  const blogMatch = text.match(/##\s*BLOG CONTENT\s*([\s\S]*?)(?=##\s*SOCIAL MEDIA|$)/i);
  const socialMatch = text.match(/##\s*SOCIAL MEDIA CAPTIONS\s*([\s\S]*?)(?=##\s*LINKEDIN|$)/i);
  const linkedinMatch = text.match(/##\s*LINKEDIN POST\s*([\s\S]*?)(?=##\s*INSTAGRAM|$)/i);
  const instagramMatch = text.match(/##\s*INSTAGRAM CAROUSEL\s*([\s\S]*?)$/i);

  return {
    blogContent: blogMatch?.[1]?.trim() || text,
    socialCaptions: socialMatch?.[1]?.trim() || 'Social media captions not generated. Please try again.',
    linkedinPost: linkedinMatch?.[1]?.trim() || 'LinkedIn post not generated. Please try again.',
    instagramCarousel: instagramMatch?.[1]?.trim() || 'Instagram carousel not generated. Please try again.',
  };
}
