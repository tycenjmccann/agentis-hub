import { useImageUpload } from '@/hooks/useImageUpload';
import ImageUploadZone from './ImageUploadZone';
import ImagePreviewGrid from './ImagePreviewGrid';
import ClipboardPasteButton from './ClipboardPasteButton';

export default function WorkflowBoard() {
  const { images, isDragOver, error, addImages, removeImage, dragHandlers } = useImageUpload();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Intake</h2>

        <div className="space-y-4">
          <ImageUploadZone
            onFilesAdded={addImages}
            isDragOver={isDragOver}
            dragHandlers={dragHandlers}
            hasImages={images.length > 0}
            error={error}
          />

          <ClipboardPasteButton onImagePasted={(file) => addImages([file])} />

          <ImagePreviewGrid images={images} onRemove={removeImage} />
        </div>
      </div>
    </div>
  );
}
