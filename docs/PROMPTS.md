# AI Integration Strategy

## Overview

The Headlines uses Google Gemini to fact-check and synthesize content from YouTube sources into verified articles. The system processes queue items containing structured data (title, URL, concept) to generate comprehensive, cited articles.

## AI Integration Workflow

### Universal Processing Pattern
- **Queue Items**: All content types normalize to `title`, `url`, and `concept` fields
- **Single Gemini API Call**: Unified Gemini request handles YouTube source
- **Structured Output**: Markdown articles with embedded citations
- **Quality Control**: AI-driven fact-checking with source verification

## Prompt Strategy

### Universal Prompt Template
**Core Structure**: Works for YouTube content using normalized fields

**Input Fields**:
- `title`: YouTube video title
- `url`: YouTube video URL
- `concept`: Transcript segment from YouTube video

**Output Requirements**:
- Fact-checked article in markdown format
- Minimum 3 reliable source citations
- 400-800 word count
- Professional, objective tone
- Bold topic keywords for discoverability

### YouTube Transcript Integration
**Approach**:
1. Obtain YouTube video metadata and transcript.
2. Extract relevant segment based on timecodes if needed, or use full transcript.
3. Use transcript excerpt as `concept` field directly for Gemini processing.
4. Gemini will perform all necessary content analysis and fact-checking.

## Image Generation Pipeline

### Image Generation Workflow
- **Access Point**: Generate Image button appears on edit pages without images
- **Prompt Selection**: Choose from Gemini AI-generated prompts or create custom prompts
- **Generation Process**: Send selected prompt to an integrated image generation API
- **Preview System**: Display generated image for user review
- **Iteration Support**: Generate multiple variations until satisfied
- **Integration**: Save approved image to article, return to edit workflow

### Prompt Generation Strategy (by Gemini)
- **Content Analysis**: Gemini extracts visual themes from article content to generate prompts
- **Style Guidelines**: Consistent visual aesthetic across all generated images
- **Technical Specifications**: Optimize prompts for desired aspect ratios and resolutions
- **Brand Alignment**: Ensure generated imagery aligns with The Headlines visual identity
### Source data structure
- For each source cited, extract and provide:
  - The complete URL
  - The domain name (parsed from URL)
  - The article title

## Content Quality Standards

### Article Requirements
- **Fact-Checking**: Cross-referenced against 4-10 reliable sources
- **Source Recognition**: Use mainstream tech publications, company blogs, government sources
- **Objectivity**: Professional journalism tone, avoid sensationalism
- **Accuracy**: Specific facts, dates, figures when available
- **Discrepancy Handling**: Note conflicting reports between sources

### Source Citation Standards
- **Minimum Sources**: 10-20 reputable sources per article
- **Source Types**: Major tech publications, company announcements, research papers
- **URL Recording**: All source URLs captured for verification
- **Attribution**: Clear source identification in content

## Processing Instructions

### Universal Processing (Single or Bulk)
- **Single Item**: Process one queue item individually using Gemini AI
- **Bulk Processing**: Process multiple selected items in single Gemini API call
- **Unified Function**: Same `processWithAIInternal` function handles both cases
- **Queue Status**: Waiting → Processing → Completed/Failed for each item
- **Error Handling**: Individual item retry logic with failure tracking
- **Status Updates**: Real-time processing state management per item
- **Result Storage**: Articles created with pending status for review
- **Cost Optimization**: Bulk processing reduces Gemini API calls through intelligent batching
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

- **Rate Limiting**: Respect Gemini usage limits

- **Error Recovery**: Robust failure handling and retry logic

- **Response Validation**: Ensure complete JSON structure

- **Performance Monitoring**: Track processing times and success rates



### Content Processing

- **Topic Sanitization**: Enforce single-token topic rules

- **Bold Formatting**: Automatic topic highlighting in content

- **Slug Generation**: URL-friendly article identifiers

- **Category Mapping**: Flexible category assignment with fallbacks

- **Image Prompt Generation**: Gemini AI-generated visual content prompts



### Future Enhancements

- **Batch Processing**: Multiple items in single Gemini API call

- **Enhanced AI Capabilities**: Deeper analysis, multi-modal outputs with Gemini

- **Quality Scoring**: Automatic content quality assessment by Gemini

- **Duplicate Detection**: Prevent redundant article creation by Gemini

- **Performance Analytics**: Processing efficiency metrics for Gemini API usage