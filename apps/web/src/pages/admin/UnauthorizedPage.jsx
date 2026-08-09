export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-slate-900">
          403
        </h1>

        <p className="mt-3 text-slate-500">
          You don't have permission to access
          this page.
        </p>
      </div>
    </div>
  );
}