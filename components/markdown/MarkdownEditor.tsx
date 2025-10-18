import dynamic from "next/dynamic";

export const MarkdownEditor = dynamic(() => import("./_MarkdownEditorClient"), {
  ssr: false,
});
