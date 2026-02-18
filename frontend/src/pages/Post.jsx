import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyPostsApi } from "../api/post";

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

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      <h1 className="text-2xl font-bold mb-6">My post - {user?.username}</h1>

      <div className="grid grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow">
            <img src={post.image} className="h-40 w-full object-cover" />

            <div className="p-4">
              <div className="flex gap-2 flex-wrap mb-2">
                {post.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="font-semibold text-teal-600">{post.title}</h2>

              <p className="text-sm text-gray-500 mt-1">{post.description}</p>

              <div className="text-xs text-gray-400 mt-3">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
