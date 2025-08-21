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
import type * as articles from "../articles.js";
import type * as categories from "../categories.js";
import type * as comments from "../comments.js";
import type * as createQueue from "../createQueue.js";
import type * as createRss from "../createRss.js";
import type * as migrations from "../migrations.js";
import type * as seedCategories from "../seedCategories.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  categories: typeof categories;
  comments: typeof comments;
  createQueue: typeof createQueue;
  createRss: typeof createRss;
  migrations: typeof migrations;
  seedCategories: typeof seedCategories;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
