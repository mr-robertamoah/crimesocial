import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AuthLayoutContext } from "./AuthLayoutContext";
import { useSelector } from "react-redux";
import { Unauthorized } from "../pages/Unauthorized";

export const AuthLayout = () => {
    const user = useSelector((state) => state.user)

    const layoutOutletType = useLocation().pathname.substring(1)
    const [message, setMessage] = useState<string | null>(null)

    const updateMessage = (newMessage: string | null) => {
        if (!newMessage) {
            setTimeout(() => {
                setMessage(newMessage)
            }, 1000);
            return
        }
        setMessage(newMessage)
    }
    return !user.id ? (
        <AuthLayoutContext.Provider value={{updateMessage}}>
            {message && <div className="w-full mx-auto xs:w-[70%] md:w-[50%] mt-4 rounded-lg min-h-[50px] flex justify-center bg-blue-300">
                <div className="w-fit p-2 text-blue-800 text-lg font-bold">{message} ...</div>
            </div>}
            <div className="my-20 w-full xs:max-w-[90%] sm:w-[70%] md:w-[60%] mx-auto bg-blue-100 rounded min-h-[60vh]">
                <div className="w-full bg-blue-100 relative mb-[100px]">
                    <div className="w-full absolute -top-4 flex justify-center">
                        <div className="w-fit bg-white p-2 rounded-b-md">
                            <div className="mx-auto w-fit text-center text-3xl font-bold bg-gradient-to-r 
                            text-transparent from-blue-800 to-blue-400 bg-clip-text uppercase">
                                {layoutOutletType}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-3 mt-6 w-[100%] h-full flex justify-center items-center min-h-[50vh]">
                    <Outlet/>
                </div>
            </div>
        </AuthLayoutContext.Provider>
    ) : (
        <Unauthorized who={user.username}>
            <div className="text-center">
                You are already logged in. Check out the <Link to={'/'} className="text-blue-700 p-2 hover:bg-blue-200 cursor-pointer"></Link> 
            </div>
        </Unauthorized>
    )
}