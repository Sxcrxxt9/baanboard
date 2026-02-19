import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import client from "../api/client"
import Configs from "../config"
import { ThumbsUp, MessageSquare } from "lucide-react"

export default function PostDetail() {
    const { id } = useParams()
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userId, setUserId] = useState(null)
    const [isLiked, setIsLiked] = useState(false)
    const [showCommentModal, setShowCommentModal] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        fetchPost()
    }, [id])

    const fetchPost = async () => {
        try {
            setLoading(true)
            const [postRes, profileRes] = await Promise.all([
                client.get(Configs.api.get.post + `/${id}`),
                client.get(Configs.api.get.profile),
            ])

            setPost(postRes.data)
            setProfile(profileRes.data)
            const currentUserId = profileRes.data._id
            setUserId(currentUserId)

            if (postRes.data.likes?.includes(currentUserId)) {
                setIsLiked(true)
            } else {
                setIsLiked(false)
            }
        } catch (err) {
            console.error(err)
            setError("Failed to load post")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitComment = async () => {
        try {
            if (!commentText.trim()) return
            await client.post(
                Configs.api.post.comment + post._id + "/comment",
                { text: commentText }
            )

            setPost(prev => ({
                ...prev,
                comments: [
                    ...prev.comments,
                    {
                    text: commentText,
                    owner: { fullname: profile.fullname },
                    created_at: new Date().toISOString()
                    }
                ]
            }))
            setCommentText("")
            setShowCommentModal(false)
        } catch (err) {
            console.error(err)
        }
    }

    const handleLike = async () => {
        try {
            if (!post || !userId) return

            await client.post(
            Configs.api.post.like + post._id + "/like"
            )

            setPost(prev => {
                const alreadyLiked = prev.likes?.includes(userId)

                const updatedLikes = alreadyLiked
                    ? prev.likes.filter(id => id !== userId)
                    : [...prev.likes, userId]

                return {
                    ...prev,
                    likes: updatedLikes,
                    likeCount: updatedLikes.length
                }
            })
            setIsLiked(prev => !prev)

        } catch (err) {
            console.error(err.response?.data || err)
        }
    }

    if (loading) return <p className="p-10">Loading...</p>
    if (error) return <p className="p-10 text-red-500">{error}</p>
    if (!post) return null

    const tags = post.tag ? post.tag.split(",") : []

    return (
        <div className="min-h-[91vh] bg-gray-100">
            <div className="bg-white p-10 shadow-sm">
                <div className="flex gap-10 min-h-[40vh] relative items-center">
                <img
                    src={post.image}
                    alt={post.title}
                    className="h-[35vh] w-[20vw] object-cover rounded"
                />
                <div className="flex-1">
                    <div className="h-60">
                        <h1 className="text-2xl font-bold text-gray-800">
                        {post.title}
                        </h1>
                    
                        <div className="flex justify-between gap-8 items-start">    
                            <p className="text-gray-600 mt-1">
                            {post.owner?.fullname}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>  
                        <p className="text-gray-700 mt-6 leading-relaxed">{post.content}</p>                
                    </div>
                    
                    <div className="flex gap-2 mt-6 flex-wrap">
                    {tags.map((tag, index) => (
                        <span
                        key={index}
                        className="px-3 py-1 bg-primary text-white text-xs rounded-full"
                        >
                        {tag}
                        </span>
                    ))}
                    </div>

                    {/* Like / Comment Count */}
                    <div className="flex gap-8 mt-4 text-gray-600">
                    <div className="flex items-center gap-2">
                        <ThumbsUp
                            size={22}
                            onClick={handleLike}
                            className={`cursor-pointer select-none transition ${
                                isLiked ? "fill-teal-600 text-teal-600" : "text-gray-600"
                            }`}
                        />
                        {post.likeCount}
                    </div>

                    <div className="flex items-center gap-2">
                        <MessageSquare size={22} />
                        {post.comments?.length || 0}
                    </div>
                    </div>

                </div>
                </div>
            </div>

            <div className="mt-10 px-10 pb-20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg text-gray-800 font-semibold">
                        Comments
                    </h2>

                    <button
                        onClick={() => setShowCommentModal(true)}
                        className="bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 transition"
                    >
                        + comment
                    </button>
                </div>

                {post.comments?.length === 0 && (
                    <p className="text-gray-800">No comments yet</p>
                )}

                <div className="space-y-6">
                    {post.comments?.map((comment, index) => (
                        <div
                        key={index}
                        className="bg-white p-6 rounded-lg border shadow"
                        >
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gray-400 rounded-full" />
                            <span className="font-medium text-gray-800">
                                {comment.owner?.fullname}
                            </span>
                            </div>

                            <span className="text-gray-500 text-sm">
                            {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {comment.text}
                        </p>
                        </div>
                    ))}
                </div>
            </div>
            {showCommentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
                    
                    <h3 className="text-lg text-gray-800 font-semibold mb-4">
                        Add Comment
                    </h3>

                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                        rows="4"
                        placeholder="Write your comment..."
                    />

                    <div className="flex justify-end gap-3">
                        <button
                        onClick={() => setShowCommentModal(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>

                        <button
                        onClick={handleSubmitComment}
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                        >
                            Confirm
                        </button>
                    </div>

                    </div>
                </div>
            )}
        </div>
    )
}
