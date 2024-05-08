import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AgencyType } from "../types"
import { useDispatch, useSelector } from "react-redux"
import { DP } from "../components/DP"
import Button from "../components/partials/Button"
import Loader from "../components/Loader"
import useAxiosWithToken from "../hooks/useAxiosWithToken"
import ProfileInput from "../components/ProfileInput"
import InputError from "../components/InputError"
import { ImageChange } from "../components/ImageChange"
import ProfileSelect from "../components/ProfileSelect"
import { removeUser } from "../redux/reducers/user.reducer"
import { clearTokens } from "../redux/reducers/tokens.reducer"
import useRefreshToken from "../hooks/useRefreshToken"
import { useMainLayoutContext } from "../layouts/useMainLayoutContext"
import ProfileTextbox from "../components/ProfileTextbox"
import { debounce } from "lodash"
import { StatusCodes } from "../constants"

export default function AgencyProfile() {
    const Mode = { normal: 'normal', edit: 'edit' }
    const defaultLoader = { show: false, type: '' }
    const defaultErrors = {
        email: '',
        name: '',
        about: '',
        phoneNumber: '',
        type: '',
        avatarUrl: '',
        agents: '',
    }
    const defaultProfileData = {
        email: '',
        name: '',
        about: '',
        phoneNumber: '',
        type: '',
        avatarUrl: '',
        users: [],
        usersaddedAsAgents: [],
        removedAgents: [],
        deleteAvatarUrl: false,
        avatarFile: null,
    }

    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [avatar, setAvatar] = useState({url: '', name: ''})
    const [profileData, setProfileData] = useState(defaultProfileData)
    const [errors, setErrors] = useState(defaultErrors)
    const [mode, setMode] = useState('')
    const [agency, setAgency] = useState<AgencyType | null>(null)
    const user = useSelector((state) => state.user)
    const [loader, setLoader] = useState(defaultLoader)
    const axiosWithToken = useAxiosWithToken('access_token')
    const {callAlert} = useMainLayoutContext()
    const refreshTokens = useRefreshToken()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        getAgency()
        setMode(Mode.normal)
    }, [])

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

    async function getAgency() {
        if (loading) return

        setLoading(true)
        await axios.get(`agency/${id}`)
            .then((res) => {
                console.log(res)
                setAgency(res.data)
            })
            .catch((res) => {
                console.log(res)
            })
            .finally(() => {
                setLoading(false)
            })
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

    function clearFormErrors() {
        setErrors(defaultErrors)
    }

    function getProfileFormData() {
        const profileFormData = new FormData()

        profileFormData.append('userId', user.id)

        if (profileData.name !== user.name)
            profileFormData.append('name', profileData.name)

        if (profileData.about !== user.about)
            profileFormData.append('about', profileData.about)

        if (profileData.type !== user.type)
            profileFormData.append('type', profileData.type)

        if (profileData.phoneNumber !== user.phoneNumber)
            profileFormData.append('phoneNumber', profileData.phoneNumber)

        if (profileData.email !== user.email)
            profileFormData.append('email', profileData.email)

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

        if (!profileData.type) profileData.type = "GOVERNMENT"

        const profileFormData = getProfileFormData()

        setLoader({ show: true, type: 'profile' })
        await axiosWithToken.post(`agency/${agency?.id}`, profileFormData)
            .then((res) => {
                setAgency(res.data)
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
    
    async function submitAddAgents(e) {
        if (e) e.preventDefault()
        clearFormErrors()
        if (loader.show) return

        setLoader({ show: true, type: 'agents' })
        await axiosWithToken.post(`agency/${agency?.id}/update-agents`, {
            potentialAgents: profileData.usersaddedAsAgents.map(user => {
                return {
                    userId: user.id,
                    type: 'NORMAL'
                }
            }),
            removedAgents: profileData.removedAgents.map(agent => agent.id)
        })
            .then((res) => {
                setAgency(res.data)
                callAlert({
                    show: true,
                    message: "Successfully added agents to this agency.",
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
                    message: "Adding agents to agency was unsuccessful. Please try again shortly.",
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
        const newAxios = await refreshTokens()
        if (newAxios.defaults.headers.common['Authorization'].length && callback)
            return await callback(null)
        return navigate('/signin')
    }

    const debounceSearch = debounce(async () => {
        await searchUsers()
    }, 1000)

    async function searchUsers() {
        await axiosWithToken.get(`users`)
            .then((res) => {
                console.log(res)
                setProfileData((oldData) => {
                    const newData = { ...oldData }
                    const filteredArray = res.data.filter((p) => newData.users.some(u => u.id !== p.id))
                    newData.users = [...filteredArray]
                    return newData
                })
            })
    }

    async function submitAccountDeletion(e) {
        if (e) e.preventDefault()
        if (!agency) return

        clearFormErrors()
        if (loader.show) return

        setLoader({ show: true, type: 'deletion' })
        await axiosWithToken.delete(`/agency/${agency.id}`)
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

    return (
        <>
            {loading ? 
                <div className="w-full h-screen bg-blue-100 flex justify-center items-center">
                    <div className="font-bold">getting details of agency with id: {id}...</div>
                </div> :
                (agency && 
                <div>
                    <div className="bg-gray-200">
                        <div className="mt-10 mb-4 flex justify-center w-full p-2">
                            <div className="w-fit text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-400 text-transparent bg-clip-text">Hi {fullName}</div>
                        </div>
                        <div className="text-center text-blue-700">Welcome to your Profile</div>
                        <div className="my-5">

                            <div className="mx-5">
                                <DP username={agency?.name} avatarUrl={agency?.avatarUrl ?? ''} size={100}></DP>
                            </div>
                        </div>
                    </div>
                    { mode == Mode.normal ? 
                        <div></div> :
                        <div>

                            <div className="bg-gray-200 my-20 w-[90%] mx-auto xs:w-[80%] md:w-[70%] p-5 rounded-lg">
                                <div className="text-gray-700 capitalize my-4 text-center font-bold">Update Profile Information</div>
                                <Loader switchAppearance={loader.show && loader.type == 'profile'}>
                                    updating profile of agency...
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
                                            placeholder="enter name of agency" 
                                            type="name" 
                                            id="name"
                                            name="name"
                                            value={profileData.name}
                                            onChange={(e) => setFormProfileData('name', e.target.value.trim())}
                                        ></ProfileInput>

                                        <InputError message={errors.name} className="mt-2" />
                                    </div>
                                    <div className="w-full flex flex-col my-2 p-2">
                                        <ProfileTextbox
                                            placeholder="what is it about?" 
                                            type="about" 
                                            id="about"
                                            name="about"
                                            value={profileData.about}
                                            onChange={(e) => setFormProfileData('about', e.target.value.trim())}
                                        ></ProfileTextbox>

                                        <InputError message={errors.about} className="mt-2" />
                                    </div>
                                    <div className="w-full flex flex-col my-2 p-2">
                                        <ProfileInput
                                            placeholder="enter phone number of agency" 
                                            type="phone" 
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={profileData.phoneNumber}
                                            onChange={(e) => setFormProfileData('phoneNumber', e.target.value.trim())}
                                        ></ProfileInput>

                                        <InputError message={errors.phoneNumber} className="mt-2" />
                                    </div>
                                    <div className="w-full flex flex-col my-2 p-2">
                                        <ProfileInput
                                            placeholder="enter email of agency" 
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
                                            initialOption="type of agency" 
                                            id="type"
                                            name="type"
                                            options={['government', 'profit', 'nonprofit']}
                                            optionClassName={''}
                                            value={profileData.type}
                                            onChange={(e) => setFormProfileData('type', e.target.value.trim())}
                                        ></ProfileSelect>

                                        <InputError message={errors.type} className="mt-2" />
                                    </div>

                                    <div className="w-full flex justify-end my-4 p-2">
                                        <Button className="">update</Button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-gray-200 my-20 w-[90%] mx-auto xs:w-[80%] md:w-[70%] p-5 rounded-lg">
                                <div className="text-gray-700 capitalize my-4 text-center font-bold">Add Agents</div>
                                <Loader switchAppearance={loader.show && loader.type == 'password'}>
                                    adding {user.username} as agent...
                                </Loader>
                                <form className="max-w-[400px] mx-auto" onSubmit={submitAddAgents}>
                                    <div className="w-full flex flex-col my-2 p-2">
                                        add users, agents, those added and those removed
                                    </div>

                                    <div className="w-full flex flex-col my-2 p-2">
                                        <ProfileInput
                                            placeholder="search for user"
                                            id="oldPassword"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => {
                                                setUserSearch(e.target.value)
                                                debounceSearch()
                                            }}
                                        ></ProfileInput>

                                        <InputError message={errors.oldPassword} className="mt-2" />
                                    </div>

                                    <div className="w-full flex justify-between my-4 p-2">
                                        <Button className="">add agents</Button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-gray-200 my-20 w-[90%] mx-auto xs:w-[80%] md:w-[70%] p-5 rounded-lg">
                                <div className="text-gray-700 capitalize my-4 text-center font-bold">Delete Agency Account</div>
                                <Loader switchAppearance={loader.show && loader.type == 'deletion'}>
                                    deleting {user.username}'s account ...
                                </Loader>
                                <form className="max-w-[400px] mx-auto" onSubmit={submitAccountDeletion}>
                                    <div className="w-full flex text-center justify-center text-red-700 my-2 p-2">
                                        <div className="font-bold">Note that you will lose your agency account with all other entities (such as agents and files) associated with it.</div>
                                    </div>

                                    <div className="w-full flex justify-end my-4 p-2">
                                        <Button className="bg-red-400 text-red-800 outline-red-800">delete</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    }
                </div>)
            }
        </>
    )
}