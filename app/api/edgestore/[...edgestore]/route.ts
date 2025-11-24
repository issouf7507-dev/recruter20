import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";

// Set default values for EdgeStore during build if not provided
if (!process.env.EDGE_STORE_ACCESS_KEY) {
  process.env.EDGE_STORE_ACCESS_KEY = "build-time-placeholder";
}
if (!process.env.EDGE_STORE_SECRET_KEY) {
  process.env.EDGE_STORE_SECRET_KEY = "build-time-placeholder";
}

const es = initEdgeStore.create();

/**
 * This is the main router for the EdgeStore buckets.
 */
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket(),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
