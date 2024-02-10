import useAxiosWithToken from "./useAxiosWithToken"
import { addTokens } from "../redux/reducers/tokens.reducer"
import { useDispatch } from "react-redux"

const useRefreshToken = () => {
    let axiosWithToken = useAxiosWithToken('refresh_token')
    const dispatch = useDispatch()

    async function refreshTokens() {
        await axiosWithToken.post('/auth/refresh-token')
            .then((res) => {
                dispatch(addTokens({
                    refreshTokens: res.data.refresh_token,
                    accessTokens: res.data.access_token,
                }))
                
                localStorage.setItem('access_token', res.data.access_token)
                localStorage.setItem('refresh_token', res.data.refresh_token)

                axiosWithToken.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`
            })
            .catch((err) => {
                console.log(err)
                if (err.code == "ERR_NETWORK") return
                
                localStorage.setItem('access_token', '')
                localStorage.setItem('refresh_token', '')

                axiosWithToken.defaults.headers.common['Authorization'] = ``
            })
        return axiosWithToken
    }

    return refreshTokens
}

export default useRefreshToken