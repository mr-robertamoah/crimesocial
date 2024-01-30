import { Link, useLocation } from "react-router-dom";

export function Error() {
    const pathname = useLocation().pathname
    return (
        <>
            <div
                className="mt-20 text-center text-3xl font-bold bg-gradient-to-r 
                text-transparent from-slate-800 to-slate-300 bg-clip-text mb-14"
            >Error Page</div>
            <div className="text-center text-gray-500 mb-3">{pathname} page you sort cannot be found.</div>
            <div className="text-center text-gray-500">
                We recommend you go to the <Link to={'/'} className="text-blue-400">Home page</Link>
            </div>
        </>
    )
}