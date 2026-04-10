import { type AnyRouter, type InferBucketPathObject, type InferMetadataObject, type UploadOptions } from '@edgestore/shared';
import { type z } from 'zod';
/**
 * @internal
 * @see https://www.totaltypescript.com/concepts/the-prettify-helper
 */
export type Prettify<TType> = {
    [K in keyof TType]: TType[K];
} & {};
export type BucketFunctions<TRouter extends AnyRouter> = {
    [K in keyof TRouter['buckets']]: {
        /**
         * Upload a file to the bucket
         *
         * @example
         * await edgestore.myBucket.upload({
         *  file: file,
         *  signal: abortController.signal, // if you want to be able to cancel the ongoing upload
         *  onProgressChange: (progress) => { console.log(progress) }, // if you want to show the progress of the upload
         *  input: {...} // if the bucket has an input schema
         *  options: {
         *   manualFileName: file.name, // if you want to use a custom file name
         *   replaceTargetUrl: url, // if you want to replace an existing file
         *   temporary: true, // if you want to delete the file after 24 hours
         *  }
         * })
         */
        upload: (params: z.infer<TRouter['buckets'][K]['_def']['input']> extends never ? {
            file: File;
            signal?: AbortSignal;
            onProgressChange?: OnProgressChangeHandler;
            options?: UploadOptions;
        } : {
            file: File;
            signal?: AbortSignal;
            input: z.infer<TRouter['buckets'][K]['_def']['input']>;
            onProgressChange?: OnProgressChangeHandler;
            options?: UploadOptions;
        }) => Promise<TRouter['buckets'][K]['_def']['type'] extends 'IMAGE' ? {
            url: string;
            thumbnailUrl: string | null;
            size: number;
            uploadedAt: Date;
            metadata: InferMetadataObject<TRouter['buckets'][K]>;
            path: InferBucketPathObject<TRouter['buckets'][K]>;
            pathOrder: Prettify<keyof InferBucketPathObject<TRouter['buckets'][K]>>[];
        } : {
            url: string;
            size: number;
            uploadedAt: Date;
            metadata: InferMetadataObject<TRouter['buckets'][K]>;
            path: InferBucketPathObject<TRouter['buckets'][K]>;
            pathOrder: Prettify<keyof InferBucketPathObject<TRouter['buckets'][K]>>[];
        }>;
        confirmUpload: (params: {
            url: string;
        }) => Promise<void>;
        delete: (params: {
            url: string;
        }) => Promise<void>;
    };
};
type OnProgressChangeHandler = (progress: number) => void;
export declare function createNextProxy<TRouter extends AnyRouter>({ apiPath, uploadingCountRef, maxConcurrentUploads, disableDevProxy, }: {
    apiPath: string;
    uploadingCountRef: React.MutableRefObject<number>;
    maxConcurrentUploads?: number;
    disableDevProxy?: boolean;
}): BucketFunctions<TRouter>;
export {};
//# sourceMappingURL=createNextProxy.d.ts.map