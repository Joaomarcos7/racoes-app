import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Pagination } from "@/components/ui/Pagination"

describe("Pagination", () => {
  const base = { page: 1, totalPages: 5, total: 72, limit: 15, onPageChange: vi.fn(), onLimitChange: vi.fn() }

  it("renders current page info", () => {
    render(<Pagination {...base} />)
    expect(screen.getByText(/página 1 de 5/i)).toBeInTheDocument()
  })

  it("renders total items count", () => {
    render(<Pagination {...base} />)
    expect(screen.getByText(/72 itens/i)).toBeInTheDocument()
  })

  it("renders limit selector with current value", () => {
    render(<Pagination {...base} limit={15} />)
    expect(screen.getByText("15 por página")).toBeInTheDocument()
  })

  it("disables previous button on first page", () => {
    render(<Pagination {...base} page={1} />)
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled()
  })

  it("disables next button on last page", () => {
    render(<Pagination {...base} page={5} />)
    expect(screen.getByRole("button", { name: /próxima/i })).toBeDisabled()
  })

  it("calls onPageChange with page - 1 when previous clicked", () => {
    const onPageChange = vi.fn()
    render(<Pagination {...base} page={3} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole("button", { name: /anterior/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("calls onPageChange with page + 1 when next clicked", () => {
    const onPageChange = vi.fn()
    render(<Pagination {...base} page={2} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole("button", { name: /próxima/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
