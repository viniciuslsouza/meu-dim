export const formatBRL = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

export const formatMonth = (yyyyMM: string): string => {
  const [year, month] = yyyyMM.split("-");
  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
