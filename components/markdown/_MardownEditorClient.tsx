"use client";

import "@mdxeditor/editor/style.css";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
} from "@mdxeditor/editor";
import { cn } from "@/lib/utils";
import { useDarkMode } from "@/hooks/useDarkMode";
import { ForwardedRef } from "react";

export const markdownClassNames =
  "max-w-none prose prose-neutral dark:prose-invert font-sans";

export default function InternalMarkdownEditorClient({
  editorRef,
  className,
  ...props
}: { editorRef?: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  const isDarkMode = useDarkMode();

  return (
    <MDXEditor
      suppressHtmlProcessing
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BlockTypeSelect />
              <ListsToggle/>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
            </>
          ),
        }),
        markdownShortcutPlugin(),
      ]}
      {...props}
      className={cn(markdownClassNames, isDarkMode && "dark-theme", className)}
      ref={editorRef}
    />
  );
}
