import { useCallback, useEffect, useRef, useState } from 'react'
import type { AvatarUploadProps, AvatarUploadResponse, AvatarUploadState } from '../types/avatar.types'

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png']

function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid file type or corrupted file'
    case 413:
      return 'File is too large. Maximum size is 5MB'
    case 401:
      return 'Unauthorized. Please sign in again.'
    case 429:
      return 'Too many requests. Please wait.'
    default:
      return 'Upload failed. Please check your connection and try again.'
  }
}

export function useAvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: AvatarUploadProps) {
  const [state, setState] = useState<AvatarUploadState>({
    currentAvatarUrl,
    selectedFile: null,
    previewUrl: null,
    uploadStatus: 'idle',
    uploadProgress: 0,
    errorMessage: null,
    errorType: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    setState((prev) => ({ ...prev, currentAvatarUrl }))
  }, [currentAvatarUrl])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const selectFile = useCallback(
    (file: File) => {
      if (!acceptedTypes.includes(file.type)) {
        setState((prev) => ({
          ...prev,
          selectedFile: null,
          previewUrl: null,
          uploadStatus: 'error',
          errorMessage: 'Invalid file type. Please select a JPEG or PNG image.',
          errorType: 'file-type',
        }))
        return
      }

      if (file.size > maxFileSize) {
        setState((prev) => ({
          ...prev,
          selectedFile: null,
          previewUrl: null,
          uploadStatus: 'error',
          errorMessage: 'File is too large. Maximum size is 5MB.',
          errorType: 'file-size',
        }))
        return
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }

      const previewUrl = URL.createObjectURL(file)
      previewUrlRef.current = previewUrl

      setState((prev) => ({
        ...prev,
        selectedFile: file,
        previewUrl,
        uploadStatus: 'idle',
        uploadProgress: 0,
        errorMessage: null,
        errorType: null,
      }))
    },
    [acceptedTypes, maxFileSize],
  )

  const handleSave = useCallback(() => {
    if (!state.selectedFile) return

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setState((prev) => ({
      ...prev,
      uploadStatus: 'uploading',
      uploadProgress: 0,
      errorMessage: null,
      errorType: null,
    }))

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('avatar', state.selectedFile)

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        setState((prev) => ({ ...prev, uploadProgress: progress }))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response: AvatarUploadResponse = JSON.parse(xhr.responseText)
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current)
          previewUrlRef.current = null
        }
        setState((prev) => ({
          ...prev,
          currentAvatarUrl: response.avatarUrl,
          selectedFile: null,
          previewUrl: null,
          uploadStatus: 'success',
          uploadProgress: 100,
          errorMessage: null,
          errorType: null,
        }))
        onUploadComplete?.(response.avatarUrl)
      } else {
        setState((prev) => ({
          ...prev,
          uploadStatus: 'error',
          errorMessage: getErrorMessageForStatus(xhr.status),
          errorType: 'upload-failed',
        }))
      }
    })

    xhr.addEventListener('error', () => {
      if (!abortController.signal.aborted) {
        setState((prev) => ({
          ...prev,
          uploadStatus: 'error',
          errorMessage: 'Upload failed. Please check your connection and try again.',
          errorType: 'upload-failed',
        }))
      }
    })

    xhr.addEventListener('abort', () => {
      setState((prev) => ({
        ...prev,
        uploadStatus: 'idle',
        uploadProgress: 0,
      }))
    })

    abortController.signal.addEventListener('abort', () => {
      xhr.abort()
    })

    xhr.open('POST', `/api/users/${userId}/avatar`)
    xhr.send(formData)
  }, [state.selectedFile, userId, onUploadComplete])

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setState((prev) => ({
      ...prev,
      selectedFile: null,
      previewUrl: null,
      uploadStatus: 'idle',
      uploadProgress: 0,
      errorMessage: null,
      errorType: null,
    }))
  }, [])

  const handleRetry = useCallback(() => {
    handleSave()
  }, [handleSave])

  return {
    state,
    selectFile,
    handleSave,
    handleCancel,
    handleRetry,
    fileInputRef,
  }
}
