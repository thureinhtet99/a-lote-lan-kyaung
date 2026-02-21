import dynamic from "next/dynamic";

export const MarkdownEditor = dynamic(
  () => import("./_markdown-editor-client"),
  {
    ssr: false,
  },
);
