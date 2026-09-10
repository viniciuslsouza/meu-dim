"use client";

import {
  CloudUpload,
  FileCheck2,
  RefreshCw
} from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from "react";

import { formatFileSize } from "@/lib/format";

interface StatementDropzoneProps {
  file: File | null;
  disabled?: boolean;
  onFile: (file: File) => void;
}

const ACCEPTED_EXTENSIONS = [".csv", ".pdf", ".xlsx"];

export function StatementDropzone({
  file,
  disabled = false,
  onFile
}: StatementDropzoneProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const selectFile = (selected?: File): void => {
    if (!selected) {
      return;
    }

    const isAccepted = ACCEPTED_EXTENSIONS.some((extension) =>
      selected.name.toLowerCase().endsWith(extension)
    );

    if (!isAccepted) {
      setLocalError("Use um arquivo CSV, PDF ou XLSX.");
      return;
    }

    if (selected.size > 15 * 1024 * 1024) {
      setLocalError("O arquivo deve ter no máximo 15 MB.");
      return;
    }

    setLocalError("");
    onFile(selected);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);

    if (!disabled) {
      selectFile(event.dataTransfer.files[0]);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".csv,.pdf,.xlsx,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        disabled={disabled}
        onChange={handleChange}
      />
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={[
          "relative rounded-[1.75rem] border-2 border-dashed p-7 text-center transition sm:p-10",
          isDragging
            ? "scale-[1.01] border-accent-500 bg-accent-50"
            : "border-accent-700/60 bg-white hover:border-accent-700 hover:bg-accent-50/40",
          disabled ? "cursor-wait opacity-70" : ""
        ].join(" ")}
      >
        {file ? (
          <div className="mx-auto flex max-w-lg flex-col items-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-50 text-accent-700">
              <FileCheck2 className="h-8 w-8" />
            </span>
            <p className="mt-5 max-w-full truncate font-semibold text-brand-900">
              {file.name}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {formatFileSize(file.size)}
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-ink-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-400 disabled:cursor-wait"
            >
              <RefreshCw className="h-4 w-4" />
              Trocar arquivo
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-lg flex-col items-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-50 text-accent-700">
              <CloudUpload className="h-8 w-8" />
            </span>
            <p className="mt-5 hidden text-lg font-semibold text-brand-900 sm:block">
              Arraste sua fatura aqui ou clique para selecionar
            </p>
            <p className="mt-5 text-lg font-semibold text-brand-900 sm:hidden">
              Selecione sua fatura
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              CSV, PDF ou XLSX de até 15 MB. Nubank, Inter, Itaú e Bradesco.
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="mt-6 rounded-xl bg-accent-700 px-5 py-3 font-semibold text-white transition hover:bg-accent-900 disabled:cursor-wait"
            >
              Selecionar arquivo
            </button>
          </div>
        )}
      </div>
      {localError ? (
        <p role="alert" className="mt-3 text-sm font-medium text-danger-600">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
