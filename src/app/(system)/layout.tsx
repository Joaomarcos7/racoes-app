import { Sidebar } from "@/components/layout/Sidebar"
import { NotificacaoBell } from "@/components/layout/NotificacaoBell"

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col h-screen lg:ml-14">
        <header className="hidden lg:flex items-center justify-end px-6 h-14 border-b border-slate-100 bg-white flex-shrink-0">
          <NotificacaoBell variant="light" />
        </header>
        <main className="flex-1 bg-slate-50 p-4 lg:p-6 overflow-y-auto pt-[72px] lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
