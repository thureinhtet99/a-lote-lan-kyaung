export default function EmployerLoading() {
  return (
    <div className="h-screen flex justify-center items-center space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="text-base text-muted-foreground">Loading...</span>
    </div>
  );
}
