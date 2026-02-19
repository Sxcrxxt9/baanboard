import { useAuth } from "../context/AuthContext"

export default function Contact() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold mb-2">
        Sorryyy {user?.username}
      </h1>
      <p className="text-gray-600 mb-6">
        Contact page will available in V.1.2.0
      </p>
    </div>
  )
}
