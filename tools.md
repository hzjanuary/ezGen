Để vận hành các chức năng sáng tạo như tạo ảnh, tạo video và hỗ trợ người dùng, nền tảng ezGen (Creative Suite AI) sử dụng một hệ sinh thái kết hợp nhiều công cụ Trí tuệ nhân tạo (Generative AI) tiên tiến nhất hiện nay, với kiến trúc Multi-Provider tự động Fallback để đảm bảo tính ổn định cao nhất:

1. Công cụ cho chức năng tạo ảnh (Image Generation)
Hệ thống sử dụng các mô hình khuếch tán (Diffusion Models) hàng đầu để chuyển đổi văn bản thành hình ảnh, với thứ tự ưu tiên (Fallback chain):
- **Google Imagen 4.0**: Engine mặc định, khả năng tạo ảnh người thực cực kỳ chính xác và chân thật.
- **Gemini 2.5 Flash Image (Banana)**: Engine dự phòng số 1, có khả năng hiểu ngữ cảnh Việt Nam rất tốt và tạo ảnh nhanh chóng.
- **OpenAI (DALL-E 3)**: Engine dự phòng số 2. Khả năng tuân thủ text prompt tuyệt vời và chất lượng hình ảnh rất cao.

2. Công cụ cho chức năng tạo video (Video Generation)
Để tạo chuyển động cho hình ảnh hoặc kịch bản, trang web ứng dụng các mô hình Video Transformer mạnh mẽ (chuẩn bị tích hợp vào `/api/generate-video`):
- **Kling AI & Luma Dream Machine**: Giúp tạo ra các chuyển động tự nhiên, mượt mà ở độ phân giải cao.
- **Runway Gen-3 Alpha**: Chuyên xử lý tính nhất quán giữa các khung hình và các hiệu ứng vật lý phức tạp, đảm bảo video không bị biến dạng.
- **Sora**: Công nghệ từ OpenAI đang được tích hợp thử nghiệm để tạo ra các cảnh quay phức tạp và dài hơn.

3. Công cụ hỗ trợ Trợ lý ảo (LLMs - Text Generation & Prompt Optimization)
Hệ thống đã xây dựng thành công trợ lý ảo tên **"Thư"** để trực tiếp giao tiếp với người dùng và tối ưu hóa Prompt tiếng Việt sang tiếng Anh. Việc vận hành sử dụng cấu trúc Fallback chain đa lớp:
- **Gemini 2.5 Flash** (Google AI Studio): Đóng vai trò là "bộ não" chính, tốc độ cực nhanh, miễn phí giới hạn cao, và hiểu rất rõ văn hóa, từ lóng của Việt Nam.
- **OpenRouter**: API gateway dự phòng số 1, cung cấp quyền truy cập vào hơn 200 model hàng đầu như Claude 3.5 Sonnet, GPT-4o, Llama 3. Nhờ đó không lo bị nghẽn (rate limit) từ một nhà cung cấp duy nhất.
- **Groq Cloud (Llama 3.3 70B)**: API dự phòng số 2, tận dụng sức mạnh xử lý LPU của Groq cho tốc độ phản hồi gần như tức thì (hàng trăm token/giây), rất thích hợp cho việc tối ưu Prompt tự động.
- **Vietnamese Fine-tuning / System Prompting**: Trợ lý "Thư" được cấu hình (qua System Prompt) để hiểu sâu ngữ nghĩa, bối cảnh văn hóa và cả từ lóng của Việt Nam, giúp trợ lý giao tiếp một cách tự nhiên nhất.