// import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import { Profile } from './pages/Profile'
import { Error } from './pages/Error'
import { MainLayout } from './layouts/MainLayout'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { AuthLayout } from './layouts/AuthLayout'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useAxiosWithToken from './hooks/useAxiosWithToken'
import { addUser, removeUser } from './redux/reducers/user.reducer'
import useRefreshToken from './hooks/useRefreshToken'

function App() {
  const axios = useAxiosWithToken('access_token')
  const dispatch = useDispatch()
  const refreshTokens = useRefreshToken()

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    await axios.get('/user')
      .then((res) => {
        dispatch(addUser(res.data))
      })
      .catch(async (err) => {
        console.log(err)
        dispatch(removeUser())
        await refreshTokens()
      })
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainLayout/>}>

            <Route index path='' element={<Home/>}></Route>
            <Route path='profile' element={<Profile/>}></Route>
            <Route path='' element={<AuthLayout/>}>
              <Route path='signup' element={<Register/>}></Route>
              <Route path='signin' element={<Login/>}></Route>
            </Route>
            <Route path='*' element={<Error/>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
