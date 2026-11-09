import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";
import { ApiResponseBuilder } from "@/lib/api-response";
import { logError, createApiError } from "@/lib/error-handler";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiResponseBuilder.unauthorized('Silakan login untuk mengupload file');
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "general";

    if (!file) {
      return ApiResponseBuilder.validationError('File tidak ditemukan', { file: 'File harus dipilih' });
    }

    if (file.size > MAX_FILE_SIZE) {
      return ApiResponseBuilder.validationError(
        `Ukuran file maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        { size: `File terlalu besar: ${(file.size / (1024 * 1024)).toFixed(2)}MB` }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return ApiResponseBuilder.validationError(
        'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP',
        { type: `Format ${file.type} tidak didukung` }
      );
    }

    const safeSubfolder = subfolder.replace(/[^a-zA-Z0-9_-]/g, "");
    const fileUrl = await saveUploadedFile(file, safeSubfolder, file.name);

    return ApiResponseBuilder.success({
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    logError(createApiError('FILE_UPLOAD_ERROR'), 'POST /api/upload');
    return ApiResponseBuilder.error('FILE_UPLOAD_ERROR', 'Gagal mengupload file. Silakan coba lagi', undefined, 'Upload');
  }
}
