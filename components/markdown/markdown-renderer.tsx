import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";

type MarkdownRendererType = {
  className?: string;
};

export const markdownClassNames =
  "max-w-none prose prose-neutral font-inter text-black";

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
