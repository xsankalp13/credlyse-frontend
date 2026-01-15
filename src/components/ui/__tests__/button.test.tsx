import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe("Button", () => {
    it("renders children correctly", () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
    })

    it("applies default classes", () => {
        render(<Button>Default</Button>)
        const button = screen.getByRole("button")
        // Check for some default classes
        expect(button).toHaveClass("bg-primary")
    })

    it("applies variant classes", () => {
        render(<Button variant="destructive">Destructive</Button>)
        const button = screen.getByRole("button")
        expect(button).toHaveClass("bg-destructive")
    })

    it("handles onClick", () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Click</Button>)
        fireEvent.click(screen.getByRole("button"))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("can render as child", () => {
        render(<Button asChild><a href="/test">Link</a></Button>)
        const link = screen.getByRole("link", { name: "Link" })
        expect(link).toBeInTheDocument()
        expect(link).toHaveClass("bg-primary") // Should still have button classes
    })
})
