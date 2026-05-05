1. Tầm nhìn dự án (Vision)
Xây dựng một hệ sinh thái sáng tạo AI tích hợp (Creative Suite) tương tự như Duky AI. Hệ thống tập trung vào trải nghiệm người dùng Việt Nam, sử dụng ngôn ngữ tự nhiên để điều khiển các mô hình tạo ảnh và video tiên tiến nhất.

2. Stack Công nghệ Chi tiết (Technical Stack)
Claude Opus cần tuân thủ các công nghệ sau để đảm bảo hiệu suất và khả năng mở rộng:


Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS.


Hệ thống UI: Tối giản (Minimalism), hỗ trợ Dark Mode, tập trung vào tính bản địa hóa.


Trình xử lý ngôn ngữ (Prompt Engine): Google Gemini 1.5 Flash API (đóng vai trợ lý "Ngân").

Trình tạo hình ảnh (Image Engine):


Imagen 3 API: Cho các yêu cầu chất lượng cao từ Google.


Stable Diffusion (via Fal.ai/Replicate): Để tinh chỉnh (fine-tuning) các chi tiết đặc thù Việt Nam như áo dài, phong cảnh phố cổ.


Trình tạo Video (Video Engine): Cấu trúc sẵn sàng kết nối API với Kling AI, Luma Dream Machine hoặc Runway Gen-3.


Hạ tầng: Quản lý API qua Google AI Studio và biến môi trường bảo mật.

3. Kiến trúc Logic cho Agent
A. Hệ thống Trợ lý "Ngân" (LLM Layer)

Nhiệm vụ: Phân tích ý tưởng thô của người dùng thành Prompt kỹ thuật.


System Prompt Chỉ thị: "Bạn là Ngân, trợ lý sáng tạo của Duky AI. Bạn hiểu sâu sắc về văn hóa, từ lóng và thẩm mỹ của người Việt. Khi người dùng yêu cầu, hãy tư vấn và tự động tối ưu hóa prompt bằng tiếng Anh cho các máy tạo ảnh nhưng vẫn giữ được hồn cốt Việt."

B. Luồng xử lý hình ảnh & Video

Input: Người dùng nhập yêu cầu bằng tiếng Việt.


Processing: Gemini 1.5 Flash chuyển đổi sang Prompt chuyên sâu.


Generation: Gọi API Imagen 3 hoặc Stable Diffusion để tạo ảnh.


Output: Hiển thị kết quả với các tùy chọn tải xuống, chia sẻ hoặc nâng cấp lên video.

4. Danh sách nhiệm vụ cho Claude Opus (Checklist)
Giai đoạn 1: Khởi tạo Core & UI 

[ ] Thiết lập Boilerplate Next.js với Tailwind và Lucide Icons.

[ ] Xây dựng layout Dashboard gồm: Sidebar lịch sử, Chat interface trung tâm và Canvas hiển thị kết quả.

Giai đoạn 2: Kết nối "Bộ não" Gemini 

[ ] Viết API Route /api/chat kết nối Google AI Studio.

[ ] Triển khai Stream response để trợ lý "Thư" phản hồi thời gian thực.

Giai đoạn 3: Tích hợp Image Generation 

[ ] Viết Server Action để xử lý yêu cầu tạo ảnh từ prompt đã tối ưu.

[ ] Xây dựng bộ lọc (Filter) phong cách: Chân thực, Hoạt hình, Hội họa Việt Nam.

Giai đoạn 4: Quản lý Video & Asset 

[ ] Thiết lập cấu trúc API sẵn sàng cho Runway Gen-3/Luma.

[ ] Xây dựng Gallery cá nhân để lưu trữ tác phẩm.

5. Lưu ý bảo mật & Hiệu suất

API Management: Tuyệt đối không để lộ API Key ở Client-side; sử dụng Server-side components.


Cấu hình Hạ tầng: Tận dụng Cloud GPU để đảm bảo ảnh được tạo trong vài giây và video trong vài phút.


Responsive: Đảm bảo giao diện hoạt động hoàn hảo trên thiết bị di động (Mobile-first).


Yêu cầu đối với Agent: Hãy bắt đầu thực hiện Giai đoạn 1. Hãy viết mã sạch, chia nhỏ các component và cung cấp chú thích bằng tiếng Việt cho các phần logic quan trọng.