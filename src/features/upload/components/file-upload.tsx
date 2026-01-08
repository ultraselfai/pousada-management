"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateUploadUrl } from "../actions";
import { Upload, X, CheckCircle2, AlertCircle, Image, File } from "lucide-react";

export interface UploadedFile {
  key: string;
  publicUrl: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  folder = "uploads",
  className,
  disabled = false,
}: FileUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const uploadFile = async (file: File) => {
    setStatus("uploading");
    setProgress(0);
    setError(null);

    try {
      // 1. Obter URL pré-assinada
      setProgress(10);
      const result = await generateUploadUrl(file.name, file.type, folder);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 2. Upload direto para o R2
      setProgress(30);
      const uploadResponse = await fetch(result.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erro no upload: ${uploadResponse.status}`);
      }

      setProgress(100);
      setStatus("success");

      const uploaded: UploadedFile = {
        key: result.key,
        publicUrl: result.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setUploadedFile(uploaded);
      onUploadComplete?.(uploaded);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setStatus("error");
      setError(message);
      onUploadError?.(message);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    [folder]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
      disabled: disabled || status === "uploading",
    });

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  };

  // Mostrar erro de rejeição de arquivo
  React.useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorMessage = rejection.errors
        .map((e) => {
          if (e.code === "file-too-large") {
            return `Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`;
          }
          if (e.code === "file-invalid-type") {
            return "Tipo de arquivo não permitido";
          }
          return e.message;
        })
        .join(", ");
      setError(errorMessage);
      setStatus("error");
    }
  }, [fileRejections, maxSize]);

  const isImage = uploadedFile?.type.startsWith("image/");

  return (
    <div className={cn("w-full", className)}>
      {status === "success" && uploadedFile ? (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isImage ? (
                <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                  <img
                    src={uploadedFile.publicUrl}
                    alt={uploadedFile.name}
                    className="object-cover h-full w-full"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                  <File className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <Button variant="ghost" size="icon" onClick={reset}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <input
            type="hidden"
            name="fileUrl"
            value={uploadedFile.publicUrl}
          />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive && "border-primary bg-primary/5",
            status === "uploading" && "pointer-events-none opacity-60",
            status === "error" && "border-destructive",
            !isDragActive && status === "idle" && "hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />

          {status === "uploading" ? (
            <div className="space-y-4">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground animate-pulse" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Enviando...</p>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          ) : status === "error" ? (
            <div className="space-y-2">
              <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={reset}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {isDragActive ? (
                <>
                  <Image className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-sm text-primary">Solte o arquivo aqui</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Máximo: {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
