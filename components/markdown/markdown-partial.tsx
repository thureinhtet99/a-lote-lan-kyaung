"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function MarkdownPartial({
  mainMarkdown,
  dialogMarkdown,
}: {
  mainMarkdown: ReactNode;
  dialogMarkdown: ReactNode;
}) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const markdownRef = useRef<HTMLDivElement>(null);

  function checkOverflow(node: HTMLDivElement) {
    setIsOverflowing(node.scrollHeight > node.clientHeight);
  }

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "resize",
      () => {
        if (markdownRef.current == null) return;
        checkOverflow(markdownRef.current);
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, []);

  useLayoutEffect(() => {
    if (markdownRef.current == null) return;
    checkOverflow(markdownRef.current);
  }, []);

  return (
    <div>
      <div
        ref={markdownRef}
        className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[5000px]" : "max-h-[300px]"
        }`}
      >
        {isExpanded ? dialogMarkdown : mainMarkdown}
        {!isExpanded && isOverflowing && (
          <div className="bg-gradient-to-t from-background to-transparent to-20% inset-0 absolute pointer-events-none" />
        )}
      </div>

      {(isOverflowing || isExpanded) && (
        <Button
          variant="ghost"
          className="underline -ml-3 mt-2 flex items-center gap-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
