# Consumer Feature Implementation

## Feature Overview

The Consumer feature configures and monitors AI batch processing of queued articles. It provides terminal-style display with real-time updates, batch processing controls, and manual override capabilities.

## Component Architecture

### Consumer Tab (`consumer-tab.tsx`)
Main container component for the Consumer feature:
- Batch processing controls (ON/OFF, frequency)
- Terminal-style information display
- Manual "Process Now" functionality
- Processing status monitoring

### Batch Controls (`batch-controls.tsx`)
Configuration controls for batch processing:
- ON/OFF toggle switch for batch processing
- Frequency dropdown (15, 30, 45, 60 minutes)
- Manual "Process Now" button with loading states
- Processing configuration settings

### Terminal Display (`terminal-display.tsx`)
Terminal-style processing information display:
- Monospace font for terminal appearance
- Real-time countdown timer (updates every second)
- Processing status and article counts
- Currently processing article list

### Processing Status (`processing-status.tsx`)
Current processing status and article queue:
- List of articles currently being processed
- Processing progress indicators
- Error status and retry information
- Batch completion status

## Data Management

### Batch Processing Configuration
```typescript
interface BatchProcessingConfig {
  enabled: boolean;           // ON/OFF toggle switch
  frequency: number;          // Minutes between batches (15, 30, 45, 60)
  nextBatchTime: number;      // Timestamp for next scheduled batch
  lastProcessed: number;      // Timestamp of last completed batch
  isProcessing: boolean;      // Currently running batch
}
```

### Processing Status
```typescript
interface ProcessingStatus {
  isActive: boolean;
  articlesInBatch: number;
  currentlyProcessing: Array<{
    title: string;
    url: string;
    status: 'processing' | 'completed' | 'failed';
  }>;
  batchStartTime?: number;
  estimatedCompletion?: number;
}
```

## Terminal Display Interface

### Display States

#### Idle State (batch processing ON)
```
Last processed: 23 min ago
Next batch in: 3 min 42 sec
7 articles waiting
```

#### Processing State
```
Last processed: 23 min ago
Next batch in: 60 min
2 articles waiting

Currently processing 5 articles:
▸ Article Title 1
▸ Article Title 2  
▸ Article Title 3
▸ Article Title 4
▸ Article Title 5
```

#### Disabled State (batch processing OFF)
```
Batch processing: DISABLED
Queue status: 7 articles waiting
Manual processing only

[Process Now] button enabled
```

## Real-time Updates

### Countdown Timer
- Updates every second when batch processing enabled
- Shows time remaining until next batch
- Switches to "Processing..." during active batches
- Resets after batch completion

### Processing Updates
- Real-time list of currently processing articles
- Progress indicators for each article
- Success/failure status updates
- Batch completion notifications

### Queue Count Updates
- Live updates of pending article count
- Reflects articles added by producers
- Updates as articles complete processing
- Shows queue trends over time

## Batch Processing Logic

### Batch Creation
1. Retrieve all unprocessed articles from queue
2. Group articles by category for better context
3. Create batch with optimal size (API limits)
4. Mark articles as "processing" in database

### API Call Structure
```typescript
interface BatchProcessingRequest {
  articles: Array<{
    title: string;
    url: string;
    category: string;
    description: string;
  }>;
  batchId: string;
  processingMode: 'fact-check' | 'synthesis';
}
```

### Single API Call Example
```json
{
  "messages": [{
    "role": "user", 
    "content": "I have 3 articles from the last 15 minutes:
    
    1. 'OpenAI releases GPT-5' - https://techcrunch.com/gpt5
    2. 'Apple M4 benchmarks' - https://arstechnica.com/m4  
    3. 'Meta VR headset' - https://theverge.com/meta-vr
    
    Please fact-check each against 3+ sources and create verified summaries."
  }]
}
```

## Batch Controls Interface

### Control Components
```typescript
interface BatchControlsProps {
  enabled: boolean;
  frequency: number;
  isProcessing: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onFrequencyChange: (frequency: number) => void;
  onProcessNow: () => void;
}
```

### Control States
- **Enabled State:** Toggle ON, frequency selector active, Process Now available
- **Disabled State:** Toggle OFF, frequency grayed out, Process Now only option
- **Processing State:** All controls disabled, spinner animation, "Processing..." text

## Manual Processing

### Process Now Functionality
```typescript
const handleProcessNow = async () => {
  setIsManualProcessing(true);
  try {
    await triggerBatchProcessing();
    toast.success("Manual processing started");
  } catch (error) {
    toast.error("Failed to start processing");
  } finally {
    setIsManualProcessing(false);
  }
};
```

### Button States
- **Ready:** "Process Now" - primary button styling
- **Processing:** "Processing..." with spinner - disabled state
- **Disabled:** Grayed out when no articles in queue

## Integration Points

### Queue Integration
- Monitors queue for pending articles
- Shows real-time queue count
- Processes articles from queue in batches
- Updates queue status after processing

### Producer Integration
- Processing status affects producer completion indicators
- Successful processing triggers producer status updates
- Failed processing may trigger producer re-checks

### Backend Integration
- **Get Batch Config:** `api.batch_processing.getConfig`
- **Update Config:** `api.batch_processing.updateConfig`
- **Trigger Processing:** `api.batch_processing.triggerNow`
- **Get Status:** `api.batch_processing.getStatus`

## Error Handling

### Processing Failures
- Clear error indicators in terminal display
- Failed articles remain in queue for retry
- Error logging with admin notifications
- Automatic retry logic with exponential backoff

### API Failures
- Network connectivity issues
- Perplexity API rate limiting
- Invalid response formats
- Timeout errors

### Recovery Mechanisms
- Graceful degradation during API failures
- Queue preservation during system failures
- Manual retry capabilities
- Admin override controls

## Performance Monitoring

### Batch Performance Metrics
```typescript
interface BatchMetrics {
  averageProcessingTime: number;
  successRate: percentage;
  apiCostSavings: number;
  articlesPerBatch: number;
  dailyProcessingCount: number;
}
```

### Real-time Monitoring
- Processing time per batch
- Success/failure rates
- API cost tracking
- Queue throughput metrics

## User Workflows

### Configure Batch Processing
1. Set processing frequency (15-60 minutes)
2. Enable/disable automatic processing
3. Monitor queue status and batch timing
4. Adjust settings based on performance

### Monitor Processing Activity
1. Watch real-time countdown timer
2. View currently processing articles
3. Monitor batch completion status
4. Review processing statistics

### Manual Processing Override
1. Use "Process Now" for immediate processing
2. Override automatic scheduling when needed
3. Process priority articles outside normal batch
4. Emergency processing for urgent content

## Terminal Styling

### Visual Design
```css
.terminal-display {
  background-color: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 1rem;
  border-radius: 0.5rem;
  min-height: 200px;
}

.terminal-line {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.processing-indicator {
  animation: blink 1s infinite;
}
```

### Animation Effects
- Blinking cursor for active processing
- Smooth countdown timer updates
- Progress indicators for batch processing
- Loading animations during API calls