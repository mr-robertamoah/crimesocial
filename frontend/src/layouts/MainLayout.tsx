import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AlertDataType, MainLayoutContext } from "./MainLayoutContext";
import Alert from "../components/Alert.";
import { useState } from "react";

export function MainLayout() {
    const defaultAlertData: AlertDataType = {
        type: 'success',
        show: false,
        message: ''
    }
    const [alertData, setAlertData] = useState(defaultAlertData)

    const callAlert = (data: AlertDataType) => {
        setAlertData({...data})
    }

    function clearAlertData() {
        setAlertData({...defaultAlertData})
    }

    return (
        <MainLayoutContext.Provider value={{callAlert}}>
            <Navbar/>
            <Alert
                show={alertData.show}
                type={alertData.type}
                onDisappear={() => clearAlertData()}
            >{alertData.message}</Alert>
            <Outlet/>
        </MainLayoutContext.Provider>
    )
}