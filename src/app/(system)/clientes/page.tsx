"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { ClienteTable } from "@/components/clientes/ClienteTable"
import { useClientes } from "@/hooks/use-clientes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ClientesPage() {
  const [search, setSearch] = useState("")
  const { data: clientes = [], isLoading } = useClientes(search)

  return (
    <div>
      <PageHeader
        title="Clientes"
        action={
          <Button className="bg-green-800 hover:bg-green-700" asChild>
            <Link href="/clientes/novo">+ Novo Cliente</Link>
          </Button>
        }
      />
      <div className="mb-4">
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <ClienteTable clientes={clientes} />
      )}
    </div>
  )
}
