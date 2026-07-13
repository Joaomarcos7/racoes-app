"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Truck, ClipboardList, LogOut, Menu, X, TrendingDown
} from "lucide-react"
import { NotificacaoBell } from "@/components/layout/NotificacaoBell"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/veiculos", label: "Veículos", icon: Truck },
  { href: "/consolidacao", label: "Consolidação", icon: ClipboardList },
  { href: "/saidas", label: "Saídas", icon: TrendingDown },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <nav className="flex-1 py-4 space-y-0.5 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 overflow-hidden whitespace-nowrap group/item",
                active
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              )}
            >
              <Icon
                size={17}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  active ? "text-blue-400" : "text-slate-500 group-hover/item:text-slate-300"
                )}
              />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/8">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 w-full overflow-hidden whitespace-nowrap transition-all duration-150"
        >
          <LogOut size={17} className="flex-shrink-0" />
          <span className="truncate">Sair</span>
        </button>
      </div>
    </>
  )
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/40">
        <span className="text-white font-bold text-xs">CO</span>
      </div>
      {!compact && (
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white leading-none truncate">Comercial</p>
          <p className="text-xs text-slate-400 leading-none mt-0.5 truncate">Ouriques</p>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 h-14 gap-3 border-b"
        style={{ background: "#0c1a3a", borderColor: "rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <Logo />
        <div className="ml-auto">
          <NotificacaoBell />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "#0c1a3a", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="px-4 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Logo />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>
        <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex group flex-col fixed top-0 left-0 h-screen w-14 hover:w-56 transition-all duration-300 ease-in-out overflow-hidden z-30"
        style={{ background: "#0c1a3a", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="px-3 py-4 flex items-center gap-3 overflow-hidden whitespace-nowrap h-14 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/40">
            <span className="text-white font-bold text-xs">CO</span>
          </div>
          <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
            <p className="text-sm font-semibold text-white leading-none truncate">Comercial</p>
            <p className="text-xs text-slate-400 leading-none mt-0.5 truncate">Ouriques</p>
          </div>
        </div>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  )
}
