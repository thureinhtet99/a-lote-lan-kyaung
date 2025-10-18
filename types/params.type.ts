export type ParamsType = {
  params: Promise<{ jobListingId: string }>;
};

export type JobSeekerSearchParamsType = {
  searchParams: Promise<Record<string, string | string[]>>;
  params?: Promise<{ jobListingId: string }>;
};

export type SearchParamsType = {
  searchParams: Promise<{ redirect?: string }>;
};
