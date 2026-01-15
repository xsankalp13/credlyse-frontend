import { api } from "../api"

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

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
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

describe("ApiClient", () => {
    beforeEach(() => {
        mockFetch.mockClear()
        localStorageMock.clear()
        // Reset fetch implementation
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({}),
        })
    })

    describe("Headers and Token", () => {
        it("should include authorization header when token exists", async () => {
            localStorage.setItem("access_token", "fake-token")

            await api.getCurrentUser()

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/users/me"),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Authorization": "Bearer fake-token",
                        "Content-Type": "application/json"
                    })
                })
            )
        })

        it("should not include authorization header when token is missing", async () => {
            await api.getCurrentUser()

            const calls = mockFetch.mock.calls
            const headers = calls[0][1].headers
            expect(headers).not.toHaveProperty("Authorization")
        })
    })

    describe("login", () => {
        it("should send credentials correctly", async () => {
            const mockToken = { access_token: "new-token", token_type: "bearer" }
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockToken
            })

            const result = await api.login({ username: "test", password: "password" })

            expect(result).toEqual(mockToken)
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/auth/login"),
                expect.objectContaining({
                    method: "POST",
                    // body should contain the params
                })
            )
            // Verify body content specifically if needed
            const body = mockFetch.mock.calls[0][1].body
            expect(body).toContain("username=test")
            expect(body).toContain("password=password")
        })
    })

    describe("Error Handling", () => {
        it("should throw error on failed request", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ detail: "Bad Request" })
            })

            await expect(api.getCurrentUser()).rejects.toThrow("Bad Request")
        })
    })
})
