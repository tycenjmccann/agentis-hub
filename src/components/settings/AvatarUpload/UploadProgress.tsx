interface UploadProgressProps {
  progress: number
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-surface-4" style={{ height: '3px' }}>
      <div
        className="h-full bg-brand-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress: ${progress}%`}
      />
    </div>
  )
}
