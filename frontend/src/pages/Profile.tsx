import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export function Profile() {
    const user = useSelector((state) => state.user)
    const navigate = useNavigate()
    
    useEffect(() => {
        if (user) return navigate('/')
    }, [user, navigate])

    return (
        <div>profile</div>
    )
}