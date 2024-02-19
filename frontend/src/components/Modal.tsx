import { ReactNode } from "react";

export default function Modal(
    { show = true, children = null, hasClose = true, title = null, close = null, className = '' } : 
    { 
        show: boolean, children: ReactNode | null; hasClose: boolean; title: string | null; 
        close: (() => void) | null; className: string;
    }
) {

    function clickedClose() {
        if (!close) return

        close()
    }

    function clickedBackground() {
        if (close && !hasClose) {
            close()
        }
    }
    return (
        <div
            onClick={clickedBackground}
            className={(show ? `` : `invisible`) + ` ${className} bg-gray-300 bg-opacity-65 transition-all duration-300 ease-in-out absolute top-0 w-full left-0 h-[100vh] flex justify-center items-center`}>
            <div className="w-[90%] xs:w-[75%] md:w-[50%] lg:w-[40%] bg-white h-[70vh] relative rounded-lg">
                {hasClose && <div onClick={clickedClose}
                    className="uppercase cursor-pointer text-center absolute rounded-full h-[25px] w-[25px] -top-2 
                        border-gray-700 flex justify-center items-center border-2 bg-white p-2 -right-2">
                        <div>X</div>        
                    </div>}
                {title && <div className="mt-5 mb-3">
                    <div
                        className="uppercase font-bold text-2xl bg-gradient-to-r from-blue-700 to-sky-500 w-fit mx-auto text-transparent bg-clip-text">
                        {title}
                    </div>
                    <hr />
                </div>}
                <div className={(show ? `` : `invisible`) + " h-[80%] transition-all duration-100 ease-in my-5 flex justify-center overflow-hidden overflow-y-auto w-[90%] mx-auto"}>
                    {children}
                </div>
            </div>
        </div>
    )
}