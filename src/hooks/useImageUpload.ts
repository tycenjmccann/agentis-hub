import { useState, useCallback, useEffect, useRef } from 'react';
import type { UploadedImage } from '@/types/workflow';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function useImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setError(null), 3000);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported image type. Use PNG, JPG, GIF, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds 10MB limit.`;
    }
    return null;
  }, []);

  const addImages = useCallback((files: File[]) => {
    const newImages: UploadedImage[] = [];
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        showError(validationError);
        continue;
      }
      newImages.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      });
    }
    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }
  }, [validateFile, showError]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      let found = false;
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => ALLOWED_TYPES.includes(type));
        if (imageType) {
          const blob = await item.getType(imageType);
          const extension = imageType.split('/')[1];
          const file = new File([blob], `clipboard-image.${extension}`, { type: imageType });
          addImages([file]);
          found = true;
          break;
        }
      }
      if (!found) {
        showError('No image found in clipboard.');
      }
    } catch {
      showError('Unable to read from clipboard. Check browser permissions.');
    }
  }, [addImages, showError]);

  const dragHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      addImages(files);
    },
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    images,
    isDragOver,
    error,
    addImages,
    removeImage,
    pasteFromClipboard,
    dragHandlers,
  };
}
