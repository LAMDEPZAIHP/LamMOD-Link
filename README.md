# LamMOD Link

Dịch vụ tạo link chuyển hướng có màn hình chờ 6 giây.

## Chạy local
- Cài Node.js 18+
- `npm install`
- `ADMIN_PASSWORD=your-secret npm start`

Trên Windows PowerShell:
`$env:ADMIN_PASSWORD="your-secret"; npm start`

Mở `http://localhost:3000`.

## Deploy Render
1. Tạo repository GitHub mới tên `LamMOD-Link`, upload toàn bộ nội dung thư mục này (để `server.js`, `package.json`, `public/`, `data/` ở thư mục gốc repo).
2. Render → New → Web Service → kết nối repo.
3. Runtime: Node; Build Command: `npm install`; Start Command: `npm start`.
4. Environment Variables:
   - `ADMIN_PASSWORD` = mật khẩu quản trị dài, khó đoán.
   - `DATA_DIR` = `/var/data`
5. Nếu muốn dữ liệu link không mất khi deploy/restart: tạo Persistent Disk trên Render, mount path `/var/data`.
6. Deploy, mở URL Render. Dashboard nằm ở trang chủ `/`.

## Dùng
- Đăng nhập bằng `ADMIN_PASSWORD`.
- Nhập URL đích đầy đủ `https://...`.
- Nhập slug, ví dụ `halloween`.
- Link thực tế: `https://TEN-SERVICE.onrender.com/r/halloween`.

## Lưu ý về `.lammod`
`.lammod` hiện chỉ là nhãn/định danh hiển thị trong dashboard, không phải tên miền Internet công khai. Để có URL dạng `halloween.lammod` thật sự hoạt động trên Internet, cần đăng ký một tên miền hợp lệ do bạn sở hữu, sau đó cấu hình DNS/wildcard và domain routing. Trong bản này, URL truy cập thật dùng `/r/<slug>` trên domain Render.
