import { createContext } from "react"

export interface AlertDataType {
    type: string;
    show: boolean;
    message: string;
}

export const MainLayoutContext = createContext({
    callAlert: (data: AlertDataType) => {},
    mapDetails: {
        Map: null,
        Marker: null
    }
});