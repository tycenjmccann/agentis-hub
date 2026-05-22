import { User } from 'lucide-react'

interface DefaultAvatarProps {
  size: number
}

export function DefaultAvatar({ size }: DefaultAvatarProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-3">
      <User className="text-text-muted" size={size * 0.4} strokeWidth={1.5} />
    </div>
  )
}
