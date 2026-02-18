import { useAuth } from "../context/AuthContext"

export default function Contact() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold mb-2">
        Welcome {user?.username}
      </h1>
      <p className="text-gray-600 mb-6">
        This is your Contact page
      </p>
    </div>
  )
}
