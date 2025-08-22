# AI Integration Strategy

## Overview

Mo Headlines uses Perplexity API to fact-check and synthesize content from multiple sources into verified articles. The system processes queue items containing structured data (title, URL, concept) to generate comprehensive, cited articles.

## AI Integration Workflow

### Universal Processing Pattern
- **Queue Items**: All content types normalize to `title`, `url`, and `concept` fields
- **Single API Call**: Unified Perplexity request handles all source types
- **Structured Output**: Markdown articles with embedded citations
- **Quality Control**: AI-driven fact-checking with source verification

### Source Type Processing
- **RSS Sources**: Title and URL from feed, concept extracted from description
- **Research Articles**: Manual title/URL input, concept from user-provided context
- **YouTube Videos**: Title from video metadata, URL to video, concept from transcript segment

## Prompt Strategy

### Current Implementation (RSS-focused)
- **Model**: `sonar-pro` for enhanced research capabilities
- **Temperature**: 0.2 for consistent, factual output
- **Max Tokens**: 1500 for comprehensive articles
- **Format**: Structured JSON response with predefined fields

### Universal Prompt Template
**Core Structure**: Works for all content types using normalized fields

**Input Fields**:
- `title`: Source content title
- `url`: Primary source URL  
- `concept`: Context excerpt or transcript segment
- `sourceType`: RSS, Research, or YouTube (for context)

**Output Requirements**:
- Fact-checked article in markdown format
- Minimum 3 reliable source citations
- 400-800 word count
- Professional, objective tone
- Bold topic keywords for discoverability

### Source-Specific Adaptations

#### RSS Sources
- **Concept Field**: RSS item description or excerpt
- **Context**: Feed source name and RSS category
- **Processing**: Standard fact-checking against multiple sources

#### Research Articles  
- **Concept Field**: User-provided research context or notes
- **Context**: Manual research intent and focus area
- **Processing**: Deep-dive analysis with academic source preference

#### YouTube Videos
- **Concept Field**: Transcript segment between timecodes
- **Context**: Video metadata, channel, upload date
- **Processing**: Video content verification against external sources
- **Note**: Perplexity cannot directly watch YouTube videos - transcript required

### YouTube Transcript Integration
**Recommended Approach**:
1. Use YouTube Data API v3 to get video metadata
2. Extract transcript using third-party service (e.g., youtube-transcript-api)
3. Extract relevant segment based on timecodes
4. Use transcript excerpt as `concept` field
5. Process normally through unified prompt

**Alternative**: Use YouTube URL with clear timecode parameters - let Perplexity research the video topic rather than content analysis

## Content Quality Standards

### Article Requirements
- **Fact-Checking**: Cross-referenced against 3+ reliable sources
- **Source Recognition**: Use mainstream tech publications, company blogs, government sources
- **Objectivity**: Professional journalism tone, avoid sensationalism
- **Accuracy**: Specific facts, dates, figures when available
- **Discrepancy Handling**: Note conflicting reports between sources

### Topic Generation Strategy
**Current Issue**: Topics often too generic or multi-word phrases
**Improved Approach**:
- **Single Tokens Only**: No spaces, hyphens allowed (e.g., "GPT-4", "Meta")
- **Proper Nouns**: Company names, product names, people names in TitleCase
- **Recognizable Terms**: Well-known tech buzzwords, acronyms
- **Search Integration**: Topics link to category keyword search
- **Bold Formatting**: Each topic appears bolded at least once in article text

### Source Citation Standards
- **Minimum Sources**: 3-5 reputable sources per article
- **Source Types**: Major tech publications, company announcements, research papers
- **URL Recording**: All source URLs captured for verification
- **Attribution**: Clear source identification in content

## Processing Instructions

### Universal Processing (Single or Bulk)
- **Single Item**: Process one queue item individually 
- **Bulk Processing**: Process multiple selected items in single API call
- **Unified Function**: Same `processWithAIInternal` function handles both cases
- **Queue Status**: Waiting → Processing → Completed/Failed for each item
- **Error Handling**: Individual item retry logic with failure tracking
- **Status Updates**: Real-time processing state management per item
- **Result Storage**: Articles created with pending status for review
- **Cost Optimization**: Bulk processing reduces API calls through intelligent batching

### Queue Field Structure
**Current Fields**:
- `title`: Article title
- `url`: Source URL
- `description`: Content excerpt (maps to concept)
- `producerId`: Source creator reference
- `categories`: Content categorization

**Recommended Universal Fields**:
- `title`: Normalized title across all sources
- `url`: Primary source URL
- `concept`: Content context (description/notes/transcript)
- `sourceType`: RSS/Research/YouTube identifier
- `metadata`: Source-specific additional data

## Content Standards

### Fact-Checking Requirements
- **Multi-Source Verification**: Each claim verified against multiple sources
- **Source Credibility**: Prioritize recognized publications and official sources
- **Conflict Resolution**: Address discrepancies between sources
- **Timestamp Accuracy**: Verify dates and timeline information
- **Quote Verification**: Ensure quoted material is accurate and attributed

### Output Format Standards
- **Markdown Structure**: Clean, readable formatting for ReactMarkdown
- **Paragraph Flow**: Natural journalistic narrative, no bullet points
- **Topic Integration**: Keywords naturally incorporated and bolded
- **Citation Format**: URLs embedded naturally in content flow
- **Excerpt Quality**: Compelling 2-3 sentence summary for previews

### Review Workflow Integration
- **Pending Status**: All AI articles require admin approval
- **Edit Capability**: Admin can modify before publishing
- **Source Verification**: Review source quality and relevance
- **Content Standards**: Ensure adherence to editorial guidelines
- **Publication Control**: Manual approval for public visibility

## Technical Implementation Notes

### API Integration
- **Authentication**: Secure API key management
- **Rate Limiting**: Respect Perplexity usage limits
- **Error Recovery**: Robust failure handling and retry logic
- **Response Validation**: Ensure complete JSON structure
- **Performance Monitoring**: Track processing times and success rates

### Content Processing
- **Topic Sanitization**: Enforce single-token topic rules
- **Bold Formatting**: Automatic topic highlighting in content
- **Slug Generation**: URL-friendly article identifiers
- **Category Mapping**: Flexible category assignment with fallbacks
- **Image Prompt Generation**: AI-generated visual content prompts

### Future Enhancements
- **Batch Processing**: Multiple items in single API call
- **Source Diversity**: Expand beyond tech news to other domains
- **Quality Scoring**: Automatic content quality assessment
- **Duplicate Detection**: Prevent redundant article creation
- **Performance Analytics**: Processing efficiency metrics