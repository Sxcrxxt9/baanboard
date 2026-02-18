import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import { IoCallOutline, IoMailOutline } from "react-icons/io5"
import { textStyles,COLORS } from "../style/text"

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("liked")

  return (
        <div className="min-h-screen bg-white">
          <div className="h-56 bg-gray-100" />
          <div className="bg-white shadow relative">
            <div className="max-w-6xl mx-auto px-8 py-6 relative">
              <div className="absolute -top-20 left-8">
                <img
                  alt="profile"
                  className="w-40 h-40 rounded-full border-4 border-white object-cover"
                />
                <p className="absolute -bottom-10 left-8 text-sm text-gray-600 mt-2 cursor-pointer hover:underline">
                  Change profile
                </p>
              </div>
              <div className="ml-56 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    @{user?.username}
                  </h1>

                  <p className="text-gray-600 mt-1">
                    {user?.fullname}
                  </p>
                  <div className="flex gap-8 mt-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <IoCallOutline size={18}/>
                      {user?.tel}
                    </div>

                    <div className="flex items-center gap-2">
                      <IoMailOutline size={18} />
                      {user?.email}
                    </div>
                  </div>
                </div>
                <button className="text-primary font-medium hover:underline">
                  Edit profile
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-8 border-b mt-10 mx-10">
            <button
              onClick={() => setActiveTab("liked")}
              className={`pb-3 font-medium ${
                activeTab === "liked"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              }`}
            >
              Liked post
            </button>
            <button
              onClick={() => setActiveTab("commented")}
              className={`pb-3 font-medium ${
                activeTab === "commented"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              }`}
            >
              Commented post
            </button>
          </div>

          <div className="mt-8 space-y-6 mx-10">
            {activeTab === "liked" && (
              <>
                <PostCard />
                <PostCard />
              </>
            )}

            {activeTab === "commented" && (
              <>
                <PostCard />
              </>
            )}
          </div> 
      </div>
  )
}

function PostCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-4">
      <img
        className="w-40 h-28 rounded-md object-cover"
        alt=""
      />
      <div className="flex-1">
        <h3 className={`font-semibold text-primary`}>Header</h3>
        <p className={`text-gray-600 text-sm mt-2`}>
          text text text text text text text text text text text text text text text
        </p>
        <div className="flex gap-2 mt-3 text-xs">
          <span className={`${textStyles.subheader} px-3 py-1 bg-primary text-white rounded-full`}>
            Sport
          </span>
          <span className={`${textStyles.subheader} px-3 py-1 bg-primary text-white rounded-full`}>
            Entertainment
          </span>
          <span className={`${textStyles.subheader} px-3 py-1 bg-primary text-white rounded-full`}>
            News
          </span>
        </div>
      </div>
    </div>
  )
}
