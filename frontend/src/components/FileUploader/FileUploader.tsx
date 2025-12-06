import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFilesAccepted: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUploader({
  onFilesAccepted,
  accept = { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
  multiple = true,
  disabled = false,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">
        {isDragActive
          ? 'Отпустите файлы здесь...'
          : 'Перетащите файлы сюда или нажмите для выбора'}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        {multiple ? 'Можно выбрать несколько файлов' : 'Выберите один файл'}
      </p>
    </div>
  );
}
