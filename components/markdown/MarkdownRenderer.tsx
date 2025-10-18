import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import { markdownClassNames } from "./_MarkdownEditorClient";

type MarkdownRendererType = {
  className?: string;
};

export default function MarkdownRenderer({
  className,
  options,
  ...props
}: MDXRemoteProps & MarkdownRendererType) {
  return (
    <div className={cn(markdownClassNames, className)}>
      <MDXRemote
        {...props}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              ...(options?.mdxOptions?.remarkPlugins ?? []),
            ],
            ...options?.mdxOptions,
          },
        }}
      />
    </div>
  );
}
