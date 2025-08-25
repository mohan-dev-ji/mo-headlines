# Features

## Create Workflow

### RSS Tab
- **Generate Articles Modal**: Select category, choose saved feed, test feed, import matching articles
- **Article Review**: Generated articles appear as cards for admin review
- **Actions**: Add articles to queue or delete

### Research Tab
- **Create Research Modal**: Input title, URL (optional), research concept, select category
- **Research Sources**: Created research sources appear as cards showing title, URL, and concept
- **Actions**: Edit research sources, add to queue (removes from research tab), or delete
- **Workflow**: Research sources are deleted when added to queue, preventing duplicates

### YouTube Tab
- **Create YouTube Modal**: Input video URL, set timecodes, extract transcript
- **Article Review**: Generated video articles appear as cards for admin review
- **Actions**: Add articles to queue, edit timecodes, regenerate transcript

### Queue Tab
- **Universal Processing**: All source types normalized (title, URL, concept, createSource)
- **Management**: Filter, sort, process individually or in bulk
- **AI Processing**: Single prompt handles all source types

## Review Workflow

### Pending Tab
- **New Articles**: AI-processed articles awaiting editorial review
- **Preview**: Click cards to open live article preview page
- **Actions**: Approve, Edit, Reject, Save as Draft, Cancel

### Article Preview Page
- **Live Preview**: Uses actual public article page for realistic preview
- **Editorial Actions**: Approve (moves to Approved tab + goes live), Edit, Reject, Save as Draft

### Article Edit Page
- **Field Editing**: All article fields editable (title, body, excerpt, category, etc.)
- **Image Generation**: Generate Image button when no image present
- **Save Options**: Save as Draft (moves to Drafts tab), return to Preview

### Image Generation Page
- **Prompt Selection**: Choose AI-generated prompts or create custom prompts
- **DALL-E Integration**: Generate images via OpenAI API
- **Preview & Iterate**: Generate multiple images until satisfied
- **Save**: Insert selected image into article, return to Edit page

### Create Tab
- **Manual Creation**: Empty edit page for entirely hand-written articles
- **Custom Input**: Full editorial control over all article fields
- **Integration**: Links to preview and image generation pages like other tabs

### Approved Tab
- **Published Content**: Live articles visible on public website
- **Actions**: Edit (immediate public updates), unpublish

### Rejected Tab
- **Declined Articles**: Archive for potential recovery
- **Actions**: Delete permanently, edit and resubmit for review

### Drafts Tab
- **Work in Progress**: Articles requiring further development
- **Actions**: Continue editing, approve, delete