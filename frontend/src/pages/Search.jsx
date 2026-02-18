import { useAuth } from "../context/AuthContext"
import { useLocation } from "react-router-dom"

export default function Search() {
  const { user } = useAuth()
  const location = useLocation()

  const query = new URLSearchParams(location.search)
  const keyword = query.get("q")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold mb-2">
        Welcome {user?.username}
      </h1>

      <p className="text-gray-600 mb-2">
        This is your Search page
      </p>

      <p className="text-teal-600 font-semibold">
        keyword = {keyword}
      </p>
    </div>
  )
}
