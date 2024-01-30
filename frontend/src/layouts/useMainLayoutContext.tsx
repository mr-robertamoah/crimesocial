import { useContext } from "react"
import { MainLayoutContext } from "./MainLayoutContext"

export const useMainLayoutContext = () => {
    return useContext(MainLayoutContext)
}