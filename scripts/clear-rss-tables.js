// Temporary script to clear RSS tables for ADR 2 implementation
// Run this from the browser console on the admin page

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useClearRssTables() {
  const clearProducers = useMutation(api.rssProducer.clearAllRssProducers);
  const clearQueue = useMutation(api.rssQueue.clearAllRssQueue);

  const clearAll = async () => {
    console.log("Clearing RSS tables...");
    
    const producersResult = await clearProducers();
    console.log(`Cleared ${producersResult.cleared} RSS producers`);
    
    const queueResult = await clearQueue();
    console.log(`Cleared ${queueResult.cleared} RSS queue items`);
    
    console.log("RSS tables cleared successfully!");
    return { 
      producers: producersResult.cleared, 
      queue: queueResult.cleared 
    };
  };

  return clearAll;
}