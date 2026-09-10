const DIACRITICS = /[\u0300-\u036f]/g;
const INSTALLMENT_SUFFIX =
  /\s+(?:\d{1,2}\s*\/\s*\d{1,2}|parc(?:ela)?\s*\d+)\s*$/;
const SPECIAL_CHARACTERS = /[^a-z0-9 ]/g;
const MULTIPLE_SPACES = /\s+/g;

export function normalize(description: string): string {
  return description
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(INSTALLMENT_SUFFIX, "")
    .replace(SPECIAL_CHARACTERS, " ")
    .replace(MULTIPLE_SPACES, " ")
    .trim();
}
