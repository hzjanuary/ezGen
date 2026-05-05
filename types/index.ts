// ============================================================
// ezGen Creative Suite AI — Type Definitions
// Định nghĩa kiểu dữ liệu cho toàn bộ hệ thống
// ============================================================

/** Vai trò trong cuộc hội thoại */
export type ChatRole = 'user' | 'assistant' | 'system';

/** Một tin nhắn trong cuộc hội thoại */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  /** Ảnh được tạo kèm theo tin nhắn (nếu có) */
  generatedImage?: GeneratedImage;
}

/** Phong cách tạo ảnh */
export type ImageStyle =
  | 'photorealistic'   // Chân thực
  | 'anime'            // Hoạt hình
  | 'vietnamese-art'   // Hội họa Việt Nam
  | 'cyberpunk'        // Cyberpunk
  | 'watercolor'       // Màu nước
  | 'oil-painting';    // Sơn dầu

/** Cấu hình cho việc tạo ảnh */
export interface ImageGenerationConfig {
  prompt: string;
  style: ImageStyle;
  /** Engine sử dụng: imagen, gemini, pollinations hoặc auto */
  engine: 'imagen' | 'gemini' | 'pollinations' | 'auto';
  /** Tỉ lệ khung hình */
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  /** Số lượng ảnh tạo ra */
  numImages: number;
}

/** Kết quả ảnh đã tạo */
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  optimizedPrompt: string;
  style: ImageStyle;
  engine: string;
  createdAt: number;
  /** Kích thước ảnh */
  width?: number;
  height?: number;
}

/** Một phiên làm việc (session) */
export interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** Tác phẩm trong Gallery */
export interface GalleryItem {
  id: string;
  image: GeneratedImage;
  /** Ghi chú của người dùng */
  note?: string;
  /** Đánh dấu yêu thích */
  isFavorite: boolean;
  savedAt: number;
}

/** Trạng thái của quá trình tạo ảnh */
export type GenerationStatus = 'idle' | 'optimizing' | 'generating' | 'complete' | 'error';

/** Cấu hình cho Video Engine (sẵn sàng cho tương lai) */
export interface VideoGenerationConfig {
  prompt: string;
  /** Ảnh đầu vào (image-to-video) */
  sourceImageUrl?: string;
  /** Engine video: runway, luma, kling */
  engine: 'runway' | 'luma' | 'kling';
  /** Thời lượng video (giây) */
  duration: 4 | 8 | 16;
}

/** Kết quả video đã tạo */
export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  engine: string;
  duration: number;
  createdAt: number;
  /** Thumbnail preview */
  thumbnailUrl?: string;
}

/** Style label mapping cho hiển thị tiếng Việt */
export const STYLE_LABELS: Record<ImageStyle, string> = {
  'photorealistic': 'Chân thực',
  'anime': 'Hoạt hình',
  'vietnamese-art': 'Hội họa Việt Nam',
  'cyberpunk': 'Cyberpunk',
  'watercolor': 'Màu nước',
  'oil-painting': 'Sơn dầu',
};

/** Mô tả style cho prompt engineering */
export const STYLE_PROMPTS: Record<ImageStyle, string> = {
  'photorealistic': 'photorealistic, ultra detailed, 8k, professional photography, cinematic lighting',
  'anime': 'anime style, cel shading, vibrant colors, Studio Ghibli inspired, detailed illustration',
  'vietnamese-art': 'traditional Vietnamese art style, lacquer painting, silk painting, áo dài elements, lotus motifs, Vietnamese cultural aesthetics',
  'cyberpunk': 'cyberpunk style, neon lights, futuristic, dark atmosphere, high tech low life, rain reflections',
  'watercolor': 'watercolor painting, soft edges, flowing colors, artistic, delicate brush strokes',
  'oil-painting': 'oil painting, rich textures, classical art style, dramatic lighting, museum quality',
};
