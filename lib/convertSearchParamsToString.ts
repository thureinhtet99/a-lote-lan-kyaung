export function convertSearchParamsToString(
  searchParams: Record<string, string | string[]>
): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((data) => params.append(key, data));
    } else {
      params.set(key, value);
    }
  });

  return params.toString();
}
