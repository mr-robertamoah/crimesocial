import { Link, useNavigate } from "react-router-dom"
import FormInput from "../components/FormInput"
import { FormLabel } from "../components/FormLabel"
import Button from "../components/partials/Button"
import { useEffect, useState } from "react"
import InputError from "../components/InputError"
import { useAuthLayoutContext } from "../layouts/useAuthLayoutContext"
import { useDispatch, useSelector } from "react-redux"
import { addTokens } from "../redux/reducers/tokens.reducer"
import { addUser } from "../redux/reducers/user.reducer"

export function Login() {
    const { updateMessage } = useAuthLayoutContext()
    const [usingUsername, setUsingUsername] = useState(true)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)

    type dataType = {
        username: string;
        password: string;
        email: string;
    }
    const [data, setData] = useState<dataType>({
        username: '',
        password: '',
        email: '',
    })

    const [errors, setErrors] = useState<dataType>({
        username: '',
        password: '',
        email: '',
    })

    useEffect(() => {

        if (usingUsername) setFormData('email', '')
        else setFormData('username', '')
    }, [usingUsername])

    async function submit(e) {
        e.preventDefault()

        if (!data.username && usingUsername) return setFormError('username', 'username is required')

        if (!data.email && !usingUsername) return setFormError('email', 'email is required')
        
        if (!data.password) return setFormError('password', 'password is required')

        updateMessage('loading')
        clearFormErrors()
        await axios.post('/auth/signin', data)
            .then((res) => {
                dispatch(addTokens({
                    accessToken: res.data.access_token,
                    refreshToken: res.data.refresh_token,
                }))
                localStorage.setItem('access_token', res.data.access_token)
                localStorage.setItem('refresh_token', res.data.refresh_token)
                dispatch(addUser(res.data.user))

                navigate('/profile')
            })
            .catch((err) => {
                const messages = err.response?.data?.message
                if (messages) setFormErrorWithMessages(messages)
            })
            .finally(() => {
                updateMessage(null)
            })
    }

    function setFormErrorWithMessages(messages: Array<string> | string) {
        
        Object.keys(errors).forEach((key: string) => {
            if (typeof messages == 'string' && messages.toLowerCase().split(' ')[0] == key) {
                return setFormError(key, messages)
            }

            const message: string = messages
                .filter((m: string) => m.split(' ')[0] == key)
                .join(', ')

            setFormError(key, message)
        })
    }

    function setFormData(type: string, value: string) {
        setData((oldData: dataType) => {
            const newData: dataType = {
                ...oldData
            }

            newData[type] = value
            return newData
        })
        if (errors[type]) clearFormError(type)
    }

    function setFormError(type: string, value: string) {
        setErrors((oldData: dataType) => {
            const newData: dataType = {
                ...oldData
            }

            newData[type] = value
            return newData
        })
    }

    function clearFormErrors() {
        setErrors(() => {
            const newData: dataType = {
                username: '',
                password: '',
                email: '',
            }

            return newData
        })
    }

    function clearFormError(type: string) {
        setErrors((oldData: dataType) => {
            const newData: dataType = {
                ...oldData
            }

            newData[type] = ''

            return newData
        })
    }
    return !user.id ? (
        <form className="w-[90%] mx-auto mt-7" onSubmit={submit}>
            {usingUsername ? 
                <div className="w-full flex flex-col my-2 p-2">
                    <FormLabel htmlFor='username'>username</FormLabel>
                    <FormInput 
                        placeholder="enter username" 
                        id="username"
                        name="username"
                        value={data.username}
                        onChange={(e) => setFormData('username', e.target.value.trim())}
                    ></FormInput>

                    <InputError message={errors.username} className="mt-2" />
                </div> :

                <div className="w-full flex flex-col my-2 p-2">
                    <FormLabel htmlFor='email'>email</FormLabel>
                    <FormInput 
                        placeholder="enter email" 
                        type="email" 
                        id="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setFormData('email', e.target.value.trim())}
                    ></FormInput>

                    <InputError message={errors.email} className="mt-2" />
                </div>
            }

            <div className="w-full flex flex-col my-2 p-2">
                <FormLabel htmlFor='password'>password</FormLabel>
                <FormInput 
                    placeholder="enter password" 
                    type="password" 
                    id="password"
                    name="password"
                    value={data.password}
                    onChange={(e) => setFormData('password', e.target.value.trim())}
                ></FormInput>

                <InputError message={errors.password} className="mt-2" />
            </div>

            <div className="w-full flex justify-between my-2 p-2">
                <div 
                    className="cursor-pointer p-2 text-blue-700 hover:bg-white transition rounded"
                    onClick={() => setUsingUsername(!usingUsername)}>{usingUsername ? 'use email' : 'use username'}</div>
                <Button className="">submit</Button>
            </div>

            <div className="mt-3 text-center text-gray-500">
                if you do not have an account, then <Link to={'/signup'} className="text-blue-600">Sign Up</Link>
            </div>
        </form>
    ) : <></>
}