import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";

type Props = {
  className?: string;
};

export default function MarkdownRenderer({
  className,
  options,
  ...props
}: MDXRemoteProps & Props) {
  return (
    <div
      className={cn(
        "max-w-none prose prose-neutral font-inter text-black",
        className,
      )}
    >
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
