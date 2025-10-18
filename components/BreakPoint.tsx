"use client";

import { ReactNode, useEffect, useState } from "react";

const useBreakPoint = (breakpoint: string) => {
  const [isBreakPoint, setIsBreakPoint] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const media = window.matchMedia(`(${breakpoint})`);

    media.addEventListener(
      "change",
      (e) => {
        setIsBreakPoint(e.matches);
      },
      { signal: controller.signal }
    );
    setIsBreakPoint(media.matches);

    return () => {
      controller.abort();
    };
  }, [breakpoint]);

  return isBreakPoint;
};

export default function BreakPoint({
  breakpoint,
  children,
  otherwise,
}: {
  breakpoint: string;
  children: ReactNode;
  otherwise: ReactNode;
}) {
  const isBreakPoint = useBreakPoint(breakpoint);
  return isBreakPoint ? children : otherwise;
}
