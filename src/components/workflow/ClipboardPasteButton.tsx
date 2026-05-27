import { useState, useEffect, useRef } from 'react';
import { Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClipboardPasteButtonProps {
  onImagePasted: (file: File) => void;
}

export default function ClipboardPasteButton({ onImagePasted }: ClipboardPasteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsSupported(typeof navigator.clipboard?.read === 'function');
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isSupported) return null;

  const handlePaste = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await navigator.clipboard.read();
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      let found = false;
      for (const item of items) {
        const imageType = item.types.find((t) => allowedTypes.includes(t));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split('/')[1];
          const file = new File([blob], `clipboard-image.${ext}`, { type: imageType });
          onImagePasted(file);
          found = true;
          break;
        }
      }
      if (!found) {
        setError('No image found in clipboard');
        timeoutRef.current = setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Unable to read clipboard');
      timeoutRef.current = setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handlePaste}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
          'bg-surface-3 border border-surface-4 hover:border-brand-500/50 text-text-secondary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:ring-2 focus-visible:ring-brand-500 outline-none',
        )}
      >
        <Clipboard size={14} />
        {isLoading ? 'Reading...' : 'Paste from clipboard'}
      </button>
      <div aria-live="polite" className="min-h-[1.5rem] mt-1">
        {error && (
          <span className="inline-block px-2 py-1 rounded text-xs bg-amber-500/10 text-amber-400 animate-fade-in">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
