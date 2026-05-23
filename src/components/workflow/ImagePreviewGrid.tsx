import { X } from 'lucide-react';
import type { UploadedImage } from '@/types/workflow';

interface ImagePreviewGridProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
}

export default function ImagePreviewGrid({ images, onRemove }: ImagePreviewGridProps) {
  if (images.length === 0) return null;

  return (
    <ul role="list" aria-label="Uploaded images" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((image) => (
        <li key={image.id} className="group relative aspect-square rounded-lg overflow-hidden bg-surface-3">
          <img
            src={image.previewUrl}
            alt={`Preview of ${image.name}`}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onRemove(image.id)}
            aria-label={`Remove ${image.name}`}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
