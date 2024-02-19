import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AlertDataType, MainLayoutContext } from "./MainLayoutContext";
import Alert from "../components/Alert.";
import { useEffect, useState } from "react";
import useAxiosWithToken from "../hooks/useAxiosWithToken";
import { useDispatch, useSelector } from "react-redux";
import useRefreshToken from "../hooks/useRefreshToken";
import { addUser, removeUser } from "../redux/reducers/user.reducer";
import { Loader } from '@googlemaps/js-api-loader';

export function MainLayout() {
    const axios = useAxiosWithToken('access_token')
    const dispatch = useDispatch()
    const refreshTokens = useRefreshToken()
    const pathname = useLocation().pathname
    const user = useSelector(state => state.user)
    const navigate = useNavigate()
    const [mapDetails, setMapDetails] = useState<{
        Map: google.maps.Map | null | undefined;
        Marker: google.maps.Marker | null | undefined;
    }>({
        Map: null,
        Marker: null
    })

    useEffect(() => {
        if (!user.id) {
            getUser()
            localStorage.setItem('pathname', pathname)
        }
    }, [pathname, user])

    useEffect(() => {
        initMap()
    }, [])
    
    async function initMap() {
        const loader = new Loader({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            version: 'weekly'
        })
        let Map, Marker;

        await loader.importLibrary('maps')
        .then(m => {
            console.log(m, 'map')
            // new m.Map(div, {
                
            // })
            Map = m.Map
        })
        .catch(err => {
            console.log(err)
        })
            
        await loader.importLibrary('marker')
        .then(m => {
            console.log(m, 'marker')
            Marker = m.Marker
        })
        .catch(err => {
            console.log(err)
        })

        setMapDetails({
            Map,
            Marker
        })
    }

    async function getUser() {
        await axios.get('/user')
        .then((res) => {
            dispatch(addUser(res.data))
            stayInCurrentPath()
        })
        .catch(async (err) => {
            console.log(err)
            dispatch(removeUser())
            const newAxios = await refreshTokens()
            if (newAxios.defaults.headers.common['Authorization'].length)
                stayInCurrentPath()
        })
    }

    function stayInCurrentPath() {

        const path = localStorage.getItem('pathname')
        navigate(path ? path : '/')
    }

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
        <MainLayoutContext.Provider value={{callAlert, mapDetails}}>
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