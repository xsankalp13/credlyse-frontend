import { syncTokenWithExtension, clearExtensionAuth } from "../extension"

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

describe("Extension Integration", () => {
    let mockSendMessage: jest.Mock
    let originalChrome: any

    beforeEach(() => {
        mockSendMessage = jest.fn()
        localStorageMock.clear()
        originalChrome = (global as any).chrome

            // Default mock chrome
            ; (global as any).chrome = {
                runtime: {
                    sendMessage: mockSendMessage,
                    lastError: null,
                }
            }
    })

    afterEach(() => {
        (global as any).chrome = originalChrome
    })

    describe("syncTokenWithExtension", () => {
        it("should store token in localStorage regardless of extension availability", async () => {
            // Simulate no extension
            delete (global as any).chrome

            await syncTokenWithExtension("token", { id: 1 })
            expect(localStorage.getItem("credlyse_auth_token")).toBe("token")
        })

        it("should send message if extension ID is stored", async () => {
            localStorage.setItem("credlyse_extension_id", "ext-id")
            mockSendMessage.mockImplementation((id, msg, cb) => cb({ success: true }))

            const success = await syncTokenWithExtension("token", { id: 1 })

            expect(success).toBe(true)
            expect(mockSendMessage).toHaveBeenCalledWith(
                "ext-id",
                expect.objectContaining({ type: "SET_AUTH_TOKEN" }),
                expect.any(Function)
            )
        })

        it("should return false if extension api not available", async () => {
            delete (global as any).chrome
            const success = await syncTokenWithExtension("token", { id: 1 })
            expect(success).toBe(false)
        })
    })

    describe("clearExtensionAuth", () => {
        it("should remove token from localStorage", async () => {
            localStorage.setItem("credlyse_auth_token", "token")
            await clearExtensionAuth()
            expect(localStorage.getItem("credlyse_auth_token")).toBeNull()
        })
    })
})
