/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiProcessing from "../aiProcessing.js";
import type * as articles from "../articles.js";
import type * as categories from "../categories.js";
import type * as comments from "../comments.js";
import type * as migrations from "../migrations.js";
import type * as rssProducer from "../rssProducer.js";
import type * as rssQueue from "../rssQueue.js";
import type * as seedCategories from "../seedCategories.js";
import type * as topics from "../topics.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiProcessing: typeof aiProcessing;
  articles: typeof articles;
  categories: typeof categories;
  comments: typeof comments;
  migrations: typeof migrations;
  rssProducer: typeof rssProducer;
  rssQueue: typeof rssQueue;
  seedCategories: typeof seedCategories;
  topics: typeof topics;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
