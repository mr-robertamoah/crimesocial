import { Link, useNavigate } from "react-router-dom"
import FormInput from "../components/FormInput"
import { FormLabel } from "../components/FormLabel"
import Button from "../components/partials/Button"
import { useState } from "react"
import InputError from "../components/InputError"
import { useAuthLayoutContext } from "../layouts/useAuthLayoutContext"
import { useDispatch, useSelector } from "react-redux"
import { addTokens } from "../redux/reducers/tokens.reducer"
import { addUser } from "../redux/reducers/user.reducer"

export function Register() {
    // add token and user after registration
    const { updateMessage } = useAuthLayoutContext()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)

    type dataType = {
        username: string;
        password: string;
        passwordConfirmation: string;
    }
    const [data, setData] = useState<dataType>({
        username: '',
        password: '',
        passwordConfirmation: '',
    })

    const [errors, setErrors] = useState<dataType>({
        username: '',
        password: '',
        passwordConfirmation: '',
    })

    async function submit(e) {
        e.preventDefault()

        if (!data.username) return setFormError('username', 'username is required')
        
        if (!data.password) return setFormError('password', 'password is required')
        
        if (!data.passwordConfirmation) return setFormError('passwordConfirmation', 'password confirmation is required')
        if (data.password !== data.passwordConfirmation) return setFormError('password', 'passwords do not match')

        updateMessage('loading')
        clearFormErrors()
        await axios.post('/auth/signup', data)
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
                .replace('passwordConfirmation', 'password confirmation')

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

    function clearFormData() {
        setData(() => {
            const newData: dataType = {
                username: '',
                password: '',
                passwordConfirmation: '',
            }

            return newData
        })
    }

    function clearFormErrors() {
        setErrors(() => {
            const newData: dataType = {
                username: '',
                password: '',
                passwordConfirmation: '',
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
            </div>

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

            <div className="w-full flex flex-col my-2 p-2">
                <FormLabel htmlFor='password'>password confirmation</FormLabel>
                <FormInput 
                    placeholder="enter password confirmation" 
                    type="password" 
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    value={data.passwordConfirmation}
                    onChange={(e) => setFormData('passwordConfirmation', e.target.value.trim())}
                ></FormInput>

                <InputError message={errors.passwordConfirmation} className="mt-2" />
            </div>

            <div className="w-full flex justify-end my-2 p-2">
                <Button className="">submit</Button>
            </div>

            <div className="mt-3 text-center text-gray-500">
                if you already have an account, then <Link to={'/signin'} className="text-blue-600">Sign In</Link>
            </div>
        </form>
    ) : <></>
}