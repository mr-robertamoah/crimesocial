import { useEffect, useState } from "react";
import { AccraCoordinates, CrimeMarkers, HomeViews, StatusCodes } from "../constants";
import { HomeView } from "../partials/HomeView";
import Modal from "../components/Modal";
import Button from "../components/partials/Button";
import Loader from "../components/Loader";
import ProfileInput from "../components/ProfileInput";
import InputError from "../components/InputError";
import useRefreshToken from "../hooks/useRefreshToken";
import { useMainLayoutContext } from "../layouts/useMainLayoutContext";
import { removeUser } from "../redux/reducers/user.reducer";
import { clearTokens } from "../redux/reducers/tokens.reducer";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProfileTextbox from "../components/ProfileTextbox";
import ProfileDatePicker from "../components/ProfileDatePicker";
import useAxiosWithToken from "../hooks/useAxiosWithToken";
import { FilesPicker } from "../components/FilesPicker";
import MediaCapture from "../components/MediaCapture";
import { addPost, updatePost, updatePosts } from "../redux/reducers/posts.reducer";
import { debounce } from "lodash";
import { AgencyType, CrimeType, FileType, PostType } from "../types";
import ProfileSelect from "../components/ProfileSelect";

function Home() {
  const defaultLoader = { show: false, type: '' }
  const defaultReportErrors = {
      landmark: '',
      severity: '',
      name: '',
      lat: '',
      lon: "",
      description: '',
      occurredOn: '',
      anonymous: '',
      crimeTypeName: '',
      crimeTypeId: '',
      suspect: '',
      victim: '',
      files: '',
      search: '',
  }
  const reportErrorsList = [
    'name',
    'occurredOn',
    'lon',
    'lat',
    'crimeTypeId',
    'crimeTypeName',
  ]
  const agencyErrorsList = [
    'name',
    'type',
  ]
  const defaultReportData = {
    landmark: '',
    severity: '',
    name: '',
    lat: '',
    lon: "",
    description: '',
    occurredOn: '',
    anonymous: '',
    crimeTypeName: '',
    crimeTypeId: 0,
    searching: false,
    crimeTypes: [],
    search: '',
    suspect: {},
    victim: {},
    files: null,
    deletedFiles: [],
  }
  const defaultAgencyData = {
    name: '',
    type: '',
    about: '',
    files: null
  }
  const defaultAgencyErrors = {
    name: '',
    type: '',
    about: '',
    files: '',
  }

  const axiosWithToken = useAxiosWithToken('access_token')
  const [view, setView] = useState(HomeViews.all)
  const [showModel, setShowModel] = useState(false)
  const [suspectMarker, setSuspectMarker] = useState('')
  const [currentLocation, setCurrentLocation] = useState(AccraCoordinates)
  const [homeMap, setHomeMap] = useState(null)
  const [reportMap, setReportMap] = useState(null)
  const [victimMarker, setVictimMarker] = useState('')
  const [modelTitle, setModelTitle] = useState('')
  const [formType, setFormType] = useState<'agency' | 'report' | 'update report' |  'delete report' | 'delete agency' | ''>('')
  const [url, setUrl] = useState('/posts')
  const [page, setPage] = useState(1)
  const [loader, setLoader] = useState(defaultLoader)
  const {callAlert} = useMainLayoutContext()
  const refreshTokens = useRefreshToken()
  const [oldPost, setOldPost] = useState<CrimeType | null>(null)
  const [reportData, setReportData] = useState(defaultReportData)
  const [reportErrors, setReportErrors] = useState(defaultReportErrors)
  const [agencyData, setAgencyData] = useState(defaultAgencyData)
  const [agencyErrors, setAgencyErrors] = useState(defaultAgencyErrors)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const { mapDetails } = useMainLayoutContext()
  const [mediaCapture, setMediaCaptureData] = useState({
      show: false, type: ''
  })

  useEffect(() => {
    setView(HomeViews.all)

    getPosts()

    getCurrentLocation()
  }, [])

  function getCurrentLocation () {
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: `${position.coords.latitude}`,
            lon: `${position.coords.longitude}`,
          })

          addMarker(reportMap, {lat: position.coords.latitude, lng: position.coords.longitude})
        },
        (err) => {
          console.log(err)
          callAlert({
            type: 'failed',
            message: 'Something happened while getting location. Try again later or check your browser settings.',
            show: true,
          })
        },
      )
    } else {
      callAlert({
        type: 'failed',
        message: 'Your browser does not support getting location.',
        show: true,
      })
    }
  }

  useEffect(() => {
    if (reportData.search) {
      handleSearch()
    }
  }, [reportData.search])
  
  const handleSearch = debounce(() => {

    getCrimeTypes(reportData.search)
  }, 500)

  async function getCrimeTypes(name: string) {
    if (reportData.searching) return
    setFormReportData('searching', true)

    await axios.get(`crime-types?name=${name}`)
      .then((res) => {
        console.log(res)

        setReportData((oldData) => {
          const newData = {...oldData}
          newData.crimeTypes = res.data
          return newData
        })
      })
      .catch((err) => {
        console.log(err)
        setReportError('search', 'Something happened, Try again later.')
      })
      .finally(() => {
        setFormReportData('searching', false)
      })
  }

  useEffect(() => {
    if (mapDetails.Map) {
      createMap({ type: 'home', mapId: 'homemap'})
    }
  }, [mapDetails])

  useEffect(() => {
    if (mapDetails.Map && formType.includes('report')) {
      createMap({ type: 'report', mapId: 'reportmap'})
    }
  }, [mapDetails, formType])

  async function getPosts() {
    await axios.get(`${url}?page=${page}&view=${view}`)
      .then((res) => {
        console.log(res)
        dispatch(updatePosts(res.data))
        if (res.data.length == 10) setPage(page + 1)
      })
      .catch((err) => {
        console.log(err)
        callAlert({
          message: 'Sorry, something unfortunate happened. Please try again shortly or check you network.',
          show: true,
          type: 'failed'
        })
      })
  }

  function createMap(data: {mapId: string; type: string }) {
    if (!mapDetails.Map) return
    const map = new mapDetails.Map(document.getElementById(data.mapId) as HTMLElement, {
      center: { lat: Number(currentLocation.lat), lng: Number(currentLocation.lon) },
      mapId: data.mapId,
      zoom: 12
    })

    if (data.type == 'home')
      setHomeMap(map)

    if (data.type == 'report')
      setReportMap(map)

    map.addListener('dblclick', (event) => {
        addMarker(map, {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        })
    })
  }

  function createMarker(map) {
    if (!mapDetails.Marker) return

    const marker = mapDetails.Marker({
      map,
      title: 'crime',
      position: { lat: currentLocation.lat, lng: currentLocation.lon },
      draggable: true
    })

    marker.addListener('dragend', (event) => {
      event.preventDefault()
      setCurrentLocation({
          lat: event.latLng.lat(),
          lon: event.latLng.lng(),
      })
    })
  }

  useEffect(() => {
    if (formType == 'report') {
      setReportData(defaultReportData)
      setReportErrors(defaultReportErrors)
      setModelTitle('Report Crime')
      setShowModel(true)
    }

    if (formType == 'update report') {
      setReportErrors(defaultReportErrors)
      setModelTitle('Update Crime')
      setShowModel(true)
    }
    
    if (formType == 'agency') {
      setAgencyData(defaultAgencyData)
      setAgencyErrors(defaultAgencyErrors)
      setModelTitle('Create Agency')
      setShowModel(true)
    }
  }, [formType])

  function addMarker(map, location) {
    if (!mapDetails.Marker) return

    const marker = new mapDetails.Marker({
      map,
      title: 'crime',
      position: location,
      draggble: true
    })

    setReportData((oldData) => {
      const newData = {...oldData}
      newData.lat = String(location.lat)
      newData.lon = String(location.lng)
      
      return newData
    })
    marker.addListener('dragend', (event) => {
      console.log(event, 'event')
      event.preventDefault()
      setReportData((oldData) => {
        const newData = {...oldData}
        newData.lat = String(location.lat)
        newData.lon = String(location.lng)
        
        return newData
      })
    })
  }

  function closeModal() {
    setShowModel(false)
    setModelTitle('')
    setFormType('')
  }

  function clearReportErrors() {
    setReportErrors(defaultReportErrors)
  }
    
  function reportErrorsIsNotEmpty() : boolean {
      return errorsIsNotEmpty(reportErrors)
  }
    
  function errorsIsNotEmpty(errors: object) : boolean {
      let notEmpty = true

      Object.keys(errors).forEach((key: string) => {
          if (!errors[key]) notEmpty = false
      })

      return notEmpty
  }

  async function submitReport(e) {
    e.preventDefault()
    clearReportErrors()
    if (loader.show) return

    if (!reportData.name) setReportError('name', 'name is required')
    
    if (!reportData.occurredOn) setReportError('occurredOn', 'date it occurred on is required')

    if (!reportData.lat) setReportError('lat', 'latitude is required')

    if (!reportData.lon) setReportError('lon', 'longitude is required')
    
    const errorMessage = getFirstErrorFrom(reportErrors, reportErrorsList)
    if (errorMessage) {
      return callAlert({
        show: true,
        type: 'failed',
        message: errorMessage
      })
    }

    if (formType == 'update report') return submitReportUpdate()
    const reportFormData = getReportFormData()
    setLoader({ show: true, type: 'report' })
    await axiosWithToken.post('/crime', reportFormData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })
      .then((res) => {
          console.log(res)
          callAlert({
              show: true,
              message: "Report was successfully made.",
              type: 'success'
          })
          dispatch(addPost(res.data))
          setReportData(defaultReportData)
          closeModal()
      })
      .catch(async (err) => {
          console.log(err)
          if (
              err.response?.status == StatusCodes.UNAUTHORIZED &&
              err.response?.data?.message == 'Unauthorized' 
          ) return await removeUserAndGoToSignInPage(submitReport)

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

  async function submitReportUpdate() {
    if (!oldPost) return

    const reportFormData = getUpdatedReportFormData()
    setLoader({ show: true, type: 'report' })
    await axiosWithToken.post(`/crime/${oldPost?.id}`, reportFormData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })
    .then((res) => {
        console.log(res)
        callAlert({
            show: true,
            message: "Report was successfully updated.",
            type: 'success'
        })
        dispatch(updatePost(res.data))
        setReportData(defaultReportData)
        closeModal()
    })
    .catch(async (err) => {
        console.log(err)
        if (
            err.response?.status == StatusCodes.UNAUTHORIZED &&
            err.response?.data?.message == 'Unauthorized' 
        ) return await removeUserAndGoToSignInPage(submitReport)

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

  async function submitAgency(e) {
    e.preventDefault()
    clearReportErrors()
    if (loader.show) return

    if (!agencyData.name) setReportError('name', 'name is required')
    
    if (!agencyData.type) setReportError('type', 'type of agency is required')
    
    const errorMessage = getFirstErrorFrom(agencyErrors, agencyErrorsList)
    if (errorMessage) {
      return callAlert({
        show: true,
        type: 'failed',
        message: errorMessage
      })
    }

    const agencyFormData = getAgencyFormData()
    setLoader({ show: true, type: 'agency' })
    await axiosWithToken.post('/agency', agencyFormData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })
      .then((res) => {
          console.log(res)
          callAlert({
              show: true,
              message: "Agency was successfully made.",
              type: 'success'
          })
          dispatch(addPost(res.data))
          setAgencyData(defaultAgencyData)
          closeModal()
      })
      .catch(async (err) => {
          console.log(err)
          if (
              err.response?.status == StatusCodes.UNAUTHORIZED &&
              err.response?.data?.message == 'Unauthorized' 
          ) return await removeUserAndGoToSignInPage(submitReport)

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

  function getFirstErrorFrom(errors: object, errorsList: Array<string>) {
    let key: string|null = null;
    errorsList.forEach((err) => {
      if (errors[err] && !key) key = err;
    })

    return errors[key]
  }

  function getReportFormData() {
    const formData = new FormData()

    formData.append('name', reportData.name.trim())
    formData.append('description', reportData.description.trim())
    formData.append('severity', String(reportData.severity).trim())
    formData.append('lat', reportData.lat.trim())
    formData.append('lon', reportData.lon.trim())
    formData.append('anonymous', reportData.anonymous.trim() ? 'true' : 'false')
    formData.append('crimeTypeId', String(reportData.crimeTypeId).trim())
    formData.append('crimeTypeName', reportData.crimeTypeName.trim())
    formData.append('landmark', reportData.landmark.trim())
    formData.append('occurredOn', reportData.occurredOn.trim())
    formData.append('suspect', JSON.stringify(reportData.suspect))
    formData.append('victim', JSON.stringify(reportData.victim))

    if (reportData.files)
      reportData.files.forEach((file: File) => {
        formData.append(`files`, file)
      })

    return formData
  }

  function getUpdatedReportFormData() {
    const formData = new FormData()
    if (!oldPost) return formData

    if (oldPost.name !== reportData.name.trim())
      formData.append('name', reportData.name.trim())
    if (oldPost.description !== reportData.description.trim())
      formData.append('description', reportData.description.trim())
    if (String(oldPost.severity) !== String(reportData.severity).trim())
      formData.append('severity', String(reportData.severity).trim())
    if (String(oldPost.lat) !== String(reportData.lat).trim())
      formData.append('lat', String(reportData.lat).trim())
    if (String(oldPost.lon) !== String(reportData.lon).trim())
      formData.append('lon', String(reportData.lon).trim())
    if ((oldPost.anonymous ? 'true' : '') !== reportData.anonymous.trim())
      formData.append('anonymous', reportData.anonymous.trim() ? 'true' : 'false')
    if (
      String(oldPost.crimeTypeId) !== String(reportData.crimeTypeId).trim() &&
      String(reportData.crimeTypeId).trim()
    )
      formData.append('crimeTypeId', String(reportData.crimeTypeId).trim())
    if (oldPost.crimeTypeName !== reportData.crimeTypeName.trim())
      formData.append('crimeTypeName', reportData.crimeTypeName.trim())
    if (oldPost.landmark !== reportData.landmark.trim())
      formData.append('landmark', reportData.landmark.trim())
    if (oldPost.occurredOn !== `${reportData.occurredOn.trim()}Z`)
      formData.append('occurredOn', reportData.occurredOn.trim())
    formData.append('deletedFiles', JSON.stringify(reportData.deletedFiles))
    if (objectsNotEqual(oldPost.suspect, reportData.suspect))
      formData.append('suspect', JSON.stringify(reportData.suspect))
    if (objectsNotEqual(oldPost.victim, reportData.victim))
      formData.append('victim', JSON.stringify(reportData.victim))

    if (reportData.files)
      reportData.files.forEach((file: File) => {
        if (!file.url)
          formData.append(`files`, file)
      })

    return formData
  }

  function objectsNotEqual(firstObject: object, secondObject: object) {
    let areNotEqual = false

    Object.keys(firstObject).forEach((key: string) => {
      if (firstObject[key] !== secondObject[key]) areNotEqual = true
    })

    return areNotEqual
  }

  function getAgencyFormData() {
    const formData = new FormData()

    formData.append('name', agencyData.name.trim())
    formData.append('type', agencyData.type.trim())
    formData.append('about', agencyData.about.trim())

    if (agencyData.files)
      agencyData.files.forEach((file: File) => {
        formData.append(`files`, file)
      })

    return formData
  }

  function setFormErrorWithMessages(
    messages: Array<string> | string, 
    errors: object | null = null, 
    isError: boolean = true
  ) {
      callAlert({
        show: true,
        message: typeof messages == 'string' ? messages : messages[0],
        type: isError ? 'failed' : 'success'
      })
  
      Object.keys(errors ? errors : reportErrors).forEach((key: string) => {
        if (typeof messages == 'string' && messages.toLowerCase().split(' ')[0] == key) {
          if (formType == 'report') return setReportError(key, messages)
          if (formType == 'agency') return setAgencyError(key, messages)
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

        if (formType == 'report') setReportError(key, message)
        if (formType == 'agency') setAgencyError(key, message)
      })
  }

  function setReportError(type: string, value: string) {
      setReportErrors((oldData) => {
          const newData = {
              ...oldData
          }

          value = value.toLowerCase()
          if (value.includes('occurredOn'))
              value = value.replaceAll('occurredOn', 'occurred on')
          
          newData[type] = value
          return newData
      })
  }

  function setAgencyError(type: string, value: string) {
      setAgencyErrors((oldData) => {
          const newData = {
              ...oldData
          }
          
          newData[type] = value
          return newData
      })
  }

  function clearReportError(type: string) {
    setReportErrors((oldData) => {
      const newData = {
          ...oldData
      }

      newData[type] = ''

      return newData
    })
  }

  function clearAgencyError(type: string) {
    setAgencyErrors((oldData) => {
      const newData = {
          ...oldData
      }

      newData[type] = ''

      return newData
   })
}

  function setFormAgencyData(type: string, value: string) {
      setAgencyData((oldData) => {
          const newData = {
              ...oldData
          }

          newData[type] = value
          return newData
      })

      if (agencyErrors[type]) clearAgencyError(type)
  }

  function setFormReportData(type: string, value: string | number | boolean) {
      setReportData((oldData) => {
          const newData = {
              ...oldData
          }

          newData[type] = value
          return newData
      })

      if (reportErrors[type]) clearReportError(type)
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

  function sendFile(file) {
    if (formType.includes('report')) {
      setReportData((oldData) => {
        const newData = {...oldData}
        if (!newData.files) newData.files = []
        
        newData.files.push(file)

        return newData
      })
    }
    
    if (formType == 'agency') {
      setAgencyData((oldData) => {
        const newData = {...oldData}
        if (!newData.files) newData.files = []
        
        newData.files.push(file)

        return newData
      })
    }
  }

  function clickedNow() {
    const date = new Date()
    const now = date.toISOString().replace('Z', '')
    setReportData((oldData) => {
      const newData = {...oldData}
      
      newData.occurredOn = now

      return newData
    })
  }

  function updateAPost(
    type: 'crime' | 'agency' | 'post',
    item: PostType | CrimeType | AgencyType
  ) {
    if (type == 'crime') {
      setReportData((oldData) => {
        const newData = {
          ...oldData,
          name: item.name,
          severity: item.severity,
          landmark: item.landmark,
          description: item.description,
          lat: item.lat,
          lon: item.lon,
          occurredOn: item.occurredOn ? item.occurredOn.replace('Z', '') : '',
          outcome: item.outcome,
          anonymous: item.anonymous ? 'true' : '',
          crimeTypeName: item.crimeTypeName,
          crimeTypeId: item.crimeType?.id ?? '',
          victim: item.victim,
          suspect: item.suspect,
          files: [...item.files]
        }

        return newData
      })

      setOldPost(item)

      // create marker and center map
      const location = {lat: Number(item.lat), lng: Number(item.lon)}
      addMarker(reportMap, location)
      if (reportMap) reportMap.setCenter(location)
      setFormType('update report')
    }
  }

  function deletePost(
    type: 'crime' | 'agency' | 'post',
    item: PostType | CrimeType | AgencyType
  ) {
    
  }

  return ( 
    <div className="">
      <div className="flex items-start justify-start flex-col sm:flex-row overflow-y-auto">
        <div className="sm:w-[120px] md:w-[150px] w-full flex-shrink-0 bg-blue-200 p-2 h-fit sm:h-[300px] rounded-bl-lg sm:rounded-bl-none rounded-br-lg">
          <div className=" flex sm:block justify-start p-2 text-blue-700">
            <div
              className={`${view == HomeViews.all ? 
                'text-center border-2 border-blue-50 font-bold sm:-translate-x-1 sm:translate-y-0 translate-x-0 -translate-y-1' : 
                'hover:text-center sm:hover:-translate-x-1 hover:-translate-y-1 text-center sm:text-right'
              } 
              sm:w-full min-w-[100px] 
              mr-2 px-2 py-1 cursor-pointer hover:text-base
              hover:font-bold transition-all hover:bg-blue-50 duration-75 rounded sm:my-4`
              }
              onClick={() => setView(HomeViews.all)}>all</div>
            <div 
              className={`${view == HomeViews.crimes ? 
                'text-center border-2 border-blue-50 font-bold sm:-translate-x-1 sm:translate-y-0 translate-x-0 -translate-y-1' : 
                'hover:text-center sm:hover:-translate-x-1 hover:-translate-y-1 text-center sm:text-right'
              } 
              sm:w-full min-w-[100px] 
              mr-2 px-2 py-1 cursor-pointer hover:text-base
              hover:font-bold transition-all hover:bg-blue-50 duration-75 rounded sm:my-4`
              }
              onClick={() => setView(HomeViews.crimes)}>crimes</div>
            <div
              className={`${view == HomeViews.agencies ? 
                  'text-center border-2 border-blue-50 font-bold sm:-translate-x-1 sm:translate-y-0 translate-x-0 -translate-y-1' : 
                  'hover:text-center sm:hover:-translate-x-1 hover:-translate-y-1 text-center sm:text-right'
                } 
                sm:w-full min-w-[100px] 
                mr-2 px-2 py-1 cursor-pointer hover:text-base
                hover:font-bold transition-all hover:bg-blue-50 duration-75 rounded sm:my-4`
              }
              onClick={() => setView(HomeViews.agencies)}>agencies</div>
          </div>
        </div>
        <div className="flex justify-center items-start h-[90vh] flex-shrink w-[90%] sm:w-[60%] md:w-[80%] mx-auto">
          <div className="w-full">
            <HomeView
              createCrime={() => setFormType('report')}
              createAgency={() => setFormType('agency')}
              deletePost={deletePost}
              updatePost={updateAPost}
            />
          </div>
        </div>
      </div>

      <Modal 
        show={showModel} 
        title={modelTitle} 
        close={closeModal}
      >
        {formType.includes('report') && 
          <div className="w-[90%] mx-auto xs:w-[80%] md:w-[70%] relative">
            <Loader className="fixed max-w-[50%]" switchAppearance={loader.show && loader.type == 'report'}>
                {formType == 'report' ? 'reporting crime': 'updating crime report'} ...
            </Loader>
            <form className="max-w-[400px] mx-auto p-5" onSubmit={submitReport}>
              <div className="my-4 p-4 bg-gray-200 rounded-lg">
                <div className="font-bold text-center text-gray-600 capitalize my-2">general information</div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                  <ProfileInput
                      placeholder="enter crime being committed" 
                      id="name"
                      name="name"
                      value={reportData.name}
                      onChange={(e) => setFormReportData('name', e.target.value)}
                  ></ProfileInput>

                  <InputError message={reportErrors.name} className="mt-2" />
                </div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                    <ProfileTextbox
                        placeholder="can you add some description?" 
                        id="description"
                        name="description"
                        value={reportData.description}
                        onChange={(e) => setFormReportData('description', e.target.value)}
                    ></ProfileTextbox>

                    <InputError message={reportErrors.description} className="mt-2" />
                </div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                    <div>
                      <ProfileDatePicker
                          placeholder="when did this happen?" 
                          id="occurredOn"
                          name="occurredOn"
                          className="w-full"
                          value={reportData.occurredOn}
                          onChange={(e) => setFormReportData('occurredOn', e.target.value)}
                      ></ProfileDatePicker>
                      <div 
                        onClick={clickedNow}
                        className="mt-2 text-sm py-1 px-2 rounded bg-blue-300 text-blue-700 w-fit float-right cursor-pointer transition duration-75 hover:bg-blue-700 hover:text-blue-300">now</div>
                    </div>

                    <InputError message={reportErrors.occurredOn} className="mt-2" />
                </div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                  <ProfileInput
                      placeholder="how severe? 1 - 10" 
                      type="number"
                      min="1"
                      step="1"
                      max="10"
                      id="severity"
                      name="severity"
                      value={reportData.severity}
                      onChange={(e) => setFormReportData('severity', Number(e.target.value).toFixed())}
                  ></ProfileInput>
                  <InputError message={reportErrors.severity} className="mt-2" />
                  <div className="flex justify-end items-center w-full mt-2 mb-4">
                      <div 
                        onClick={() => setFormReportData('severity', 10)}
                        className={`${reportData.severity == '10' ? 
                        'bg-blue-700 text-blue-300' :
                        'text-blue-700 bg-blue-300 hover:bg-blue-700 hover:text-blue-300'} 
                        mt-2 text-sm py-1 px-2 rounded mx-2
                        w-fit float-right cursor-pointer transition duration-75
                        `}
                      >high</div>
                      <div 
                        onClick={() => setFormReportData('severity', 5)}
                        className={`${reportData.severity == '5' ? 
                        'bg-blue-700 text-blue-300' :
                        'text-blue-700 bg-blue-300 hover:bg-blue-700 hover:text-blue-300'} 
                        mt-2 text-sm py-1 px-2 rounded mx-2
                        w-fit float-right cursor-pointer transition duration-75
                        `}
                      >moderate</div>
                      <div 
                        onClick={() => setFormReportData('severity', 1)}
                        className={`${reportData.severity == '1' ? 
                          'bg-blue-700 text-blue-300' :
                          'text-blue-700 bg-blue-300 hover:bg-blue-700 hover:text-blue-300'} 
                          mt-2 text-sm py-1 px-2 rounded mx-2
                          w-fit float-right cursor-pointer transition duration-75
                          `}
                      >low</div>
                  </div>
                </div>
                <div className="flex justify-end items-center w-full">
                  {!reportData.anonymous ? <div 
                    onClick={() => setFormReportData('anonymous', 'true')}
                    className={`${reportData.anonymous == '10' ? 
                    'bg-blue-700 text-blue-300' :
                    'text-blue-700 bg-blue-300 hover:bg-blue-700 hover:text-blue-300'} 
                    mt-2 text-sm py-1 px-2 rounded mx-2
                    w-fit float-right cursor-pointer transition duration-75
                    `}
                  >stay anonymous</div> :
                  <div 
                    onClick={() => setFormReportData('anonymous', '')}
                    className={`${reportData.anonymous == '5' ? 
                    'bg-blue-700 text-blue-300' :
                    'text-blue-700 bg-blue-300 hover:bg-blue-700 hover:text-blue-300'} 
                    mt-2 text-sm py-1 px-2 rounded mx-2
                    w-fit float-right cursor-pointer transition duration-75
                    `}
                  >be known</div>}
                </div>
              </div>
              <div className="w-full flex flex-col my-4 p-4 bg-gray-200 rounded-lg">
                <div className="font-bold text-center text-gray-600 capitalize my-2">Crime Type</div>
                <div>
                  {reportData.searching && <div className="my-2 text-green-700 text-sm text-center">searching...</div>}
                  {reportData.crimeTypes.length ? 
                  <div className="flex w-full justify-start items-center overflow-y-auto my-2 py-2">
                    {reportData.crimeTypes.map((crimeType: CrimeType, idx) => {
                      return <div title={crimeType.description ? crimeType.description : ''} key={idx} onClick={() => setFormReportData('crimeTypeId', crimeType.id)}
                        className={(crimeType.id == reportData.crimeTypeId ? 'bg-violet-500 text-white' : '') + ` min-w-[100px] p-2 mr-2 rounded text-center text-gray-600 bg-violet-200 hover:bg-violet-300 transition duration-75 cursor-pointer`}>{crimeType.name}</div>
                    })}
                  </div> : <></>}
                  {(reportData.crimeTypeId == 0 && reportData.crimeTypeName.length == 0) ? 
                    <div className="text-gray-600 text-sm text-center">no crime types searched</div> :
                    <></>
                    }
                </div>
                <ProfileInput
                    placeholder="search for crime type" 
                    id="search"
                    name="search"
                    type="search"
                    value={reportData.search}
                    onChange={(e) => setFormReportData('search', e.target.value)}
                ></ProfileInput>
                <ProfileInput
                    placeholder="type a crime type name if you want" 
                    id="crimeTypeName"
                    name="crimeTypeName"
                    value={reportData.crimeTypeName}
                    className="mt-4 mb-2"
                    onChange={(e) => setFormReportData('crimeTypeName', e.target.value)}
                ></ProfileInput>

                <InputError message={reportErrors.search} className="mt-2" />
              </div>
              <div className="my-4 p-4 bg-gray-200 rounded-lg">
                <div className="font-bold text-center text-gray-600 capitalize my-2">location information</div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                  <div>
                    <div className="text-gray-600 text-sm mb-2 text-center">Location data (We recommend you just pick location by clicking map below).</div>
                    <div className="w-full h-[200px] bg-blue-200" id="reportmap">
                      
                    </div>
                    <div className="flex justify-start items-center flex-col">
                      <ProfileInput
                          placeholder="longitude" 
                          type="number"
                          id="lon"
                          name="lon"
                          className="my-2 w-full"
                          value={reportData.lon}
                          onChange={(e) => setFormReportData('lon', e.target.value)}
                      ></ProfileInput>
                      <InputError message={reportErrors.lon} className="mt-2" />

                      <ProfileInput
                          placeholder="latitude" 
                          type="number"
                          id="lat"
                          name="lat"
                          className="my-2 w-full"
                          value={reportData.lat}
                          onChange={(e) => setFormReportData('lat', e.target.value)}
                      ></ProfileInput>
                      <div className="flex justify-end w-full">
                        <div 
                          onClick={getCurrentLocation}
                          className={`${(currentLocation.lat == reportData.lat && currentLocation.lon == reportData.lon) ? 
                          'bg-blue-700 text-blue-300' :
                          'text-blue-700 bg-blue-300 hover:bg-blue-700 hover:text-blue-300'} 
                          mt-2 text-sm py-1 px-2 rounded
                          w-fit float-right cursor-pointer transition duration-75
                          `}
                        >current location</div>
                      </div>

                      <ProfileInput
                          placeholder="landmark" 
                          id="landmark"
                          name="landmark"
                          className="my-2 w-full"
                          value={reportData.landmark}
                          onChange={(e) => setFormReportData('landmark', e.target.value)}
                      ></ProfileInput>
                      
                      <InputError message={reportErrors.lat} className="mt-2" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="my-4 p-4 bg-gray-200 rounded-lg">
                <div className="font-bold text-center text-gray-600 capitalize my-2">suspect/victim description</div>

                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                  <div>
                    <div className="text-gray-600 text-sm mb-2 text-center">Have you got any information on the suspect? Click on a marker to provide specific information.</div>
                    <div className="flex w-full justify-start items-center overflow-y-auto my-2 py-2">
                      {CrimeMarkers.map((marker, idx) => {
                        return <div key={idx} onClick={() => setSuspectMarker(marker)}
                          className={(marker == suspectMarker ? 'bg-violet-500 text-white' : '') + ` min-w-[100px] p-2 mr-2 rounded text-center text-gray-600 bg-violet-200 hover:bg-violet-300 transition duration-75 cursor-pointer`}>{marker}</div>
                      })}
                    </div>
                    <div className="flex justify-start items-center">
                      <ProfileInput
                          placeholder={`${suspectMarker ? '' : 'describe '}suspect${suspectMarker ? "'s" : ''} ${suspectMarker} ${suspectMarker ? '' : ' (select marker)'}`} 
                          id="suspect"
                          name="suspect"
                          disabled={suspectMarker ? false : true}
                          className="w-full"
                          value={reportData.suspect[suspectMarker] ?? ''}
                          onChange={(e) => setReportData((oldData) => {
                            return {
                              ...oldData,
                              suspect: {
                                ...oldData.suspect,
                                [suspectMarker]: e.target.value
                              }
                            }
                          })}
                      ></ProfileInput>
                    </div>
                  </div>

                  <InputError message={reportErrors.suspect} className="mt-2" />
                </div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                  <div>
                    <div className="text-gray-600 text-sm mb-2 text-center">Have you got any information on the victim? Click on a marker to provide specific information.</div>
                    <div className="flex w-full justify-start items-center overflow-y-auto my-2 py-2">
                      {CrimeMarkers.map((marker, idx) => {
                        return <div key={idx} onClick={() => setVictimMarker(marker)}
                          className={(marker == victimMarker ? 'bg-violet-500 text-white' : '') + ` min-w-[100px] p-2 mr-2 rounded text-center text-gray-600 bg-violet-200 hover:bg-violet-300 transition duration-75 cursor-pointer`}>{marker}</div>
                      })}
                    </div>   
                    <div className="flex justify-start items-center">
                      <ProfileInput
                          placeholder={`${victimMarker ? '' : 'describe '}victim${victimMarker ? "'s" : ''} ${victimMarker} ${victimMarker ? '' : ' (select marker)'}`} 
                          id="victim"
                          name="victim"
                          disabled={victimMarker ? false : true}
                          className="w-full"
                          value={reportData.victim[victimMarker] ?? ''}
                          onChange={(e) => setReportData((oldData) => {
                            return {
                              ...oldData,
                              victim: {
                                ...oldData.victim,
                                [victimMarker]: e.target.value
                              }
                            }
                          })}
                      ></ProfileInput>
                    </div>
                  </div>
                  
                  <InputError message={reportErrors.suspect} className="mt-2" />
                </div>
              </div>
              <div className="w-full flex flex-col my-4 p-4 bg-gray-200 rounded-lg">
                <div className="font-bold text-center text-gray-600 capitalize my-2">Add files</div>
                <FilesPicker 
                  files={reportData.files} 
                  accept="images/*,videos/*"
                  onChange={(files) => {
                    setReportData((oldData) => {
                      const newData = {...oldData}
                      if (!newData.files) newData.files = []
                      if (!files.length) return newData
                      
                      for (let idx = 0; idx < files.length; idx++) {
                        if (newData.files.findIndex((item) => item.name == files[idx].name) == -1)
                          newData.files.push(files[idx])
                      }

                      return newData
                    })
                  }}
                  onDelete={(file) => {
                    setReportData((oldData) => {
                      const newData = {...oldData}
                      if (!newData.files) newData.files = []
                      if (!file) return newData
                      
                      const idx = newData.files.findIndex((item) => item.name == file.name)

                      if (idx > -1) newData.files.splice(idx, 1)

                      return newData
                    })
                  }}
                  onRemove={(file: File|FileType|null) => {
                    setReportData((oldData) => {
                      const newData = {...oldData}
                      if (!file) return newData
                      
                      const idx = newData.files.findIndex((item) => item.id == file.id)
                      if (idx > -1) newData.files.splice(idx, 1)

                      if (!newData.deletedFiles.includes(file.id))
                        newData.deletedFiles.push(file.id)

                      return newData
                    })
                  }}
                  getMedia={(type) => setMediaCaptureData({show: true, type})}
                />

                <InputError message={reportErrors.files} className="mt-2" />
              </div>
              <div className="w-full flex justify-end my-4 p-2">
                  <Button className="">report</Button>
              </div>
            </form>
          </div>
        }
        
        {formType == 'agency' && 
          <div className="w-[90%] mx-auto xs:w-[80%] md:w-[70%] relative">
            <Loader className="fixed max-w-[50%]" switchAppearance={loader.show && loader.type == 'agency'}>
                creating agency ...
            </Loader>
            <form className="max-w-[400px] mx-auto p-5" onSubmit={submitAgency}>
              <div className="my-4 p-4 bg-gray-200 rounded-lg">
                <div className="font-bold text-center text-gray-600 capitalize my-2">general information</div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                  <ProfileInput
                      placeholder="enter name of agency" 
                      id="name"
                      name="name"
                      value={agencyData.name}
                      onChange={(e) => setFormAgencyData('name', e.target.value)}
                  ></ProfileInput>

                  <InputError message={agencyErrors.name} className="mt-2" />
                </div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                    <ProfileTextbox
                        placeholder="what are you about?" 
                        id="about"
                        name="about"
                        value={agencyData.about}
                        onChange={(e) => setFormAgencyData('about', e.target.value)}
                    ></ProfileTextbox>

                    <InputError message={agencyErrors.about} className="mt-2" />
                </div>
                <div className="w-full flex flex-col mt-2 mb-4 p-2">
                  <ProfileSelect
                      initialOption="type of agency" 
                      id="type"
                      name="type"
                      options={['government', 'nonprofit', 'profit']}
                      className="w-full"
                      value={agencyData.type}
                      onChange={(e) => setFormAgencyData('type', e.target.value)}
                  ></ProfileSelect>

                  <InputError message={agencyErrors.type} className="mt-2" />
                </div>
              </div>
              <div className="w-full flex flex-col my-4 p-4 bg-gray-200 rounded-lg">
                <div className="font-bold text-center text-gray-600 capitalize my-2">Add files</div>
                <FilesPicker 
                  files={agencyData.files} 
                  accept="*"
                  onChange={(files) => {
                    setAgencyData((oldData) => {
                      const newData = {...oldData}
                      if (!newData.files) newData.files = []
                      if (!files.length) return newData
                      
                      for (let idx = 0; idx < files.length; idx++) {
                        if (newData.files.findIndex((item) => item.name == files[idx].name) == -1)
                          newData.files.push(files[idx])
                      }

                      return newData
                    })
                  }}
                  onDelete={(file) => {
                    setAgencyData((oldData) => {
                      const newData = {...oldData}
                      if (!newData.files) newData.files = []
                      if (!file) return newData
                      
                      const idx = newData.files.findIndex((item) => item.name == file.name)

                      if (idx > -1) newData.files.splice(idx, 1)

                      return newData
                    })
                  }}
                  getMedia={(type) => setMediaCaptureData({show: true, type})}
                />

                <InputError message={agencyErrors.files} className="mt-2" />
              </div>
              <div className="w-full flex justify-end my-4 p-2">
                  <Button className="">{formType == 'agency' ? 'create agency' : formType}</Button>
              </div>
            </form>
          </div>
        }
      </Modal>

      <MediaCapture
          emitSendFile={sendFile}
          show={mediaCapture.show}
          type={mediaCapture.type}
          closeMediaCapture={() => setMediaCaptureData({type: '', show: false})}
      />
    </div>
  )
}

export { Home };