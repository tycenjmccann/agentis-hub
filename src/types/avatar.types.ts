export interface AvatarUploadState {
  currentAvatarUrl: string | null
  selectedFile: File | null
  previewUrl: string | null
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
  uploadProgress: number
  errorMessage: string | null
  errorType: 'file-type' | 'file-size' | 'upload-failed' | null
}

export interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string | null
  onUploadComplete?: (avatarUrl: string) => void
  maxFileSize?: number
  acceptedTypes?: string[]
}

export interface AvatarUploadResponse {
  avatarUrl: string
}
