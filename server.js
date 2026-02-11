const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cấu hình Cloudinary (Dựa trên image_9a039e.png)
cloudinary.config({ 
  cloud_name: 'dozersmzf', 
  api_key: '579715337922948', 
  api_secret: 'jdKzycomgMye217f9i...' // Bạn tự copy nốt phần còn lại trong ảnh nhé
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'scam_evidence' },
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public'));

const SHEET_READ_URL = "https://opensheet.elk.sh/1xYNcwa3zy2V8tOazkwom49zNyNpx6j_R7U5CEaSXk3M/Sheet1";
const SHEET_WRITE_URL = "DÁN_LINK_SHEET_BEST_CỦA_BẠN_VÀO_ĐÂY";

// API Kiểm tra
app.post('/check', async (req, res) => {
    const { info } = req.body;
    try {
        const response = await axios.get(SHEET_READ_URL);
        const blackList = response.data;
        const found = blackList.find(item => String(item.sdt_stk).trim() === String(info).trim());
        if (found) {
            res.json({ isScam: true, message: `CẢNH BÁO: ${found.ho_ten} - ${found.ly_do}` });
        } else {
            res.json({ isScam: false, message: "Hiện chưa có trong danh sách đen." });
        }
    } catch (error) { res.status(500).json({ message: "Lỗi dữ liệu!" }); }
});

// API Báo cáo kèm Upload ảnh
app.post('/report', upload.single('hinh_anh'), async (req, res) => {
    try {
        const data = {
            ...req.body,
            bang_chung: req.file ? req.file.path : "", // Link ảnh từ Cloudinary
            ngay_gui: new Date().toLocaleString('vi-VN')
        };
        await axios.post(SHEET_WRITE_URL, data);
        res.json({ success: true, message: "Gửi báo cáo thành công!" });
    } catch (error) {
        res.json({ success: false, message: "Gửi thất bại!" });
    }
});

app.listen(PORT, () => console.log(`Server chạy tại Port ${PORT}`));