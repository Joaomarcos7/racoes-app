import { Sidebar } from "@/components/layout/Sidebar"

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  )
}
