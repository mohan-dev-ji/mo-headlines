// RSS parsing utilities for client-side validation and helpers

export interface ParsedRSSItem {
  title: string;
  url: string;
  publishedAt: string;
  excerpt: string;
  categories?: string[];
  content?: string;
}

export interface RSSFeedMeta {
  title: string;
  description: string;
  link: string;
  language?: string;
  lastBuildDate?: string;
  generator?: string;
}

export interface ParsedRSSFeed {
  meta: RSSFeedMeta;
  items: ParsedRSSItem[];
  parsedAt: string;
}

/**
 * Validate if a URL appears to be an RSS feed URL
 */
export function isValidRSSUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Common RSS URL patterns
    const rssPatterns = [
      /\/rss$/i,
      /\/feed$/i,
      /\/atom$/i,
      /\.rss$/i,
      /\.xml$/i,
      /rss\.xml$/i,
      /feed\.xml$/i,
      /atom\.xml$/i,
      /\/rss\//i,
      /\/feed\//i,
      /\/feeds\//i,
    ];
    
    const path = parsed.pathname.toLowerCase();
    return rssPatterns.some(pattern => pattern.test(path)) || 
           parsed.search.includes('feed') ||
           parsed.search.includes('rss');
  } catch {
    return false;
  }
}

/**
 * Extract domain from RSS URL for display
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Format refresh interval for display
 */
export function formatRefreshInterval(seconds: number): string {
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }
  
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }
  
  const days = Math.floor(seconds / 86400);
  if (days === 7) {
    return "1w";
  }
  
  return `${days}d`;
}

/**
 * Generate suggested RSS URLs from a base URL
 */
export function generateRSSCandidates(baseUrl: string): string[] {
  try {
    const parsed = new URL(baseUrl);
    const base = `${parsed.protocol}//${parsed.host}`;
    
    return [
      `${base}/rss`,
      `${base}/feed`,
      `${base}/rss.xml`,
      `${base}/feed.xml`,
      `${base}/atom.xml`,
      `${base}/feeds/all.atom.xml`,
      `${base}/index.xml`,
      `${base}/blog/rss`,
      `${base}/blog/feed`,
      `${base}/news/rss`,
      `${base}/news/feed`,
    ];
  } catch {
    return [];
  }
}

/**
 * Clean and truncate text for display
 */
export function cleanText(text: string, maxLength: number = 150): string {
  if (!text) return '';
  
  // Remove HTML tags
  const cleaned = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const decoded = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Truncate if necessary
  if (decoded.length <= maxLength) {
    return decoded.trim();
  }
  
  return decoded.substring(0, maxLength).trim() + '...';
}

/**
 * Filter articles by category keywords
 */
export function filterArticlesByCategory(
  articles: ParsedRSSItem[], 
  categoryKeywords: string[]
): ParsedRSSItem[] {
  if (!categoryKeywords.length) return articles;
  
  const keywords = categoryKeywords.map(k => k.toLowerCase());
  
  return articles.filter(article => {
    const searchText = [
      article.title,
      article.excerpt,
      ...(article.categories || [])
    ].join(' ').toLowerCase();
    
    return keywords.some(keyword => searchText.includes(keyword));
  });
}

/**
 * Sort articles by publication date (newest first)
 */
export function sortArticlesByDate(articles: ParsedRSSItem[]): ParsedRSSItem[] {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA; // Newest first
  });
}

/**
 * Validate RSS feed response structure
 */
export function validateRSSResponse(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for required fields
  if (!data.title && !data.feedTitle) {
    return false;
  }
  
  if (!Array.isArray(data.items) && !Array.isArray(data.articles)) {
    return false;
  }
  
  const items = data.items || data.articles || [];
  
  // Validate at least one item has required fields
  if (items.length > 0) {
    const firstItem = items[0];
    if (!firstItem.title || !firstItem.url) {
      return false;
    }
  }
  
  return true;
}

/**
 * Extract category keywords from category name
 */
export function extractCategoryKeywords(categoryName: string): string[] {
  if (!categoryName) return [];
  
  const keywords = categoryName
    .toLowerCase()
    .split(/[\s,&-]+/)
    .filter(word => word.length > 2)
    .map(word => word.trim());
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Calculate feed health score based on various factors
 */
export function calculateFeedHealthScore(source: {
  lastPolled?: number;
  pollFrequency: number;
  isActive: boolean;
  createdAt: number;
}): {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
} {
  let score = 100;
  const issues: string[] = [];
  const now = Date.now();
  
  // Check if active
  if (!source.isActive) {
    score -= 50;
    issues.push('Source is inactive');
  }
  
  // Check last polling
  if (source.lastPolled) {
    const timeSinceLastPoll = now - source.lastPolled;
    const expectedInterval = source.pollFrequency * 1000; // Convert to ms
    
    if (timeSinceLastPoll > expectedInterval * 2) {
      score -= 30;
      issues.push('Polling is behind schedule');
    } else if (timeSinceLastPoll > expectedInterval * 1.5) {
      score -= 15;
      issues.push('Polling is slightly delayed');
    }
  } else if (source.isActive) {
    score -= 25;
    issues.push('Never been polled');
  }
  
  // Check age
  const ageInDays = (now - source.createdAt) / (1000 * 60 * 60 * 24);
  if (ageInDays < 1 && !source.lastPolled) {
    score -= 10; // New sources get a small penalty if not polled yet
  }
  
  // Determine status
  let status: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'fair';
  else status = 'poor';
  
  return {
    score: Math.max(0, score),
    status,
    issues,
  };
}