import { render, screen, fireEvent, within } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"

describe("ConfirmDeleteDialog", () => {
  it("renders trigger button", () => {
    render(
      <ConfirmDeleteDialog onConfirm={() => {}}>
        <button>Deletar</button>
      </ConfirmDeleteDialog>
    )
    expect(screen.getByText("Deletar")).toBeInTheDocument()
  })

  it("shows confirmation dialog when trigger clicked", () => {
    render(
      <ConfirmDeleteDialog onConfirm={() => {}}>
        <button>Deletar</button>
      </ConfirmDeleteDialog>
    )
    fireEvent.click(screen.getByText("Deletar"))
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(screen.getByText("Confirmar exclusão")).toBeInTheDocument()
    expect(screen.getByText("Cancelar")).toBeInTheDocument()
    expect(within(screen.getByRole("alertdialog")).getByText("Excluir")).toBeInTheDocument()
  })

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDeleteDialog onConfirm={onConfirm}>
        <button>Deletar</button>
      </ConfirmDeleteDialog>
    )
    fireEvent.click(screen.getByText("Deletar"))
    fireEvent.click(within(screen.getByRole("alertdialog")).getByText("Excluir"))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("does not call onConfirm when cancel clicked", () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDeleteDialog onConfirm={onConfirm}>
        <button>Deletar</button>
      </ConfirmDeleteDialog>
    )
    fireEvent.click(screen.getByText("Deletar"))
    fireEvent.click(screen.getByText("Cancelar"))
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
