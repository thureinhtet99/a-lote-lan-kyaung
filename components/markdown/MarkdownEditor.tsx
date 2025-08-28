import dynamic from "next/dynamic";

export const MarkdownEditor = dynamic(() => import("./_MardownEditorClient"), {
  ssr: false,
});
