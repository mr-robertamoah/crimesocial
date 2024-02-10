import { Link } from "react-router-dom";
import { Unauthorized } from "./Unauthorized";
import { useSelector } from "react-redux";

export function Admin() {
    const user = useSelector((state) => state.user)
    
    return user.admin ? (
        <div>Admin Page</div>
    ) : <Unauthorized>
        <div className="text-center flex justify-center items-center">You are not authorized to be on this page. You can check out <Link to={'/'} className="cursor-pointer p-2 hover:bg-blue-300 rounded">Home Page</Link></div>
    </Unauthorized>
}