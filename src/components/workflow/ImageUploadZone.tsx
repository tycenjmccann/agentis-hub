import { useRef } from 'react';
import { Upload, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  isDragOver: boolean;
  dragHandlers: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  hasImages: boolean;
  error: string | null;
}

export default function ImageUploadZone({ onFilesAdded, isDragOver, dragHandlers, hasImages, error }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div>
      <div
        {...dragHandlers}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload images"
        className={cn(
          'relative rounded-lg cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          hasImages
            ? 'flex items-center gap-2 px-3 py-2 border border-dashed border-surface-4 hover:border-brand-500/50'
            : 'flex flex-col items-center justify-center p-8 border-2 border-dashed border-surface-4 hover:border-brand-500/50',
          isDragOver && 'border-solid border-brand-500 bg-sky-500/5',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        {hasImages ? (
          <>
            <Plus size={16} className={cn('text-text-muted', isDragOver && 'animate-gentle-bounce')} />
            <span className="text-sm text-text-muted">Add more images</span>
          </>
        ) : (
          <>
            <Upload size={32} className={cn('text-text-muted mb-3', isDragOver && 'animate-gentle-bounce')} />
            <span className="text-sm text-text-secondary">
              Drop images here or click to upload
            </span>
            <span className="text-xs text-text-muted mt-1">
              PNG, JPG, GIF, WebP up to 10MB
            </span>
          </>
        )}
      </div>
      {error && (
        <div role="alert" className="mt-2 px-3 py-2 rounded-md bg-red-500/10 text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
