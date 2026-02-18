import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import { IoPersonOutline, IoLogOutOutline, IoSearchOutline } from "react-icons/io5"
import { textStyles } from "../style/text"
import Logo from "../assets/image/logo.png"

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [keyword, setKeyword] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (!keyword.trim()) return
    navigate(`/search?q=${keyword}`)
  }

  const isActive = (path) => location.pathname === path

  const menuClass = (path) =>
    `${textStyles.subtitle} transition ${
      isActive(path) ? "text-primary" : "text-secondary hover:text-primary"
    }`

  return (
    <header className="w-full bg-white shadow relative z-50">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <button
              onClick={() => navigate("/")}
              className={menuClass("/")}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/post")}
              className={menuClass("/post")}
            >
              My post
            </button>
            <button
              onClick={() => navigate("/contact")}
              className={menuClass("/contact")}
            >
              Contact us
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className={`transition ${
                isActive("/profile")
                  ? "text-primary"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <IoPersonOutline size={22} />
            </button>
            <button
              onClick={() => {
                logout()
                // console.log("logout success : ", logout)
                navigate("/login")
              }}
              className="text-secondary hover:text-red-500 transition"
            >
              <IoLogOutOutline size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-3 relative">
          <input
            type="text"
            placeholder="Search..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-2 pr-10 rounded-md focus:outline-none  border border-gray-300"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition"
          >
            <IoSearchOutline size={18} />
          </button>
        </form>

      </div>
    </header>
  )
}
