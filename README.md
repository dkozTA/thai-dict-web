# 🇹🇭 Thai Dictionary Web Application

A comprehensive web application for learning and translating Thai language with Vietnamese support.

## 🎯 Mục tiêu web

- Hỗ trợ dịch từ/đoạn văn ngôn ngữ Thái (Việt Nam) sang tiếng Việt.
- Bảo tồn và phát triển ngôn ngữ dân tộc Thái.
- Có khả năng mở rộng thành web học ngôn ngữ Thái.

## ✨ Chức năng

### 1. Chức năng người dùng

- **Tra cứu từ / câu**
  - Tìm kiếm từ/câu Thái để lấy nghĩa tiếng Việt.
  - Gợi ý từ gần đúng nếu người dùng gõ sai.
  - Hỗ trợ cả chữ Latin và chữ Thái nếu có.

- **Dịch đoạn văn**
  - Nhập đoạn văn ngắn tiếng Thái → Dịch sang tiếng Việt.
  - Hiển thị chú thích ngữ pháp hoặc từ khó nếu có.

- **Lịch sử tra cứu**
  - Người dùng không đăng nhập vẫn có thể xem lại lịch sử tra cứu gần đây (lưu localStorage).
  - Có nút xoá lịch sử.

- **Đăng nhập, đăng ký**
  - Người dùng quản lý tài khoản của mình.

- **Lưu từ vào sổ tay**
  - Người dùng tạo sổ tay.
  - Người dùng lưu từ vào sổ tay.
  - Có thể xóa từ khỏi sổ tay.

- **Flashcard + luyện học**
  - Người dùng học các từ vựng theo các chuyên ngành bằng flashcard hoặc xem như 1 list.
  - Có chức năng trắc nghiệm hoặc nối các thẻ từ (gồm từ tiếng Thái và nghĩa tiếng Việt).
  - Có thể tạo flashcard từ sổ tay và share lên cho mọi người xem.

- **Luyện đọc**
  - Người dùng luyện đọc bằng đoạn văn (có phiên âm nếu có thể).
  - Ấn vào từ thì sẽ có một ô popup lên dịch nhẹ.

- **Góp ý**
  - Người dùng góp ý sửa các từ nếu có sai sót.

### 2. Các chức năng nâng cao

- **Dịch bằng lời nói**
  - Nói tiếng Thái dịch tiếng Việt và ngược lại.

- **Dịch bằng hình ảnh**
  - Người dùng chụp ảnh và dịch ảnh người dùng đăng lên.

- **Chatbot giúp học tiếng Thái (optional)**
  - Người dùng có thể nhắn tin với chatbot hỏi về tiếng Thái.

---

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd thai-dict-web
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm start

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Thai language community
- Vietnamese-Thai translation resources