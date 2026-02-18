import { Outlet } from "react-router-dom"
import Header from "../components/Header"

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
