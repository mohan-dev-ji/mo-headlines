/**
 * Title similarity hashing utilities for deduplication
 * Generates normalized hashes from article titles to identify similar content
 */

// Common words to ignore when generating similarity hash
const COMMON_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
  'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
  'has', 'had', 'will', 'would', 'could', 'should', 'this', 'that', 
  'these', 'those', 'from', 'up', 'out', 'down', 'off', 'over', 'under',
  'new', 'says', 'just', 'now', 'get', 'gets', 'got', 'how', 'why', 'what'
];

/**
 * Generate a similarity hash from an article title
 * Normalizes the title by removing common words, punctuation, and standardizing case
 */
export function generateTitleHash(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split into words
    .filter(word => word.length > 2) // Remove very short words
    .filter(word => !COMMON_WORDS.includes(word)) // Remove common words
    .sort() // Sort alphabetically for consistent ordering
    .join('-');
}

/**
 * Calculate similarity score between two titles (0-1, where 1 is identical)
 */
export function calculateSimilarity(title1: string, title2: string): number {
  const hash1 = generateTitleHash(title1);
  const hash2 = generateTitleHash(title2);
  
  if (hash1 === hash2) return 1.0;
  
  const words1 = hash1.split('-').filter(w => w.length > 0);
  const words2 = hash2.split('-').filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Calculate Jaccard similarity (intersection over union)
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Find groups of similar articles from a list
 * Returns groups where each group contains articles that are similar to each other
 */
export function findSimilarGroups<T extends { title: string }>(
  articles: T[], 
  similarityThreshold: number = 0.7
): T[][] {
  const groups: T[][] = [];
  const processed = new Set<T>();
  
  for (const article of articles) {
    if (processed.has(article)) continue;
    
    const similarArticles = articles.filter(other => 
      other !== article && 
      !processed.has(other) &&
      calculateSimilarity(article.title, other.title) >= similarityThreshold
    );
    
    if (similarArticles.length > 0) {
      const group = [article, ...similarArticles];
      groups.push(group);
      
      // Mark all articles in this group as processed
      group.forEach(item => processed.add(item));
    } else {
      processed.add(article);
    }
  }
  
  return groups;
}

/**
 * Find articles that should be kept vs deleted in deduplication
 * Keeps the most recent article from each similar group
 */
export function selectArticlesToDelete<T extends { title: string; createdAt: number; _id: string }>(
  articles: T[],
  similarityThreshold: number = 0.7
): { toKeep: T[], toDelete: T[] } {
  const groups = findSimilarGroups(articles, similarityThreshold);
  const toKeep: T[] = [];
  const toDelete: T[] = [];
  
  for (const group of groups) {
    if (group.length <= 1) {
      // No duplicates found, keep the article
      toKeep.push(...group);
    } else {
      // Sort by creation date (newest first) and keep the first one
      const sorted = group.sort((a, b) => b.createdAt - a.createdAt);
      toKeep.push(sorted[0]);
      toDelete.push(...sorted.slice(1));
    }
  }
  
  // Also add articles that weren't part of any group
  const groupedArticleIds = new Set(groups.flat().map(a => a._id));
  const ungrouped = articles.filter(a => !groupedArticleIds.has(a._id));
  toKeep.push(...ungrouped);
  
  return { toKeep, toDelete };
}