import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

// Mock hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
    useAuth: jest.fn(),
}))

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))
// Mock framer-motion to avoid animation issues
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>,
    },
}))

describe("LoginPage", () => {
    const mockLogin = jest.fn()
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
            ; (useAuth as jest.Mock).mockReturnValue({ login: mockLogin })
    })

    it("renders login form", () => {
        render(<LoginPage />)
        expect(screen.getByText("Welcome back")).toBeInTheDocument()
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
        expect(screen.getByLabelText("Password")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
    })

    it("handles input changes", () => {
        render(<LoginPage />)
        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        expect(emailInput).toHaveValue("test@example.com")
        expect(passwordInput).toHaveValue("password123")
    })

    it("calls login on submit", async () => {
        render(<LoginPage />)
        const emailInput = screen.getByLabelText("Email")
        const passwordInput = screen.getByLabelText("Password")
        const submitButton = screen.getByRole("button", { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123")
        })
    })

    it("redirects on success", async () => {
        mockLogin.mockResolvedValueOnce(undefined) // Success
        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } })
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } })
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled()
            expect(mockPush).toHaveBeenCalledWith("/")
        })
    })

    it("shows error on failure", async () => {
        mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"))
        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } })
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } })
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Login failed", expect.any(Object))
            expect(mockPush).not.toHaveBeenCalled()
        })
    })
})
