const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // โหลดค่าจาก .env

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY; // ห้ามลืมใส่ใน .env

// --- 1. Middleware ---
app.use(cors()); // อนุญาตให้ Frontend ยิงเข้ามาได้
app.use(express.json()); // อ่าน JSON จาก Body

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 3. Mongoose Schemas (โครงสร้างตาราง) ---

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' } // แยก Role ตรงนี้
});
const User = mongoose.model('User', userSchema);

// Post Schema
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ผูกกับ User
    created_at: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- 4. Custom Middleware: เช็ค Token ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) return res.status(401).json({ message: "Access Denied: No Token" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user; // แปะข้อมูล user (id, role) ไว้ใช้ต่อ
        next();
    });
};

// --- 5. Routes (Authentication) ---

// Register (สมัครสมาชิกทั่วไป)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // เช็คชื่อซ้ำ
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        // เข้ารหัส Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้าง User
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: 'user' // Default เป็น user
        });

        res.status(201).json({ message: "User registered", userId: newUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ message: "User not found" });

        // เช็ค Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        // สร้าง Token (ใส่ ID และ Role)
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        res.json({ message: "Login success", token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Admin (เฉพาะ Admin เท่านั้นที่สร้าง Admin ได้)
app.post('/create-admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }
    
    // Logic เหมือน Register แต่บังคับ role: 'admin'
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword, role: 'admin' });
        res.status(201).json({ message: "New Admin created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 6. Routes (Posts) ---

// Get Posts (พร้อม Filter & Sort)
app.get('/getpost', authenticateToken, async (req, res) => {
    try {
        const { order_by, search } = req.query;
        let query = {};

        // Search Filter (ค้นหาจาก Title)
        if (search) {
            query.title = { $regex: search, $options: 'i' }; // 'i' คือไม่สนตัวพิมพ์เล็กใหญ่
        }

        // เตรียมคำสั่ง Find
        let postsQuery = Post.find(query).populate('owner', 'username role'); // ดึงชื่อคนโพสต์มาด้วย

        // Sort Filter
        if (order_by === 'post_date') {
            postsQuery = postsQuery.sort({ created_at: -1 }); // ใหม่ -> เก่า
        } else {
            postsQuery = postsQuery.sort({ created_at: 1 }); // เก่า -> ใหม่
        }

        const posts = await postsQuery.exec();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Post
app.post('/post', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const newPost = await Post.create({
            title,
            content,
            owner: req.user.id // เอา ID จาก Token มาใส่
        });
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Post (Patch)
app.patch('/editpost/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check Permission: เจ้าของโพสต์แก้ได้ หรือ Admin แก้ได้ทุกโพสต์
        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You are not allowed to edit this post" });
        }

        // Update
        if (title) post.title = title;
        if (content) post.content = content;
        await post.save();

        res.json({ message: "Post updated", post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Post (ลบโพสต์)
app.delete('/deletepost/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check Permission: เจ้าของลบได้ หรือ Admin ลบได้ทุกโพสต์ (ปุ่มแดง)
        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You are not allowed to delete this post" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});