'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImageIcon, X, GripVertical, Link } from 'lucide-react';

interface ImageUploaderProps {
  value: string[];           // array of URL/data-URL strings
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value, onChange, maxFiles = 5 }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');

  // ── File drop handler ──
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remaining = maxFiles - value.length;
    if (remaining <= 0) return;

    const files = acceptedFiles.slice(0, remaining);
    const readers: Promise<string>[] = files.map(
      (f) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(f);
        })
    );

    Promise.all(readers).then((dataUrls) => {
      onChange([...value, ...dataUrls]);
    });
  }, [value, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: maxFiles - value.length,
    maxSize: 10 * 1024 * 1024, // 10 MB
    disabled: value.length >= maxFiles,
  });

  // ── URL paste handler ──
  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (value.length >= maxFiles) return;
    onChange([...value, trimmed]);
    setUrlInput('');
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUrl();
    }
  };

  // ── Remove ──
  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  // ── Move (reorder) ──
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const arr = [...value];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      {/* Instruction label */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
        <Upload size={14} />
        Foto Mobil
        <span className="text-zinc-400 font-normal">(drag & drop / klik untuk pilih)</span>
      </div>

      {/* ── Drop zone ── */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          value.length >= maxFiles
            ? 'border-zinc-200 bg-zinc-50/50 opacity-60 cursor-not-allowed'
            : isDragActive
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full transition-colors ${isDragActive ? 'bg-zinc-200' : 'bg-zinc-100'}`}>
            <ImageIcon size={22} className="text-zinc-500" />
          </div>
          {value.length >= maxFiles ? (
            <p className="text-sm font-semibold text-zinc-400">Maksimal {maxFiles} gambar</p>
          ) : (
            <>
              <p className="text-sm font-bold text-zinc-900">
                {isDragActive ? 'Lepaskan file di sini' : 'Seret & lepas atau klik untuk memilih'}
              </p>
              <p className="text-xs text-zinc-500">JPG, PNG, WEBP — Maks 10 MB per file</p>
              <p className="text-xs text-zinc-400">
                Tersisa {maxFiles - value.length} dari {maxFiles} slot
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── URL input fallback ── */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            placeholder="Atau tempel URL gambar..."
            disabled={value.length >= maxFiles}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400 disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || value.length >= maxFiles}
          className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-bold rounded-xl transition-all disabled:cursor-not-allowed"
        >
          Tambah
        </button>
      </div>

      {/* ── Preview grid ── */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {value.map((src, index) => (
              <motion.div
                key={`${index}-${src.slice(-40)}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-video"
              >
                <img
                  src={src}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23ccc"><rect width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="10" fill="%23999">Error</text></svg>';
                  }}
                />

                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {index + 1}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Move left */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-zinc-700 transition-colors"
                      title="Geser ke kiri"
                    >
                      <GripVertical size={14} className="rotate-90" />
                    </button>
                  )}
                  {/* Move right */}
                  {index < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-zinc-700 transition-colors"
                      title="Geser ke kanan"
                    >
                      <GripVertical size={14} className="-rotate-90" />
                    </button>
                  )}
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                    title="Hapus foto"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Bottom indicator (always visible) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-8 pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
