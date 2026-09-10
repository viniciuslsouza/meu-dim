export {
  detectBank,
  parsePdfPages,
  parseSpreadsheetRows,
  parseStatement,
  parsers
} from "./detect";
export { nubank } from "./nubank";
export { inter } from "./inter";
export { itau } from "./itau";
export { bradesco } from "./bradesco";
export { generic } from "./generic";
export type {
  BankParser,
  ParseStatementOptions,
  SpreadsheetCell,
  SpreadsheetRow
} from "./types";
