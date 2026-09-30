'use client';

import { useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Formato no soportado. Usa JPEG, PNG o WEBP.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB.');
      return;
    }

    setError(null);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      // Usamos el helper centralizado
      const result = await apiFetch<{ url: string }>('/upload', {
        method: 'POST',
        body: formData,
      });
      
      onUploadSuccess(result.url);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir la imagen.';
      setError(errorMessage);
      setPreviewUrl(null); // Resetear previsualización si falló
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative w-full max-w-md p-6 flex flex-col items-center justify-center transition-all duration-300 rounded-3xl border-2 border-dashed cursor-pointer ${
        isDragging ? 'border-slate-400 bg-slate-100 shadow-md' : 'border-slate-200 bg-slate-50 shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      {previewUrl ? (
        <div className="w-full relative aspect-video rounded-2xl overflow-hidden">
          <img
            src={previewUrl}
            alt="Vista previa"
            className={`object-cover w-full h-full transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="text-slate-800 font-medium bg-white/80 px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-sm">
                Subiendo...
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8 pointer-events-none">
          <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-slate-200 flex items-center justify-center">
            {/* Simple icon representation using SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="font-medium text-slate-700">Arrastra una imagen aquí</p>
          <p className="text-sm mt-1">o haz clic para seleccionar (Máx. 5MB)</p>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-3 font-medium text-center">{error}</p>
      )}
    </div>
  );
}
