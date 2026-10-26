"use client";

import { DragEvent, KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Maximize2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type ImageUploadProps = {
  label: string;
  currentUrl: string;
  file: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
};

export function ImageUpload({
  label,
  currentUrl,
  file,
  onFileChange,
  onRemove,
  disabled = false,
  className,
}: ImageUploadProps) {
  const labelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const viewerCloseRef = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!viewerOpen) return;
    viewerCloseRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen]);

  const shown = filePreview ?? currentUrl;

  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError("La imagen no debe superar 5 MB.");
      return;
    }
    setError(null);
    onFileChange(selected);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) selectFile(event.dataTransfer.files[0]);
  };

  const remove = () => {
    setError(null);
    onRemove();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label id={labelId}>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          selectFile(selected);
        }}
      />
      {shown && (
        <div className="flex items-center gap-4 rounded-md border border-border bg-card p-3">
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            aria-label={`Ver ${label.toLowerCase()} en grande`}
            className="group relative shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          >
            <img src={shown} alt="" className="h-24 w-36 object-cover" />
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-background opacity-0 transition-opacity group-hover:bg-foreground/40 group-hover:opacity-100"
            >
              <Maximize2 className="size-5" />
            </span>
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
            <p className="w-full truncate text-sm font-semibold">
              {file ? file.name : "Imagen actual"}
            </p>
            <p className="text-xs text-muted-foreground">
              {file ? "Se guardará al confirmar el formulario." : "Haz clic en la imagen para verla."}
            </p>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={remove}>
              <Trash2 aria-hidden /> Quitar imagen
            </Button>
          </div>
        </div>
      )}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={labelId}
        aria-disabled={disabled}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          shown ? "min-h-24" : "min-h-40",
          dragging ? "border-brand bg-brand/5" : "border-input bg-card hover:bg-accent/40",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {!shown && <ImagePlus aria-hidden className="size-8 text-muted-foreground" />}
        <p className="text-sm text-muted-foreground">
          {dragging
            ? "Suelta la imagen aquí"
            : shown
              ? "Arrastra otra imagen o haz clic para reemplazarla"
              : "Arrastra una imagen o haz clic para elegirla"}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP o GIF · máx. 5 MB</p>
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      {viewerOpen && shown && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
          onClick={() => setViewerOpen(false)}
        >
          <Button
            ref={viewerCloseRef}
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4"
            aria-label="Cerrar vista de imagen"
            onClick={() => setViewerOpen(false)}
          >
            <X aria-hidden />
          </Button>
          <img
            src={shown}
            alt={label}
            className="max-h-[85vh] max-w-full rounded-md object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
