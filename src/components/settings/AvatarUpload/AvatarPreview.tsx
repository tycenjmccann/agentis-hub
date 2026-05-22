import { Camera } from 'lucide-react'
import { useCallback, useState } from 'react'
import { DefaultAvatar } from './DefaultAvatar'

interface AvatarPreviewProps {
  previewUrl: string | null
  currentAvatarUrl: string | null
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
  onTriggerFileInput: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  disabled: boolean
}

export function AvatarPreview({
  previewUrl,
  currentAvatarUrl,
  uploadStatus,
  onTriggerFileInput,
  onKeyDown,
  disabled,
}: AvatarPreviewProps) {
  const [imageError, setImageError] = useState(false)
  const displayUrl = previewUrl ?? currentAvatarUrl
  const showImage = displayUrl && !imageError
  const isUploading = uploadStatus === 'uploading'
  const isSuccess = uploadStatus === 'success'

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled) {
      onTriggerFileInput()
    }
  }, [disabled, onTriggerFileInput])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={displayUrl ? 'Change avatar photo' : 'Upload avatar photo'}
      className={`group relative h-[120px] w-[120px] shrink-0 cursor-pointer overflow-hidden rounded-full border-[3px] border-surface-4 transition-all duration-200 hover:border-brand-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 sm:h-[150px] sm:w-[150px] ${
        isUploading ? 'animate-avatarPulse motion-reduce:animate-none' : ''
      } ${isSuccess ? 'border-status-running' : ''}`}
      onClick={handleClick}
      onKeyDown={onKeyDown}
    >
      {showImage ? (
        <img
          src={displayUrl}
          alt="Avatar preview"
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <DefaultAvatar size={150} />
      )}

      {!disabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none">
          <Camera className="mb-1 text-white" size={24} />
          <span className="text-xs font-medium text-white">Upload</span>
        </div>
      )}
    </div>
  )
}
