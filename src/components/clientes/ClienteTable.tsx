"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ClienteDTO } from "@/types/api"
import { Eye } from "lucide-react"

interface ClienteTableProps {
  clientes: ClienteDTO[]
}

export function ClienteTable({ clientes }: ClienteTableProps) {
  if (clientes.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Nenhum cliente cadastrado.</p>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#0C5E3A] text-white">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-left font-medium">Cidade</th>
            <th className="px-4 py-3 text-left font-medium">Telefone</th>
            <th className="px-4 py-3 text-center font-medium">Fiado</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c, i) => (
            <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-medium">{c.nome}</td>
              <td className="px-4 py-3 text-gray-600">{c.cidade}</td>
              <td className="px-4 py-3 text-gray-600">{c.telefone ?? "—"}</td>
              <td className="px-4 py-3 text-center">
                {c.temFiado && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    Fiado
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="icon" variant="ghost" asChild>
                  <Link href={`/clientes/${c.id}`}>
                    <Eye size={14} />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
