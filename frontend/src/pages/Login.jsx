import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import bg from "../assets/image/bg.jpg";
import { textStyles, COLORS } from "../style/text";
import { loginApi, registerApi } from "../api/auth";
import Configs from "../config";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginApi(email, password);
      localStorage.setItem(Configs.storage.token, data.token);
      // console.log(data.token)
      login({
        username: data.fullname,
        fullname: data.fullname,
        tel: data.tel,
        email: data.email,
      });
      console.log("login success : ", data);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed");
    }
  };
  const [registerData, setRegisterData] = useState({
    fullname: "",
    email: "",
    tel: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const validateRegister = () => {
    const newErrors = {};
    const { fullname, email, tel, password, confirmPassword } = registerData;

    // 1️⃣ เช็ค fullname
    if (!fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    // 2️⃣ เช็ค email
    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // 3️⃣ เช็คเบอร์โทร (10 หลัก)
    if (!tel) {
      newErrors.tel = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(tel)) {
        newErrors.tel = "Phone must be 10 digits";
      }
    }

    // 4️⃣ เช็ค password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // 5️⃣ เช็ค confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    // 6️⃣ ต้องติ๊กยอมรับ Terms
    if (!registerData.agree) {
      newErrors.agree = "You must agree to the terms";
    }

    setErrors(newErrors);

    // ถ้าไม่มี error = ผ่าน
    return Object.keys(newErrors).length === 0;
  };
  const handleRegister = async () => {
    if (!validateRegister()) return;

    try {
      const data = await registerApi(registerData);

      console.log("Register success:", data);

      alert("Register success!");

      // ถ้าอยาก auto login หลังสมัคร
      localStorage.setItem(Configs.storage.token, data.token);

      login({
        username: data.fullname,
        fullname: data.fullname,
        tel: data.tel,
        email: data.email,
      });

      navigate("/");
    } catch (error) {
      console.error("Register failed:", error);
      alert("Register failed");
    }
  };

  // const handleRegister = async () => {
  //   if (!validateRegister()) return;

  //   try {
  //     console.log("Register success:", registerData);
  //     alert("Register success!");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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
          <div
            className={`h-full flex flex-col justify-center gap-2 p-12 transition-opacity duration-[150ms] delay-[200ms] absolute inset-0
            ${isRegister ? "opacity-0 pointer-events-none" : "opacity-100"}
          `}
          >
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
              <label>
                <input type="checkbox" className="mr-1" /> remember me
              </label>
              <a href="#">Forgot password</a>
            </div>

            <button
              onClick={handleLogin}
              className={`mt-5 bg-primary hover:bg-teal-600 text-white py-3 rounded-lg font-bold`}
            >
              Login
            </button>
          </div>

          <div
            className={`h-full flex flex-col justify-center gap-2 p-12 transition-opacity duration-[150ms] delay-[200ms] absolute inset-0
            ${isRegister ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
          >
            <Input
              label="Full name"
              value={registerData.fullname}
              onChange={(e) =>
                setRegisterData({ ...registerData, fullname: e.target.value })
              }
              error={errors.fullname}
            />
            <Input
              label="Email"
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              error={errors.email}
            />

            <Input
              label="Telephone number"
              value={registerData.tel}
              onChange={(e) =>
                setRegisterData({ ...registerData, tel: e.target.value })
              }
              error={errors.tel}
            />
            <Input
              label="Password"
              type="password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              error={errors.password}
            />

            <Input
              label="Confirm password"
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  confirmPassword: e.target.value,
                })
              }
              error={errors.confirmPassword}
            />

            <label className="text-xs text-gray-700 mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={registerData.agree}
                onChange={(e) =>
                  setRegisterData({ ...registerData, agree: e.target.checked })
                }
              />
              I agree to Terms
            </label>

            {errors.agree && (
              <span className="text-red-500 text-xs">{errors.agree}</span>
            )}

            <button
              onClick={handleRegister}
              disabled={!registerData.agree}
              style={{ backgroundColor: COLORS.GREEN }}
              className={`mt-5 text-white py-3 rounded-lg font-bold${!registerData.agree ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-600"}`}
            >
              Create account
            </button>
          </div>
        </div>

        <div className="absolute inset-0 z-10">
          <div
            className={`
              absolute right-0 top-0 w-1/2 h-full 
              flex flex-col justify-center items-center text-center px-12 text-white
              transition-all duration-0 ease-in-out
              ${
                isRegister
                  ? "opacity-0 scale-95 blur-sm pointer-events-none delay-[700ms]"
                  : "opacity-100 scale-100 blur-0 delay-0"
              }
          `}
          >
            <h1 className={`${textStyles.title} mb-2`}>Welcome back</h1>
            <p className={`${textStyles.subtitle} mb-20`}>
              To continue, please enter
              <br />
              your login details.
            </p>
            <p className={`${textStyles.subheader} mb-3`}>
              New here? Create an account.
            </p>
            <button
              onClick={() => setIsRegister(true)}
              className={`w-[80%] bg-white font-thai font-semibold text-[${COLORS.BLACK}] px-6 py-3 rounded-lg hover:bg-[#474747] hover:text-white duration-200`}
            >
              Register
            </button>
          </div>

          <div
            className={`
              absolute left-0 top-0 w-1/2 h-full
              flex flex-col justify-center items-center text-center px-12 text-white
              transition-all duration-0 ease-in-out
              ${
                isRegister
                  ? "opacity-100 scale-100 blur-0 delay-0"
                  : "opacity-0 scale-95 blur-sm pointer-events-none delay-[700ms]"
              }
          `}
          >
            <h1 className={`${textStyles.title} mb-2`}>Create account</h1>
            <p className={`${textStyles.subtitle} mb-20`}>
              Enter your information to sign in.
            </p>
            <p className={`${textStyles.subheader} mb-3`}>
              Already have account?
            </p>
            <button
              onClick={() => setIsRegister(false)}
              className="w-[80%] bg-white font-thai font-semibold text-[#474747] px-6 py-3 rounded-lg hover:bg-[#474747] hover:text-white duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`px-3 py-2 rounded-lg border bg-white/80 
          focus:outline-none focus:ring-2 
          ${
            error ? "border-red-500 focus:ring-red-400" : "focus:ring-teal-500"
          }`}
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
