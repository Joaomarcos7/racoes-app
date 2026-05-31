"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Truck, ClipboardList, LogOut
} from "lucide-react"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/veiculos", label: "Veículos", icon: Truck },
  { href: "/consolidacao", label: "Consolidação", icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0C5E3A] text-white flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b border-white/20">
        <span className="font-bold text-lg">🌿 RaçõesPro</span>
      </div>
      <nav className="flex-1 py-3 space-y-1 px-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-white/20 font-semibold"
                : "hover:bg-white/10"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-2 py-3 border-t border-white/20">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/10 w-full"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
