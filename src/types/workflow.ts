export interface WorkflowRun {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'failed' | 'pending';
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}
