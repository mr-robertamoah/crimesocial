import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import ProfileInput from "../components/ProfileInput"
import InputError from "../components/InputError"
import Button from "../components/partials/Button"
import { Unauthorized } from "./Unauthorized"
import ProfileSelect from "../components/ProfileSelect"
import * as axiosWithBase from 'axios'
import { addCountries } from "../redux/reducers/countries.reducer"
import useAxiosWithToken from "../hooks/useAxiosWithToken"
import { ImageChange } from "../components/ImageChange"
import { DP } from "../components/DP"
import { useMainLayoutContext } from "../layouts/useMainLayoutContext"
import { StatusCodes } from "../constants"
import { addUser, removeUser } from "../redux/reducers/user.reducer"
import { clearTokens } from "../redux/reducers/tokens.reducer"
import Loader from "../components/Loader"
import useRefreshToken from "../hooks/useRefreshToken"

export function Profile() {
    const user = useSelector((state) => state.user)
    const navigate = useNavigate()
    const [fullName, setFullName] = useState('')
    const dispatch = useDispatch()
    const axiosWithToken = useAxiosWithToken('access_token')

    const defaultErrors = {
        email: '',
        firstName: '',
        lastName: '',
        otherNames: '',
        gender: "",
        country: '',
        avatarUrl: '',
        oldPassword: '',
        newPassword: '',
        newPasswordConfirmation: '',
    }
    const defaultPasswordData = {
        oldPassword: '',
        newPassword: '',
        newPasswordConfirmation: '',
    }
    const defaultProfileData = {
        email: '',
        firstName: '',
        lastName: '',
        otherNames: '',
        gender: "UNDISCLOSED",
        country: '',
        avatarUrl: '',
        deleteAvatarUrl: false,
        avatarFile: null,
    }
    const defaultLoader = { show: false, type: '' }
    
    const [avatar, setAvatar] = useState({url: '', name: ''})
    const [profileData, setProfileData] = useState(defaultProfileData)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordData, setPasswordData] = useState(defaultPasswordData)
    const [errors, setErrors] = useState(defaultErrors)
    const [loader, setLoader] = useState(defaultLoader)
    const countries = useSelector(state => state.countries)
    const {callAlert} = useMainLayoutContext()
    const refreshTokens = useRefreshToken()
    
    useEffect(() => {
        setFullName(`${user.lastName ?? ''} ${user.firstName ?? ''} ${user.otherNames ?? ''}`.trim())
        setAvatar({name: '',  url: user.avatarUrl})
        getCountries()

        setProfileData((oldData) => {
            const newData = defaultProfileData
            const objectKeys = Object.keys(profileData)

            Object.keys(user).forEach(key => {
                if (objectKeys.includes(key))
                  newData[key] = user[key] ?? ''
            })

            return newData
        })
    }, [user])

    function changeAvatar(file: Blob|null) {
        setFormProfileData('avatarFile', file)
        if (!file) {
            return setAvatar({name: '',  url: user.avatarUrl})
        }

        setAvatar((old) => {
            return {name: file?.name ?? '',  url: URL.createObjectURL(file)}
        })
    }

    function deleteAvatar() {
        setAvatar({name: '', url: ''})
        setFormProfileData('deleteAvatarUrl', true)
    }

    function restoreAvatar() {
        setAvatar({name: '',  url: user.avatarUrl})
        setFormProfileData('deleteAvatarUrl', false)
    }

    async function getCountries() {
        if (countries.length) return

        await new axiosWithBase.Axios({
            baseURL: `${import.meta.env.VITE_COUNTRIES_API}`,
        })
        .get('/countries/flag/images')
        .then(res => {

            const retrievedCountries = JSON.parse(res.data).data

            dispatch(addCountries(retrievedCountries.map(c => c.name)))
        })
        .catch(err => {
            console.log(err)
        })
    }

    function getProfileFormData() {
        const profileFormData = new FormData()

        profileFormData.append('userId', user.id)

        if (profileData.firstName !== user.firstName)
            profileFormData.append('firstName', profileData.firstName)

        if (profileData.lastName !== user.lastName)
            profileFormData.append('lastName', profileData.lastName)

        if (profileData.otherNames !== user.otherNames)
            profileFormData.append('otherNames', profileData.otherNames)

        if (profileData.gender !== user.gender)
            profileFormData.append('gender', profileData.gender)

        if (profileData.email !== user.email)
            profileFormData.append('email', profileData.email)

        if (profileData.country !== user.country)
            profileFormData.append('country', profileData.country)

        if (profileData.deleteAvatarUrl)
            profileFormData.append('deleteAvatarUrl', profileData.deleteAvatarUrl ? 'true' : 'false')

        if (profileData.avatarFile)
            profileFormData.append('file', profileData.avatarFile)

        return profileFormData
    }

    async function submitProfileChange(e) {
        if (e) e.preventDefault()
        clearFormErrors()
        if (loader.show) return

        if (!profileData.gender) profileData.gender = "UNDISCLOSED"

        const profileFormData = getProfileFormData()

        setLoader({ show: true, type: 'profile' })
        await axiosWithToken.post('/user/profile', profileFormData)
            .then((res) => {
                dispatch(addUser(res.data))
                callAlert({
                    show: true,
                    message: "Updating of profile was successful.",
                    type: 'success'
                })
            })
            .catch(async (err) => {
                console.log(err)
                if (
                    err.response?.status == StatusCodes.UNAUTHORIZED &&
                    err.response?.data?.message == 'Unauthorized'
                ) return await removeUserAndGoToSignInPage(submitProfileChange)

                const messages = err.response?.data?.message
                if (messages) {
                    return setFormErrorWithMessages(messages)
                }
                callAlert({
                    show: true,
                    message: "Updating of profile was unsuccessful. Please try again shortly.",
                    type: 'failed'
                })
            })
            .finally(() => {
                setLoader(defaultLoader)
            })
    }

    async function removeUserAndGoToSignInPage(callback: ((e) => Promise<void>) | null) {
        callAlert({
            show: true,
            message: "You are unauthorized, please sign in.",
            type: 'failed'
        })

        dispatch(removeUser())
        dispatch(clearTokens())
        // localStorage.clear()
        const newAxios = await refreshTokens()
        if (newAxios.defaults.headers.common['Authorization'].length && callback)
            return await callback(null)
        return navigate('/signin')
    }

    async function submitPasswordChange(e) {
        if (e) e.preventDefault()
        clearFormErrors()
        if (loader.show) return

        if (!passwordData.oldPassword) setFormError('oldPassword', 'old password is required')
        if (errors.oldPassword) setFormError('oldPassword', '')
        
        if (!passwordData.newPassword) setFormError('newPassword', 'new password is required')
        if (errors.newPassword) setFormError('newPassword', '')
        
        if (!passwordData.newPasswordConfirmation) setFormError('newPasswordConfirmation', 'new password confirmation is required')
        if (passwordData.newPassword !== passwordData.newPasswordConfirmation)
            setFormError('newPasswordConfirmation', 'new password confirmation must match the new password')
        if (errors.newPasswordConfirmation) setFormError('newPasswordConfirmation', '')

        if (errorsIsNotEmpty()) return

        setLoader({ show: true, type: 'password' })
        await axiosWithToken.post('/auth/change-password', passwordData)
            .then((res) => {
                console.log(res)
                callAlert({
                    show: true,
                    message: "Password was successfully changed.",
                    type: 'success'
                })
                setPasswordData(defaultPasswordData)
            })
            .catch(async (err) => {
                console.log(err)
                if (
                    err.response?.status == StatusCodes.UNAUTHORIZED &&
                    err.response?.data?.message == 'Unauthorized' 
                ) return await removeUserAndGoToSignInPage(submitPasswordChange)

                const messages = err.response?.data?.message
                if (messages) {
                    return setFormErrorWithMessages(messages)
                }

                callAlert({
                    show: true,
                    message: "Change of password failed. Try again shortly.",
                    type: 'failed'
                })
            })
            .finally(() => {
                setLoader(defaultLoader)
            })
    }

    async function submitAccountDeletion(e) {
        if (e) e.preventDefault()
        clearFormErrors()
        if (loader.show) return

        setLoader({ show: true, type: 'deletion' })
        await axiosWithToken.post('/auth/delete-account', { userId: user.id })
            .then((res) => {
                console.log(res)
                callAlert({
                    show: true,
                    message: "Account was successfully deleted.",
                    type: 'success'
                })
                dispatch(removeUser())
                dispatch(clearTokens())
                localStorage.clear()
                navigate('/')
            })
            .catch(async (err) => {
                console.log(err)
                if (
                    err.response?.status == StatusCodes.UNAUTHORIZED &&
                    err.response?.data?.message == 'Unauthorized' 
                ) return await removeUserAndGoToSignInPage(submitPasswordChange)

                const messages = err.response?.data?.message
                if (messages) {
                    return setFormErrorWithMessages(messages)
                }

                callAlert({
                    show: true,
                    message: "Deletion of account failed. Try again shortly.",
                    type: 'failed'
                })
            })
            .finally(() => {
                setLoader(defaultLoader)
            })
    }
    
    function errorsIsNotEmpty() : boolean {
        let notEmpty = true

        Object.keys(errors).forEach((key: string) => {
            if (!errors[key]) notEmpty = false
        })

        return notEmpty
    }

    function setFormErrorWithMessages(messages: Array<string> | string, isError: boolean = true) {
        callAlert({
            show: true,
            message: typeof messages == 'string' ? messages : messages[0],
            type: isError ? 'failed' : 'success'
        })
    
        Object.keys(errors).forEach((key: string) => {
            if (typeof messages == 'string' && messages.toLowerCase().split(' ')[0] == key) {
                return setFormError(key, messages)
            }

            if (typeof messages == 'string') {
                return callAlert({
                    show: true,
                    type: 'failed',
                    message: messages
                })
            }

            const message: string = messages
                .filter((m: string) => m.split(' ')[0].toLowerCase() == key.toLowerCase())
                .join(', ')

            setFormError(key, message)
        })
    }

    function setFormProfileData(type: string, value: string|boolean|Blob|null) {
        setProfileData((oldData) => {
            const newData = {
                ...oldData
            }

            newData[type] = value
            return newData
        })

        if (errors[type]) clearFormError(type)
    }

    function setFormPasswordData(type: string, value: string) {
        setPasswordData((oldData) => {
            const newData = {
                ...oldData
            }

            newData[type] = value
            return newData
        })

        if (errors[type]) clearFormError(type)
    }

    function clearFormError(type: string) {
        setErrors((oldData) => {
            const newData = {
                ...oldData
            }

            newData[type] = ''

            return newData
        })
    }

    function setFormError(type: string, value: string) {
        setErrors((oldData: dataType) => {
            const newData: dataType = {
                ...oldData
            }

            value = value.toLowerCase()
            if (value.includes('newpassword'))
                value = value.replaceAll('newpassword', 'new password')
            
            if (value.includes('oldpassword'))
                value = value.replaceAll('oldpassword', 'old password')
            
            if (value.includes('passwordconfirmation'))
                value = value.replaceAll('passwordconfirmation', 'password confirmation')
            
            newData[type] = value
            return newData
        })
    }

    function clearFormErrors() {
        setErrors(defaultErrors)
    }

    return user.id ? (
        <>
            <div className="bg-gray-200">
                <div className="mt-10 mb-4 flex justify-center w-full p-2">
                    <div className="w-fit text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-400 text-transparent bg-clip-text">Hi {fullName}</div>
                </div>
                <div className="text-center text-blue-700">Welcome to your Profile</div>
                <div className="my-5">

                    <div className="mx-5">
                        <DP username={user.username} avatarUrl={user.avatarUrl} size={100}></DP>
                    </div>
                </div>
            </div>

            <div className="bg-gray-200 my-20 w-[90%] mx-auto xs:w-[80%] md:w-[70%] p-5 rounded-lg">
                <div className="text-gray-700 capitalize my-4 text-center font-bold">Update Profile Information</div>
                <Loader switchAppearance={loader.show && loader.type == 'profile'}>
                    updating profile of {user.username}...
                </Loader>
                <form className="max-w-[400px] mx-auto" onSubmit={submitProfileChange}>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ImageChange
                            id="avatarUrl"
                            name="avatarUrl"
                            avatar={avatar}
                            onChange={(file) => changeAvatar(file)}
                            onDelete={deleteAvatar}
                            onRestore={restoreAvatar}
                            hasInitialAvatar={user.avatarUrl}
                        ></ImageChange>

                        <InputError message={errors.avatarUrl} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileInput
                            placeholder="enter your first name" 
                            type="firstName" 
                            id="firstName"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setFormProfileData('firstName', e.target.value.trim())}
                        ></ProfileInput>

                        <InputError message={errors.firstName} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileInput
                            placeholder="enter your last name" 
                            type="lastName" 
                            id="lastName"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setFormProfileData('lastName', e.target.value.trim())}
                        ></ProfileInput>

                        <InputError message={errors.lastName} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileInput
                            placeholder="enter any other names" 
                            type="otherNames" 
                            id="otherNames"
                            name="otherNames"
                            value={profileData.otherNames}
                            onChange={(e) => setFormProfileData('otherNames', e.target.value.trim())}
                        ></ProfileInput>

                        <InputError message={errors.otherNames} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileInput
                            placeholder="enter your email" 
                            type="email" 
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={(e) => setFormProfileData('email', e.target.value.trim())}
                        ></ProfileInput>

                        <InputError message={errors.email} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileSelect
                            initialOption="select your gender" 
                            id="gender"
                            name="gender"
                            options={['undisclosed', 'male', 'female']}
                            optionClassName={''}
                            value={profileData.gender}
                            onChange={(e) => setFormProfileData('gender', e.target.value.trim())}
                        ></ProfileSelect>

                        <InputError message={errors.gender} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileSelect
                            initialOption="select your country" 
                            id="country"
                            name="country"
                            options={countries}
                            optionClassName={'capitalize'}
                            value={profileData.country}
                            onChange={(e) => setFormProfileData('country', e.target.value.trim())}
                        ></ProfileSelect>

                        <InputError message={errors.country} className="mt-2" />
                    </div>

                    <div className="w-full flex justify-end my-4 p-2">
                        <Button className="">update</Button>
                    </div>
                </form>
            </div>

            <div className="bg-gray-200 my-20 w-[90%] mx-auto xs:w-[80%] md:w-[70%] p-5 rounded-lg">
                <div className="text-gray-700 capitalize my-4 text-center font-bold">Change Password</div>
                <Loader switchAppearance={loader.show && loader.type == 'password'}>
                    changing password of {user.username}...
                </Loader>
                <form className="max-w-[400px] mx-auto" onSubmit={submitPasswordChange}>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileInput
                            placeholder="enter old password" 
                            type={showPassword ? "text" : "password"} 
                            id="oldPassword"
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={(e) => setFormPasswordData('oldPassword', e.target.value.trim())}
                        ></ProfileInput>

                        <InputError message={errors.oldPassword} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileInput
                            placeholder="enter new password" 
                            type={showPassword ? "text" : "password"}  
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) => setFormPasswordData('newPassword', e.target.value.trim())}
                        ></ProfileInput>

                        <InputError message={errors.newPassword} className="mt-2" />
                    </div>
                    <div className="w-full flex flex-col my-2 p-2">
                        <ProfileInput
                            placeholder="enter confirmation of new password" 
                            type={showPassword ? "text" : "password"}  
                            id="newPasswordConfirmation"
                            name="newPasswordConfirmation"
                            value={passwordData.newPasswordConfirmation}
                            onChange={(e) => setFormPasswordData('newPasswordConfirmation', e.target.value.trim())}
                        ></ProfileInput>

                        <InputError message={errors.newPasswordConfirmation} className="mt-2" />
                    </div>

                    <div className="w-full flex justify-between my-4 p-2">
                        <div
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-sm p-2 rounded hover:bg-blue-300 cursor-pointer transition hover:text-white">{showPassword ? 'hide passwords' : 'show passwords'}</div>
                        <Button className="">change</Button>
                    </div>
                </form>
            </div>

            <div className="bg-gray-200 my-20 w-[90%] mx-auto xs:w-[80%] md:w-[70%] p-5 rounded-lg">
                <div className="text-gray-700 capitalize my-4 text-center font-bold">Delete Account</div>
                <Loader switchAppearance={loader.show && loader.type == 'deletion'}>
                    deleting {user.username}'s account ...
                </Loader>
                <form className="max-w-[400px] mx-auto" onSubmit={submitAccountDeletion}>
                    <div className="w-full flex text-center justify-center text-red-700 my-2 p-2">
                        <div className="font-bold">Note that you will lose your user account with all other entities associated with it</div>
                    </div>

                    <div className="w-full flex justify-end my-4 p-2">
                        <Button className="bg-red-400 text-red-800 outline-red-800">delete</Button>
                    </div>
                </form>
            </div>
        </>
    ) : <Unauthorized>
        <div className="text-gray-700 text-center">You need to be <Link to={'/signin'} className="text-blue-700 rounded p-2 cursor-pointer hover:bg-blue-200">signed in</Link> to make use of this page.</div>
    </Unauthorized>
}