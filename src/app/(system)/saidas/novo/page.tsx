"use client"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { SaidaForm } from "@/components/saidas/SaidaForm"
import { useCreateSaida } from "@/hooks/use-saidas"

export default function NovaSaidaPage() {
  const router = useRouter()
  const createMutation = useCreateSaida()

  return (
    <div className="max-w-xl">
      <PageHeader title="Nova Saída" />
      <div className="bg-white rounded-lg border p-6">
        <SaidaForm
          onSubmit={(data) => createMutation.mutate(data as never, { onSuccess: () => router.push("/saidas") })}
          onCancel={() => router.push("/saidas")}
          loading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
