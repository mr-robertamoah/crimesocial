// import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Error } from './pages/Error'
import { MainLayout } from './layouts/MainLayout'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { AuthLayout } from './layouts/AuthLayout'
import { Admin } from './pages/Admin'

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainLayout/>}>

            <Route index path='' element={<Home/>}></Route>
            <Route path='profile' element={<Profile/>}></Route>
            <Route path='admin' element={<Admin/>}></Route>
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
