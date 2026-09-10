"use client";

import type {
  Category,
  DiagnosisResult,
  ParsedStatement
} from "@meudim/shared";
import { create } from "zustand";
import {
  createJSONStorage,
  persist
} from "zustand/middleware";

import { calculateDiagnosis } from "../diagnosis";

export type ParseStatus =
  | "idle"
  | "parsing"
  | "success"
  | "partial"
  | "failed";

interface StatementStore {
  file: File | null;
  parsedStatement: ParsedStatement | null;
  parseStatus: ParseStatus;
  parseWarnings: string[];
  diagnosis: DiagnosisResult | null;
  editedTransactionIds: string[];
  hasHydrated: boolean;
  setFile: (file: File) => void;
  setParsed: (statement: ParsedStatement) => void;
  setParseStatus: (status: ParseStatus) => void;
  setParseWarnings: (warnings: string[]) => void;
  updateTransactionCategory: (
    txId: string,
    category: Category
  ) => void;
  clearAll: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

const initialState = {
  file: null,
  parsedStatement: null,
  parseStatus: "idle" as ParseStatus,
  parseWarnings: [],
  diagnosis: null,
  editedTransactionIds: []
};

export const useStatementStore = create<StatementStore>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setFile: (file) =>
        set({
          ...initialState,
          file
        }),
      setParsed: (statement) =>
        set({
          parsedStatement: statement,
          parseWarnings: statement.warnings,
          parseStatus:
            statement.warnings.length > 0 ? "partial" : "success",
          diagnosis: calculateDiagnosis(statement),
          editedTransactionIds: []
        }),
      setParseStatus: (parseStatus) => set({ parseStatus }),
      setParseWarnings: (parseWarnings) => set({ parseWarnings }),
      updateTransactionCategory: (txId, category) =>
        set((state) => {
          if (!state.parsedStatement) {
            return state;
          }

          const index = Number(txId);

          if (
            !Number.isInteger(index) ||
            !state.parsedStatement.transactions[index]
          ) {
            return state;
          }

          const transactions = state.parsedStatement.transactions.map(
            (transaction, transactionIndex) =>
              transactionIndex === index
                ? { ...transaction, category }
                : transaction
          );
          const parsedStatement = {
            ...state.parsedStatement,
            transactions
          };

          return {
            parsedStatement,
            diagnosis: calculateDiagnosis(parsedStatement),
            editedTransactionIds: state.editedTransactionIds.includes(txId)
              ? state.editedTransactionIds
              : [...state.editedTransactionIds, txId]
          };
        }),
      clearAll: () => set(initialState),
      setHasHydrated: (hasHydrated) => set({ hasHydrated })
    }),
    {
      name: "meudim-statement-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        parsedStatement: state.parsedStatement,
        diagnosis: state.diagnosis,
        parseStatus: state.parseStatus,
        parseWarnings: state.parseWarnings,
        editedTransactionIds: state.editedTransactionIds
      }),
      onRehydrateStorage: (state) => () => {
        state.setHasHydrated(true);
      }
    }
  )
);
