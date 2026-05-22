import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { useAvatarUpload } from '../../../hooks/useAvatarUpload'
import type { AvatarUploadProps } from '../../../types/avatar.types'
import { AvatarPreview } from './AvatarPreview'
import { UploadProgress } from './UploadProgress'

export function AvatarUpload(props: AvatarUploadProps) {
  const { state, selectFile, handleSave, handleCancel, handleRetry, fileInputRef } =
    useAvatarUpload(props)

  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.selectedFile && state.uploadStatus === 'idle') {
      saveButtonRef.current?.focus()
    }
  }, [state.selectedFile, state.uploadStatus])

  useEffect(() => {
    if (state.uploadStatus === 'success') {
      avatarRef.current?.querySelector<HTMLElement>('[role="button"]')?.focus()
    }
  }, [state.uploadStatus])

  useEffect(() => {
    if (state.uploadStatus === 'error') {
      errorRef.current?.focus()
    }
  }, [state.uploadStatus])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        selectFile(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [selectFile, fileInputRef],
  )

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        triggerFileInput()
      } else if (e.key === 'Escape' && state.selectedFile) {
        e.preventDefault()
        handleCancel()
      }
    },
    [triggerFileInput, state.selectedFile, handleCancel],
  )

  const isUploading = state.uploadStatus === 'uploading'
  const hasSelection = state.selectedFile !== null
  const showActions = hasSelection || state.uploadStatus === 'error'

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div ref={avatarRef}>
        <AvatarPreview
          previewUrl={state.previewUrl}
          currentAvatarUrl={state.currentAvatarUrl}
          uploadStatus={state.uploadStatus}
          onTriggerFileInput={triggerFileInput}
          onKeyDown={handleKeyDown}
          disabled={isUploading}
        />
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          aria-label="Select avatar image file"
          onChange={handleFileChange}
        />

        {!hasSelection && state.uploadStatus !== 'uploading' && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="rounded-lg border border-surface-4 bg-surface-3 px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-4 hover:text-text-primary"
          >
            Change Avatar
          </button>
        )}

        {showActions && !isUploading && (
          <div className="flex gap-2 animate-slideUp motion-reduce:animate-none">
            <button
              ref={saveButtonRef}
              type="button"
              onClick={state.errorType === 'upload-failed' ? handleRetry : handleSave}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-500"
            >
              {state.errorType === 'upload-failed' ? 'Retry' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-surface-4 bg-surface-3 px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-4 hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        )}

        {isUploading && (
          <div className="flex flex-col gap-2 animate-slideUp motion-reduce:animate-none">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-brand-500" size={16} />
              <span className="text-xs text-text-muted">Uploading...</span>
            </div>
            <UploadProgress progress={state.uploadProgress} />
          </div>
        )}

        {state.uploadStatus === 'error' && state.errorMessage && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-1.5 animate-slideUp motion-reduce:animate-none"
          >
            <AlertCircle className="mt-0.5 shrink-0 text-status-error" size={14} />
            <span className="text-xs text-status-error">{state.errorMessage}</span>
          </div>
        )}

        {state.uploadStatus === 'success' && (
          <div className="flex items-center gap-1.5 animate-slideUp motion-reduce:animate-none">
            <CheckCircle2 className="text-status-running" size={14} />
            <span className="text-xs text-status-running">Avatar updated successfully</span>
          </div>
        )}

        <p className="text-xs text-text-muted">JPEG or PNG. Max 5MB.</p>
      </div>
    </div>
  )
}
