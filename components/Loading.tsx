function Loading() {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
      <span className="text-xs text-muted-foreground">Loading...</span>
    </div>
  );
}

export default Loading;
