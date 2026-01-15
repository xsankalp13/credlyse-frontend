import { cn } from "../utils"

describe("utils", () => {
    describe("cn", () => {
        it("should merge class names correctly", () => {
            expect(cn("class1", "class2")).toBe("class1 class2")
        })

        it("should handle conditional classes", () => {
            expect(cn("class1", true && "class2", false && "class3")).toBe("class1 class2")
        })

        it("should merge tailwind classes", () => {
            // tailwind-merge should handle conflicting classes, e.g. p-4 overrides p-2
            expect(cn("p-2", "p-4")).toBe("p-4")
        })

        it("should handle arrays and objects", () => {
            expect(cn(["class1", "class2"])).toBe("class1 class2")
            expect(cn({ class1: true, class2: false })).toBe("class1")
        })
    })
})
