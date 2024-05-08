import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "./partials/Button";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../redux/reducers/user.reducer";
import { clearTokens } from "../redux/reducers/tokens.reducer";
import { useMainLayoutContext } from "../layouts/useMainLayoutContext";

function Navbar() {
    const [show, setShow] = useState(false)
    const [logoutText, setLogoutText] = useState('logout')
    const navigate = useNavigate()
    const pathname = useLocation().pathname
    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const {callAlert} = useMainLayoutContext()
    const [username, setUsername] = useState('')

    useEffect(() => {
        setUsername(user.username)
    }, [user])
    
    function navigateTo(path: string) {
        setShow(false)
        navigate(path)
    }

    async function logout() {
        setLogoutText('logging out ...')
        await axios.post('/auth/logout').then((res) => {
            dispatch(clearTokens())
            localStorage.setItem('access_token', '')
            localStorage.setItem('refresh_token', '')
            dispatch(removeUser())
            callAlert({
                type: 'success',
                message: 'you have been logged out successfully.',
                show: true,
            })
            setTimeout(() => {
                navigate('/')
            }, 1000);
        })
        .catch((err) => {
            console.log(err)
            callAlert({
                type: 'failed',
                message: 'logging out was unsuccessfully, please try again later.',
                show: true,
            })
        })
        .finally(() => {
            setLogoutText('logout')
            setUsername(user.username)
        })
    }

    return (
        <nav className="bg-blue-300 text-center xs:flex justify-center xs:justify-between items-center pb-2 xs:pb-0">
            <div onClick={() => navigateTo('/')} className="text-2xl inline-flex uppercase p-2 mb-3 cursor-pointer">
                <div className="bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text font-bold text-transparent">Crime</div>
                <div className="translate-y-1 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text font-bold text-transparent">Social</div>
            </div>

            {user.id ? 
                <>
                    <div className="hidden xs:flex mx-3 cursor-pointer relative">
                        <div
                            onClick={() => setShow(!show)}
                            className="mr-1 max-w-[150px] text-ellipsis text-nowrap overflow-hidden text-gray-800">
                            {username}</div>
                        <div className="text-blue-700" onClick={() => setShow(!show)}>
                            {!show && <div>▼</div>}
                            {show && <div>▲</div>}
                        </div>
                        { show && <div className="absolute top-9 -right-2 z-[1000]">
                            <div className="p-2 bg-blue-100 min-w-[200px] rounded-lg w-full text-center">
                                {pathname != '/profile' && 
                                <div onClick={() => navigateTo('/profile')}
                                    className="text-gray-500 cursor-pointer mb-2 p-2 rounded hover:bg-white hover:text-gray-700">
                                    profile
                                </div>}
                                {(pathname != '/admin' && user.admin) && 
                                <div onClick={() => navigateTo('/admin')}
                                    className="text-gray-500 cursor-pointer mb-2 p-2 rounded hover:bg-white hover:text-gray-700">
                                    admin dashboard
                                </div>}
                                <div
                                    onClick={async ()=> {
                                        setShow(false)
                                        setUsername('logging out ...')
                                        await logout()
                                    }}
                                    className="text-gray-500 cursor-pointer p-2 rounded hover:bg-white hover:text-gray-700">
                                    logout</div>
                            </div>
                            <div
                                onClick={() => setShow(false)}
                                className="absolute top-0 -right-4 w-[1000px] h-[80vh] bg-transparent -z-10"
                            ></div>
                        </div>}
                    </div>
                    <div className="block xs:hidden cursor-pointer relative text-center w-full">
                        <div className="flex justify-center">
                            <div className="mr-1 text-ellipsis text-nowrap overflow-hidden text-gray-800">{user.username}</div>
                            <div className="text-blue-700" onClick={() => setShow(!show)}>
                                {!show && <div>▼</div>}
                                {show && <div>▲</div>}
                            </div>
                        </div>
                        { show && <div className="my-2 z-[1000]">
                            <div className="p-2 bg-blue-100 rounded-lg w-[90%] mx-auto text-center mb-2">
                                {pathname != '/profile' && <div onClick={() => navigateTo('/profile')}
                                    className="text-gray-500 cursor-pointer hover:bg-white hover:text-gray-700">
                                    profile
                                </div>}
                                {(pathname != '/admin' && user.admin) && <div onClick={() => navigateTo('/admin')}
                                    className="text-gray-500 cursor-pointer hover:bg-white hover:text-gray-700">
                                    admin dashboard
                                </div>}
                                <div
                                    onClick={logout}
                                    className="text-gray-500 cursor-pointer hover:bg-white hover:text-gray-700">
                                    {logoutText}</div>
                            </div>
                        </div>}
                    </div>
                </> :
                <>
                    {!['/signin', '/signup'].includes(pathname) && <div className="xs:mx-3 flex xs:justify-start justify-around mx-auto">
                        <Button className="mr-2" onClick={() => navigateTo('signin')}>sign in</Button>
                        <Button onClick={() => navigateTo('signup')}>sign up</Button>
                    </div>}
                </>
            }
        </nav>
    )
  }
  
  export default Navbar;