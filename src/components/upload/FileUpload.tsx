import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "success" | "error";
  progress: number;
}

interface FileUploadProps {
  title: string;
  description: string;
  acceptedTypes: string[];
  onFilesUploaded?: (files: File[]) => void;
}

export function FileUpload({
  title,
  description,
  acceptedTypes,
  onFilesUploaded,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const validFiles: File[] = [];
      const newFiles: UploadedFile[] = [];

      Array.from(fileList).forEach((file) => {
        const isValidType = acceptedTypes.some(
          (type) =>
            file.type.includes(type) ||
            file.name.toLowerCase().endsWith(type.replace(".", ""))
        );

        if (isValidType) {
          validFiles.push(file);
          newFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            status: "uploading",
            progress: 0,
          });
        }
      });

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);

        // Simulate upload progress
        newFiles.forEach((file) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id ? { ...f, status: "success", progress: 100 } : f
                )
              );
            } else {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id ? { ...f, progress: Math.min(progress, 99) } : f
                )
              );
            }
          }, 200);
        });

        onFilesUploaded?.(validFiles);
        toast({
          title: "Arquivos adicionados",
          description: `${validFiles.length} arquivo(s) pronto(s) para análise.`,
        });
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos PDF, Excel ou CSV.",
          variant: "destructive",
        });
      }
    },
    [acceptedTypes, onFilesUploaded, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-4">
          <div className={cn(
            "mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            isDragging ? "gradient-primary" : "bg-secondary"
          )}>
            <Upload className={cn(
              "h-6 w-6 transition-colors",
              isDragging ? "text-primary-foreground" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Arraste seus arquivos aqui
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ou clique para selecionar
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            PDF, Excel (.xlsx) ou CSV • Até 10MB por arquivo
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
            >
              <div className="p-2 rounded-lg bg-card">
                <FileText className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  {file.status === "uploading" && (
                    <div className="flex-1 max-w-24 h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {file.status === "success" && (
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
              )}
              {file.status === "error" && (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeFile(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
