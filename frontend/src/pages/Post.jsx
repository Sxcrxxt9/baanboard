import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyPostsApi } from "../api/post";
import { FaTrash, FaEdit} from "react-icons/fa";
import { ThumbsUp, MessageSquare } from "lucide-react"
import Configs from "../config";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Post() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getMyPostsApi();
        setPosts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  // console.log("my post: ", posts)

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      <h1 className="text-2xl font-bold mb-6">My post - {user?.username}</h1>

      <div className="grid grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition"
          >
            <img
              onClick={() => navigate(`/postdetail/${post._id}`)}
              src={post.image}
              alt="post"
              className="h-60 w-full object-cover"
            />

            <div className="p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-teal-600 font-semibold text-lg">
                  {post.title}
                </h2>
                <div className="flex justify-between items-center gap-5">
                  <FaEdit
                    className="text-gray-600 cursor-pointer hover:text-teal-600 transition"
                    onClick={() => navigate(`/editpost/${post._id}`)}
                  />                  
                  <FaTrash
                    className="text-gray-600 cursor-pointer hover:text-red-500 transition"
                    onClick={() => handleDelete(post._id)}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 break-words">
                {post.description}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap text-xs items-center">
                <span className="text-gray-600 text-sm">Tag</span>
                {post.tag &&
                  post.tag.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-600 text-white rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>

              <h2 className="font-semibold text-teal-600">{post.title}</h2>

              <div className="flex justify-between items-center mt-4 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={18} />
                  {post.likeCount || 0}
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare size={18}/>
                  {post.comments.length || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
