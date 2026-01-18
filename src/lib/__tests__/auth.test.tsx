/**
 * Auth Context Tests - TDD
 * 
 * Testing the AuthProvider and useAuth hook
 */

import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider, useAuth } from "../auth"
import { api } from "../api"
import * as extensionModule from "../extension"

// Mock the api module
jest.mock("../api", () => ({
    api: {
        login: jest.fn(),
        signup: jest.fn(),
        getCurrentUser: jest.fn(),
    },
}))

// Mock the extension module
jest.mock("../extension", () => ({
    syncTokenWithExtension: jest.fn().mockResolvedValue(undefined),
    clearExtensionAuth: jest.fn(),
}))

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString()
        },
        clear: () => {
            store = {}
        },
        removeItem: (key: string) => {
            delete store[key]
        },
    }
})()
Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
})

// Helper component to access auth context in tests
function TestComponent() {
    const { user, isLoading, isAuthenticated, login, logout } = useAuth()

    return (
        <div>
            <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
            <div data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</div>
            <div data-testid="user">{user ? user.email : "no user"}</div>
            <button onClick={() => login("test@example.com", "password")}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

describe("AuthProvider", () => {
    const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
        role: "learner" as const,
        is_active: true,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.clear()
            ; (api.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
            ; (api.login as jest.Mock).mockResolvedValue({
                access_token: "test-token",
                token_type: "bearer",
            })
    })

    it("should start in loading state", () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByTestId("loading")).toHaveTextContent("loading")
    })

    it("should be unauthenticated when no token exists", async () => {
        ; (api.getCurrentUser as jest.Mock).mockRejectedValue(new Error("No token"))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("ready")
        })

        expect(screen.getByTestId("authenticated")).toHaveTextContent("no")
        expect(screen.getByTestId("user")).toHaveTextContent("no user")
    })

    it("should be authenticated when valid token exists", async () => {
        localStorageMock.setItem("access_token", "existing-token")

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("ready")
        })

        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes")
        expect(screen.getByTestId("user")).toHaveTextContent("test@example.com")
    })

    it("should sync token with extension on initial load", async () => {
        localStorageMock.setItem("access_token", "existing-token")

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("ready")
        })

        expect(extensionModule.syncTokenWithExtension).toHaveBeenCalledWith(
            "existing-token",
            mockUser
        )
    })

    describe("login", () => {
        it("should store token and fetch user on login", async () => {
            const user = userEvent.setup()

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )

            await waitFor(() => {
                expect(screen.getByTestId("loading")).toHaveTextContent("ready")
            })

            await user.click(screen.getByText("Login"))

            await waitFor(() => {
                expect(api.login).toHaveBeenCalledWith({
                    username: "test@example.com",
                    password: "password",
                })
            })

            expect(localStorageMock.getItem("access_token")).toBe("test-token")
        })

        it("should sync with extension after login", async () => {
            const user = userEvent.setup()

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )

            await waitFor(() => {
                expect(screen.getByTestId("loading")).toHaveTextContent("ready")
            })

            await user.click(screen.getByText("Login"))

            await waitFor(() => {
                expect(extensionModule.syncTokenWithExtension).toHaveBeenCalled()
            })
        })
    })

    describe("logout", () => {
        it("should clear token and user on logout", async () => {
            const user = userEvent.setup()
            localStorageMock.setItem("access_token", "existing-token")

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )

            await waitFor(() => {
                expect(screen.getByTestId("authenticated")).toHaveTextContent("yes")
            })

            await user.click(screen.getByText("Logout"))

            expect(localStorageMock.getItem("access_token")).toBeNull()
            expect(screen.getByTestId("authenticated")).toHaveTextContent("no")
        })

        it("should clear extension auth on logout", async () => {
            const user = userEvent.setup()
            localStorageMock.setItem("access_token", "existing-token")

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )

            await waitFor(() => {
                expect(screen.getByTestId("loading")).toHaveTextContent("ready")
            })

            await user.click(screen.getByText("Logout"))

            expect(extensionModule.clearExtensionAuth).toHaveBeenCalled()
        })
    })

    describe("error handling", () => {
        it("should clear invalid token and set user to null", async () => {
            localStorageMock.setItem("access_token", "invalid-token")
                ; (api.getCurrentUser as jest.Mock).mockRejectedValue(new Error("Invalid token"))

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )

            await waitFor(() => {
                expect(screen.getByTestId("loading")).toHaveTextContent("ready")
            })

            expect(localStorageMock.getItem("access_token")).toBeNull()
            expect(screen.getByTestId("authenticated")).toHaveTextContent("no")
        })
    })
})

describe("useAuth", () => {
    it("should throw error when used outside AuthProvider", () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { })

        expect(() => {
            render(<TestComponent />)
        }).toThrow("useAuth must be used within an AuthProvider")

        consoleSpy.mockRestore()
    })
})
