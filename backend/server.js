const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('DB Error:', err));

// --- 3. Cloudinary Setup ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'baanboard_posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// --- 4. Schemas ---

// User Schema (เพิ่มการเก็บ History)
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tel: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // เก็บ ID ของโพสต์ที่เกี่ยวข้อง
    myPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    commentedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});
const User = mongoose.model('User', userSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});

// Post Schema (เพิ่ม Tag)
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    
    
    tag: { 
        type: String, 
        required: true, 
    },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // คนที่มาไลก์
    comments: [commentSchema],
    created_at: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- 5. Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No Token" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user;
        next();
    });
};

// --- 6. Routes: Authentication ---

app.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        const { fullname, email, tel, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            tel,
            password: hashedPassword,
            profileImage: req.file ? req.file.path : null,
            role: 'user'
        });

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, fullname: user.fullname, email: user.email }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        res.json({ 
            token, 
            user: {
                id: user._id,
                fullname: user.fullname,
                role: user.role,
                profileImage: user.profileImage,
                email: user.email,
                tel: user.tel
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. Routes: Profile & User Data ---

// ดูข้อมูล Profile ตัวเอง (รวม list โพสต์ที่เกี่ยวข้อง)
app.get('/my-profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('myPosts')
            .populate('likedPosts')
            .populate('commentedPosts');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// แก้ไข Profile
app.put('/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        const updates = {};
        const { fullname, tel, password } = req.body;
        if (fullname) updates.fullname = fullname;
        if (tel) updates.tel = tel;
        if (password) updates.password = await bcrypt.hash(password, 10);
        if (req.file && req.file.path) updates.profileImage = req.file.path;

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 8. Routes: Posts (Main Features) ---

// 1. Create Post (ต้องเลือก Tag)
app.post('/post', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content, tag } = req.body;

        const image = req.file ? req.file.path : null;

        const newPost = await Post.create({
            title,
            content,
            tag,
            image, 
            owner: req.user.id
        });

        // Update User History (My Posts)
        await User.findByIdAndUpdate(req.user.id, {
            $push: { myPosts: newPost._id }
        });

        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get All Posts (ค้นหา + กรอง Tag)
app.get('/getpost', authenticateToken, async (req, res) => {
    try {
        const { search, tag, order_by } = req.query;
        let query = {};

        if (search) query.title = { $regex: search, $options: 'i' };
        if (tag) query.tag = tag;

        let postsQuery = Post.find(query)
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage');
        
        if (order_by === 'post_date') {
            postsQuery = postsQuery.sort({ created_at: -1 });
        } else {
            postsQuery = postsQuery.sort({ created_at: 1 });
        }

        const posts = await postsQuery.exec();
        res.json(posts.map(p => ({
            ...p.toObject(),
            likeCount: p.likes ? p.likes.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 3. Get My Posts (ดูโพสต์ทั้งหมดของตัวเอง)
app.get('/mypost', authenticateToken, async (req, res) => {
    try {
        // 1. ค้นหาโดยใช้ owner: req.user.id (ID จาก Token ของคน Login)
        const posts = await Post.find({ owner: req.user.id }) 
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage')
            .sort({ created_at: -1 }); // เรียงจากใหม่ไปเก่า

        // 2. เนื่องจากผลลัพธ์เป็น Array (หลายโพสต์) เราต้องวนลูป map เพื่อจัด format
        const result = posts.map(post => ({
            ...post.toObject(),
            likeCount: post.likes ? post.likes.length : 0
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Posts by User ID (ดูโพสต์ของคนอื่น หรือ ของตัวเอง)
// app.get('/user/:id/posts', authenticateToken, async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const posts = await Post.find({ owner: userId })
//             .populate('owner', 'fullname role profileImage')
//             .sort({ created_at: -1 });

//         res.json(posts.map(p => ({
//             ...p.toObject(),
//             likeCount: p.likes ? p.likes.length : 0,
//             commentCount: p.comments ? p.comments.length : 0
//         })));
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// 5. Delete Post
app.delete('/deletepost/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Not found" });
        
        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        await Post.findByIdAndDelete(req.params.id);
        
        // ลบ ID ออกจาก User myPosts ด้วยก็ได้ (Optional แต่แนะนำ)
        await User.findByIdAndUpdate(post.owner, {
            $pull: { myPosts: req.params.id }
        });

        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Edit Post
app.put('/post/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Not found' });

        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { title, content, tag } = req.body;
        if (title) post.title = title;
        if (content) post.content = content;
        if (tag) post.tag = tag;
        if (req.file && req.file.path) post.image = req.file.path;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 9. Routes: Actions (Like & Comment) ---

// Like / Unlike (Update both Post & User Profile)
app.post('/post/:id/like', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Not found' });

        const index = post.likes.findIndex(id => id.toString() === userId);
        
        if (index === -1) {
            // Like
            post.likes.push(userId);
            await post.save();
            await User.findByIdAndUpdate(userId, { $addToSet: { likedPosts: postId } });
        } else {
            // Unlike
            post.likes.splice(index, 1);
            await post.save();
            await User.findByIdAndUpdate(userId, { $pull: { likedPosts: postId } });
        }
        
        res.json({ likeCount: post.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Comment (Update both Post & User Profile)
app.post('/post/:id/comment', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Not found' });

        post.comments.push({ text, owner: userId });
        await post.save();

        await User.findByIdAndUpdate(userId, { $addToSet: { commentedPosts: postId } });

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Server Start ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));