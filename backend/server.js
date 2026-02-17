const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // เพิ่ม multer
const cloudinary = require('cloudinary').v2; // เพิ่ม Cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // ตัวเชื่อม
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

// --- 3. Cloudinary Setup 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'baanboard_posts', // ชื่อโฟลเดอร์ใน Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// --- 4. Schemas ---
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true }, // ชื่อ-นามสกุล
    email: { type: String, required: true, unique: true }, // ใช้ Email เป็น ID หลักแทน Username
    tel: { type: String, required: true }, // เบอร์โทร
    password: { type: String, required: true },
    profileImage: { type: String, default: null }, // URL รูปโปรไฟล์
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

// sub-schema สำหรับ comment ที่จะฝังในโพสต์
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }, // เก็บ URL รูป
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ผู้ที่กดไลก์
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

// --- 6. Routes (Auth) ---
app.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        // รับค่าให้ครบตามหน้าเว็บ (Full name, Email, Tel, Password)
        const { fullname, email, tel, password } = req.body;

        // เช็คว่าอีเมลซ้ำไหม (แทนเช็ค username)
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // ตรวจสอบว่าเป็นผู้ใช้คนแรกไหม ถ้าใช่ให้เป็น admin
      

        // สร้าง User ใหม่
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

// --- แก้ไข Route Login (ต้อง Login ด้วย Email) ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // รับ Email แทน Username
        
        // ค้นหาจาก Email
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // ใน Token ใส่ fullname ไปด้วย เผื่อเอาไปโชว์มุมขวาบน
        const token = jwt.sign(
            { id: user._id, role: user.role, fullname: user.fullname,email:user.email,tel:user.tel, profileImage: user.profileImage }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        res.json({ token, role: user.role, fullname: user.fullname,email:user.email,tel:user.tel, profileImage: user.profileImage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. Routes (Auth & Admin) ---

// create admin user - only accessible by existing admin
app.post('/createadmin', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
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
            role: 'admin'
        });
        res.status(201).json({ message: 'Admin created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. Routes (Posts) ---

// Get Posts (ต้อง Login ก่อน)
app.get('/getpost', authenticateToken, async (req, res) => {
    try {
        const { search, order_by } = req.query;
        let query = {};
        if (search) query.title = { $regex: search, $options: 'i' };

        let posts = Post.find(query)
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage');
        
        if (order_by === 'post_date') {
            posts = posts.sort({ created_at: -1 });
        } else {
            posts = posts.sort({ created_at: 1 });
        }

        const result = await posts.exec();
        // เพิ่มจำนวนไลก์ให้ส่งกลับด้วย
        res.json(result.map(p => ({
            ...p.toObject(),
            likeCount: p.likes ? p.likes.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get posts liked by current user
app.get('/liked', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await Post.find({ likes: userId })
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage');

        res.json(posts.map(p => ({
            ...p.toObject(),
            likeCount: p.likes ? p.likes.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Post (ต้อง Login + อัปรูปได้)
// upload.single('image') คือตัวรับไฟล์จาก Frontend
app.post('/post', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // ถ้าอัปรูปสำเร็จ req.file.path จะเป็นลิงก์ URL จาก Cloudinary
        const image = req.file ? req.file.path : null;

        const newPost = await Post.create({
            title,
            content,
            image, 
            owner: req.user.id
        });
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Post
app.delete('/deletepost/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Not found" });
        
        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Post (owner or admin)
app.put('/post/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Not found' });

        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { title, content } = req.body;
        if (title) post.title = title;
        if (content) post.content = content;
        if (req.file && req.file.path) post.image = req.file.path;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like / Unlike post
app.post('/post/:id/like', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Not found' });

        const userId = req.user.id;
        const index = post.likes.findIndex(u => u.toString() === userId);
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }
        await post.save();
        res.json({ likeCount: post.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Comment on post
app.post('/post/:id/comment', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Not found' });

        post.comments.push({ text, owner: req.user.id });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update profile (fullname, tel, password, profileImage)
app.put('/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        const updates = {};
        const { fullname, tel, password } = req.body;
        if (fullname) updates.fullname = fullname;
        if (tel) updates.tel = tel;
        if (password) updates.password = await bcrypt.hash(password, 10);
        if (req.file && req.file.path) updates.profileImage = req.file.path;

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));