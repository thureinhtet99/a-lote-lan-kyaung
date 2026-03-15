export default function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2">
      <div className="size-5 animate-spin rounded-full border-2 border-blue-600 border-b-transparent"></div>
      <span className="text-base text-muted-foreground">Loading....</span>
    </div>
  );
}
