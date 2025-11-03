"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Chargement dynamique de l'éditeur pour éviter les problèmes SSR
const RichTextEditor = dynamic(
  () =>
    import("./rich-text-editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md bg-background overflow-hidden p-4 min-h-[150px]">
        <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
        <div className="h-4 bg-muted rounded mb-2 w-3/4 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
      </div>
    ),
  }
);

interface RichTextEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditorWrapper({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className={`border rounded-md bg-background overflow-hidden ${className}`}
      >
        <div className="border-b border-border bg-muted/30 p-2">
          <div className="flex flex-wrap gap-1">
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 min-h-[200px] bg-background">
          <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded mb-2 w-3/4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
