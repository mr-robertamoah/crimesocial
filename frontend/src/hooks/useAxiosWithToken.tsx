import { useEffect } from "react"

const useAxiosWithToken = (type: string) => {

    useEffect(() => {
        const token = localStorage.getItem(type)

        if (!token) return axios
    
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }, [])


    return axios
}

export default useAxiosWithToken