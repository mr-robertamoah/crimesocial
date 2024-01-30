import { createContext } from "react"

export interface AlertDataType {
    type: string;
    show: boolean;
    message: string;
}

export const MainLayoutContext = createContext((data: AlertDataType) => {});