// Timecode utility functions for HH:MM:SS format

export function secondsToTimecode(seconds: number): string {
  if (!seconds || seconds < 0) return "00:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function timecodeToSeconds(timecode: string): number {
  if (!timecode || timecode.trim() === "") return 0;
  
  // Remove any non-digit and non-colon characters
  const cleaned = timecode.replace(/[^0-9:]/g, '');
  
  // Split by colons and pad with zeros if needed
  const parts = cleaned.split(':');
  
  // Handle different formats: SS, MM:SS, HH:MM:SS
  if (parts.length === 1) {
    // Just seconds: "30" -> 30 seconds
    return Math.max(0, parseInt(parts[0]) || 0);
  } else if (parts.length === 2) {
    // MM:SS format: "01:30" -> 90 seconds
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else if (parts.length >= 3) {
    // HH:MM:SS format: "01:02:30" -> 3750 seconds
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  return 0;
}

export function formatTimecodeInput(value: string): string {
  // Remove all non-digit characters first
  const digits = value.replace(/\D/g, '');
  
  // Limit to 6 digits (HHMMSS)
  const limitedDigits = digits.slice(0, 6);
  
  // Auto-format with colons
  if (limitedDigits.length <= 2) {
    // 00-99: just seconds
    return limitedDigits;
  } else if (limitedDigits.length <= 4) {
    // 00:00-99:99: MM:SS format
    return limitedDigits.slice(0, 2) + ':' + limitedDigits.slice(2);
  } else {
    // 00:00:00-99:99:99: HH:MM:SS format
    return limitedDigits.slice(0, 2) + ':' + limitedDigits.slice(2, 4) + ':' + limitedDigits.slice(4);
  }
}

export function validateTimecode(timecode: string): boolean {
  if (!timecode || timecode.trim() === "") return true; // Empty is valid
  
  const cleaned = timecode.replace(/[^0-9:]/g, '');
  const parts = cleaned.split(':');
  
  // Check format
  if (parts.length < 1 || parts.length > 3) return false;
  
  // Validate each part
  for (const part of parts) {
    const num = parseInt(part);
    if (isNaN(num) || num < 0) return false;
    
    // Minutes and seconds should be < 60
    if (parts.length > 1 && parts.indexOf(part) > 0 && num >= 60) return false;
  }
  
  return true;
}

// Format timecode for display (ensure HH:MM:SS format)
export function displayTimecode(seconds?: number): string {
  if (seconds === undefined || seconds === null) return "Not set";
  return secondsToTimecode(seconds);
}