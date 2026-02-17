import { useEffect, useState, useMemo } from "react"
import { getPostsApi } from "../api/get"
import { useNavigate } from "react-router-dom"
import { ThumbsUp, MessageSquare } from "lucide-react"

export default function Home() {
  // const mockPosts = [
  //   {
  //     id: 1,
  //     header: "Sport News",
  //     content: "Latest football update and match highlights.",
  //     postOwner: "John",
  //     date: "2026-02-15",
  //     like: 200,
  //     comment: 30,
  //     tag: "Sport",
  //   },
  //   {
  //     id: 2,
  //     header: "New Game Release",
  //     content: "Top trending game this month.",
  //     postOwner: "Mike",
  //     date: "2026-02-14",
  //     like: 500,
  //     comment: 100,
  //     tag: "Game",
  //   },
  //   {
  //     id: 3,
  //     header: "Political Update",
  //     content: "Government announces new policy.",
  //     postOwner: "Anna",
  //     date: "2026-02-13",
  //     like: 100,
  //     comment: 10,
  //     tag: "Politic",
  //   },
  //   {
  //     id: 4,
  //     header: "Music Awards",
  //     content: "Biggest award night in music industry.",
  //     postOwner: "Lisa",
  //     date: "2026-02-12",
  //     like: 800,
  //     comment: 200,
  //     tag: "Music",
  //   },
  //   {
  //     id: 5,
  //     header: "Breaking News",
  //     content: "Major event happening now.",
  //     postOwner: "Tom",
  //     date: "2026-02-11",
  //     like: 300,
  //     comment: 50,
  //     tag: "News",
  //   },
  //   {
  //     id: 6,
  //     header: "Entertainment Gossip",
  //     content: "Celebrity trending today.",
  //     postOwner: "Jane",
  //     date: "2026-02-10",
  //     like: 650,
  //     comment: 90,
  //     tag: "Entertainment",
  //   },
  // ]
  const [posts, setPosts] = useState([])

  const tags = ["All post", "News", "Sport", "Politic", "Entertainment", "Game", "Music"]

  const [selectedTag, setSelectedTag] = useState("All post")
  const [sortType, setSortType] = useState("new")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPostsApi()
        setPosts(data)
      } catch (err) {
        console.error("Fetch post error:", err)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    let filtered =
      selectedTag === "All post"
        ? posts
        : posts.filter((p) => p.tag === selectedTag)

    if (sortType === "new") {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      )
    }

    return filtered
  }, [posts, selectedTag, sortType])

  const popularPosts = [...posts]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3)

  return (
    <div className="min-h-[91vh] bg-gray-100">
      <div className="bg-white shadow px-10 py-4 flex gap-8 text-gray-600 font-medium sticky top-0 z-20">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`${
              selectedTag === tag
                ? "text-teal-600 border-b-2 border-teal-600"
                : ""
            } pb-1`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex gap-8">

        <div className="w-1/4 bg-white p-6 shadow min-h-[85.5vh]">
          <h2 className="font-semibold mb-4">Filters</h2>
          <p className="mb-2 text-sm text-gray-500">Sorted by</p>
          <select
            className="w-full border rounded px-2 py-1 mb-4"
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
          </select>
        </div>

        <div className="w-3/4 py-8 pr-8">
          <h2 className="font-semibold mb-4 text-[#474747]">Popular post ★</h2>
          <div className="flex gap-6 mb-8">
            {popularPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white w-1/3 rounded shadow p-4"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-60 w-full object-cover rounded mb-3"
                />
                <h3 className="text-teal-600 font-semibold">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {post.owner?.fullname} |{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                <div className="flex justify-between text-sm text-gray-600 mt-5">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={16} />
                    {post.likeCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    {post.comments?.length}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-semibold mb-4 text-[#474747]">All post</h2>

          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded shadow p-4 flex gap-6"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-1/4 h-60 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-teal-600 font-semibold mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {post.owner?.fullname} |{" "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>                    
                  </div>

                  <p className="text-gray-600 mb-3">
                    {post.content}
                  </p>

                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={16} />
                        {post.likeCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={16} />
                        {post.comments?.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
