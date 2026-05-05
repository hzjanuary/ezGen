// ============================================================
// ezGen — Video Generation Engine (Chuẩn bị cho tương lai)
// Kiến trúc sẵn sàng kết nối: Runway Gen-3, Luma, Kling AI
// ============================================================

/** Kết quả trả về từ Video Engine */
export interface VideoResult {
  url: string;
  thumbnailUrl: string;
  duration: number;
}

/** Interface chung cho mọi Video Engine */
interface VideoEngine {
  name: string;
  generate(prompt: string, options: VideoOptions): Promise<VideoResult>;
  /** Kiểm tra trạng thái tạo video (polling) */
  checkStatus(taskId: string): Promise<VideoTaskStatus>;
}

interface VideoOptions {
  /** Ảnh đầu vào cho image-to-video */
  sourceImageUrl?: string;
  duration: number;
  aspectRatio?: string;
}

interface VideoTaskStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: VideoResult;
  error?: string;
}

// ============================================================
// Runway Gen-3 Alpha (Placeholder)
// ============================================================
class RunwayEngine implements VideoEngine {
  name = 'Runway Gen-3 Alpha';

  async generate(_prompt: string, _options: VideoOptions): Promise<VideoResult> {
    // TODO: Tích hợp Runway API khi có access
    // API docs: https://docs.runwayml.com/
    throw new Error('Runway Gen-3 sẽ sớm được tích hợp! Vui lòng quay lại sau. 🚧');
  }

  async checkStatus(_taskId: string): Promise<VideoTaskStatus> {
    throw new Error('Chưa triển khai');
  }
}

// ============================================================
// Luma Dream Machine (Placeholder)
// ============================================================
class LumaEngine implements VideoEngine {
  name = 'Luma Dream Machine';

  async generate(_prompt: string, _options: VideoOptions): Promise<VideoResult> {
    // TODO: Tích hợp Luma API
    // API docs: https://docs.lumalabs.ai/
    throw new Error('Luma Dream Machine sẽ sớm được tích hợp! Vui lòng quay lại sau. 🚧');
  }

  async checkStatus(_taskId: string): Promise<VideoTaskStatus> {
    throw new Error('Chưa triển khai');
  }
}

// ============================================================
// Kling AI (Placeholder)
// ============================================================
class KlingEngine implements VideoEngine {
  name = 'Kling AI';

  async generate(_prompt: string, _options: VideoOptions): Promise<VideoResult> {
    // TODO: Tích hợp Kling AI API
    throw new Error('Kling AI sẽ sớm được tích hợp! Vui lòng quay lại sau. 🚧');
  }

  async checkStatus(_taskId: string): Promise<VideoTaskStatus> {
    throw new Error('Chưa triển khai');
  }
}

/** Factory để lấy Video Engine */
export function getVideoEngine(engineType: string): VideoEngine {
  switch (engineType) {
    case 'runway':
      return new RunwayEngine();
    case 'luma':
      return new LumaEngine();
    case 'kling':
      return new KlingEngine();
    default:
      return new RunwayEngine();
  }
}
