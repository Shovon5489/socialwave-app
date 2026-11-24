import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Film, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaUpload({
  files = [],
  onChange,
  maxFiles = 10,
  accept = { 'image/*': [], 'video/*': [] },
  className = '',
}) {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejected) => {
          rejected.errors.forEach((err) => {
            if (err.code === 'file-too-large') {
              toast.error('File too large. Max size is 50MB.');
            } else if (err.code === 'too-many-files') {
              toast.error(`Max ${maxFiles} files allowed.`);
            } else {
              toast.error(`File error: ${err.message}`);
            }
          });
        });
      }

      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        toast.error(`Max ${maxFiles} files already selected.`);
        return;
      }

      const newFiles = acceptedFiles.slice(0, remaining).map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      onChange([...files, ...newFiles]);
    },
    [files, maxFiles, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: files.length >= maxFiles,
  });

  const removeFile = (index) => {
    const updated = [...files];
    if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    onChange(updated);
  };

  const isVideo = (file) =>
    file.type?.startsWith('video/') || file.name?.match(/\.(mp4|mov|avi|mkv|webm)$/i);

  return (
    <div className={className}>
      {/* Drop Zone */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${isDragActive
              ? 'border-primary bg-primary-50'
              : 'border-gray-200 hover:border-primary hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-muted mx-auto mb-2" />
          {isDragActive ? (
            <p className="text-sm text-primary font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-dark">
                Drag & drop files, or{' '}
                <span className="text-primary">click to browse</span>
              </p>
              <p className="text-xs text-muted mt-1">
                Images & Videos • Max {maxFiles} files • 50MB each
              </p>
            </>
          )}
        </div>
      )}

      {/* Preview Grid */}
      {files.length > 0 && (
        <div
          className={`mt-3 grid gap-2 ${
            files.length === 1
              ? 'grid-cols-1'
              : files.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {files.map((file, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden bg-gray-100">
              {isVideo(file) ? (
                <div className="relative">
                  <video
                    src={file.preview || file.url}
                    className="w-full h-32 object-cover"
                    controls={false}
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Film className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={file.preview || file.url}
                  alt={`upload-${index}`}
                  className="w-full h-32 object-cover"
                />
              )}
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {/* File type badge */}
              <div className="absolute bottom-1 left-1 text-xs bg-black/50 text-white rounded px-1.5 py-0.5 flex items-center gap-1">
                {isVideo(file) ? (
                  <Film className="h-3 w-3" />
                ) : (
                  <ImageIcon className="h-3 w-3" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="text-xs text-muted mt-2 text-right">
          {files.length}/{maxFiles} files selected
        </p>
      )}
    </div>
  );
}
