export const getNumberParam = (
  value: string | string[] | undefined,
  fallback: number,
) => {
  const stringValue = Array.isArray(value) ? value[0] : value;
  if (!stringValue) return fallback;

  const parsed = Number.parseInt(stringValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getStringParam = (
  value: string | string[] | undefined,
  fallback: string,
) => {
  const stringValue = Array.isArray(value) ? value[0] : value;
  return stringValue?.trim() ?? fallback;
};

export const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const visiblePages: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (index > 0) {
      const gap = page - previousPage;
      if (gap === 2) {
        visiblePages.push(previousPage + 1);
      } else if (gap > 2) {
        visiblePages.push("ellipsis");
      }
    }

    visiblePages.push(page);
  }

  return visiblePages;
};
