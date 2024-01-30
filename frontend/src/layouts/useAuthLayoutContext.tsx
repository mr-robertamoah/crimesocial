import { useContext } from "react"
import { AuthLayoutContext } from "./AuthLayoutContext"

export const useAuthLayoutContext = () => {
    return useContext(AuthLayoutContext)
}