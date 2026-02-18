import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Post from "./pages/Post"
import Contact from "./pages/Contact"
import Profile from "./pages/Profile"
import Search from "./pages/Search"
import ProtectedRoute from "./components/ProtectedRoute"
import MainLayout from "./layout/MainLayout"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post" element={<Post/>} />
            <Route path="/contact" element={<Contact/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/search" element={<Search/>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
