"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ClienteDTO } from "@/types/api"
import { Plus, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"

interface ClienteTableProps {
  clientes: ClienteDTO[]
  onDelete: (id: string) => void
}

export function ClienteTable({ clientes, onDelete }: ClienteTableProps) {
  if (clientes.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Nenhum cliente cadastrado.</p>
  }

  return (
    <div className="rounded-md border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cidade</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Fiado</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c, i) => (
            <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-medium">{c.nome}</td>
              <td className="px-4 py-3 text-gray-600">{c.cidade}</td>
              <td className="px-4 py-3 text-center">
                {c.temFiado && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    Fiado
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-1 justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" asChild>
                          <Link href={`/clientes/${c.id}`}>
                            <Plus size={14} />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalhes</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ConfirmDeleteDialog onConfirm={() => onDelete(c.id)}>
                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </Button>
                  </ConfirmDeleteDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
