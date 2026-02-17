import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import bg from "../assets/image/bg.jpg"
import { textStyles, COLORS } from "../style/text"
import { loginApi } from "../api/auth"
import Configs from "../config"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      const data = await loginApi(email, password)
      localStorage.setItem(
        Configs.storage.token,
        data.token
      )
      // console.log(data.token)
      login({
        username: data.fullname,
        fullname: data.fullname,
        tel: data.tel,
        email: data.email
      })
      console.log("login success : ", data)
      navigate("/")
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f3]">
      <div className="relative bg-white rounded-[40px] shadow-xl w-[1015px] max-w-full min-h-[715px] overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${bg})` }}
        />

        <div className="absolute inset-0 bg-[#47A19C]/40 backdrop-blur-[10px]" />

        <div
          className={`bg-white absolute top-0 left-0 h-full w-1/2 p-12 transition-all duration-1000 z-20
          ${isRegister ? "translate-x-full" : "translate-x-0"}
        `}
        >
          <div className={`h-full flex flex-col justify-center gap-2 p-12 transition-opacity duration-[150ms] delay-[200ms] absolute inset-0
            ${isRegister ? "opacity-0 pointer-events-none" : "opacity-100"}
          `}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-between text-xs text-gray-700 mt-3">
              <label><input type="checkbox" className="mr-1" /> remember me</label>
              <a href="#">Forgot password</a>
            </div>

            <button
              onClick={handleLogin} 
              className={`mt-5 bg-primary hover:bg-teal-600 text-white py-3 rounded-lg font-bold`}
            >
              Login
            </button>
          </div>

          <div className={`h-full flex flex-col justify-center gap-2 p-12 transition-opacity duration-[150ms] delay-[200ms] absolute inset-0
            ${isRegister ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}>
            <Input label="Full name" />
            <Input label="Email" type="email" />
            <Input label="Telephone number" />
            <Input label="Password" type="password" />
            <Input label="Confirm password" type="password" />

            <label className="text-xs text-gray-700 mt-3">
              <input type="checkbox" className="mr-1" /> I agree to Terms
            </label>

            <button style={{ backgroundColor: COLORS.GREEN }} className={`mt-5 hover:bg-teal-600 text-white py-3 rounded-lg font-bold`}>
              Create account
            </button>
          </div>
        </div>

        <div className="absolute inset-0 z-10">
          <div className={`
              absolute right-0 top-0 w-1/2 h-full 
              flex flex-col justify-center items-center text-center px-12 text-white
              transition-all duration-0 ease-in-out
              ${isRegister 
              ? "opacity-0 scale-95 blur-sm pointer-events-none delay-[700ms]" 
              : "opacity-100 scale-100 blur-0 delay-0"}
          `}>
              <h1 className={`${textStyles.title} mb-2`}>Welcome back</h1>
              <p className={`${textStyles.subtitle} mb-20`}>To continue, please enter<br />your login details.</p>
              <p className={`${textStyles.subheader} mb-3`}>New here? Create an account.</p>
              <button onClick={() => setIsRegister(true)} className={`w-[80%] bg-white font-thai font-semibold text-[${COLORS.BLACK}] px-6 py-3 rounded-lg hover:bg-[#474747] hover:text-white duration-200`}>
                Register
              </button>
          </div>

          <div className={`
              absolute left-0 top-0 w-1/2 h-full
              flex flex-col justify-center items-center text-center px-12 text-white
              transition-all duration-0 ease-in-out
              ${isRegister 
              ? "opacity-100 scale-100 blur-0 delay-0" 
              : "opacity-0 scale-95 blur-sm pointer-events-none delay-[700ms]"}
          `}>
            <h1 className={`${textStyles.title} mb-2`}>Create account</h1>
            <p className={`${textStyles.subtitle} mb-20`}>Enter your information to sign in.</p>
            <p className={`${textStyles.subheader} mb-3`}>Already have account?</p>
            <button onClick={() => setIsRegister(false)} className="w-[80%] bg-white font-thai font-semibold text-[#474747] px-6 py-3 rounded-lg hover:bg-[#474747] hover:text-white duration-200">
              Login
            </button>
          </div>
      </div>
    </div>
  </div>
)}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-800">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="px-3 py-2 rounded-lg border bg-white/80 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  )
}

