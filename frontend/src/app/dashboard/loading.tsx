export default function DashboardLoading() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded-full w-32"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl"></div>
        ))}
      </div>
    </div>
  )
}
