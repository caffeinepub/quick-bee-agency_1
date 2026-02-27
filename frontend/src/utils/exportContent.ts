export interface ContentExportData {
  keyword: string;
  blogContent: string;
  socialCaptions: string;
  linkedinPost: string;
  instagramCarousel: string;
  generatedAt?: string;
}

export function exportContentAsText(data: ContentExportData): void {
  const timestamp = data.generatedAt || new Date().toISOString();
  const content = `QUICK BEE AI GROWTH ENGINE - CONTENT EXPORT
Generated: ${timestamp}
Keyword/Topic: ${data.keyword}
${'='.repeat(60)}

## BLOG CONTENT
${'='.repeat(60)}
${data.blogContent}

## SOCIAL MEDIA CAPTIONS
${'='.repeat(60)}
${data.socialCaptions}

## LINKEDIN POST
${'='.repeat(60)}
${data.linkedinPost}

## INSTAGRAM CAROUSEL
${'='.repeat(60)}
${data.instagramCarousel}
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content-${data.keyword.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
