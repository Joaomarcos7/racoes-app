"use client"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { ClienteForm } from "@/components/clientes/ClienteForm"
import { useCreateCliente } from "@/hooks/use-clientes"

export default function NovoClientePage() {
  const router = useRouter()
  const mutation = useCreateCliente()

  return (
    <div className="max-w-lg">
      <PageHeader title="Novo Cliente" />
      <div className="bg-white rounded-lg border p-6">
        <ClienteForm
          onSubmit={(data) =>
            mutation.mutate(data, { onSuccess: () => router.push("/clientes") })
          }
          onCancel={() => router.back()}
          loading={mutation.isPending}
        />
      </div>
    </div>
  )
}
