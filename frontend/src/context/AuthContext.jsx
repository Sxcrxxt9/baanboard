import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem("user_data", JSON.stringify(userData))
    if (token) {
      localStorage.setItem("access_token", token)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user_data")
    localStorage.removeItem("access_token")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
