import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every minute to check for producers that need to be polled
crons.interval(
  "rss-producer-polling",
  { minutes: 1 },
  internal.rssProducer.checkAndRunScheduledProducers
);

export default crons;