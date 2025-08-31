"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

type MarkdownPartialType = {
  dialogMarkdown: ReactNode;
  mainMarkdown: ReactNode;
  dialogTitle?: string;
};

export default function MarkdownPartial({
  dialogMarkdown,
  mainMarkdown,
  dialogTitle,
}: MarkdownPartialType) {
  const [isOverFlowing, setIsOverFlowing] = useState(false);
  const markdownRef = useRef<HTMLDivElement>(null);

  const checkOverFlow = (node: HTMLDivElement) => {
    setIsOverFlowing(node.scrollHeight > node.clientHeight);
  };

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "resize",
      () => {
        if (markdownRef.current == null) return;
        checkOverFlow(markdownRef.current);
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, []);

  useLayoutEffect(() => {
    if (markdownRef.current == null) return;
    checkOverFlow(markdownRef.current);
  }, []);

  return (
    <>
      <div ref={markdownRef} className="max-h-[300px] overflow-hidden relative">
        {mainMarkdown}
        {isOverFlowing && (
          <div className="bg-gradient-to-t from-background to-transparent to-15% inset-0 absolute pointer-events-none" />
        )}
      </div>
      {isOverFlowing && (
        <Dialog>
          <DialogTrigger asChild >
            <Button variant="ghost" className="underline -ml-3">
              Read More
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{dialogMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
