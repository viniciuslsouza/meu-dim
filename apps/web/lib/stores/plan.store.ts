"use client";

import {
  simulateBoth,
  type Debt,
  type PayoffResult,
  type PayoffStrategy
} from "@meudim/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CheckoutState {
  paymentId: string;
  provider: "MERCADOPAGO" | "STRIPE";
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  expiresAt: string;
  demo: boolean;
  status: "PENDING" | "PAID" | "EXPIRED";
}

interface LocalSimulation {
  snowball: PayoffResult;
  avalanche: PayoffResult;
}

interface PlanStore {
  debts: Debt[];
  selectedDebtIds: string[];
  monthlyBudget: number;
  localSimulation: LocalSimulation | null;
  chosenStrategy: PayoffStrategy;
  savedPlanId: string | null;
  checkout: CheckoutState | null;
  hasHydrated: boolean;
  addDebt: (debt: Debt) => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, changes: Partial<Debt>) => void;
  syncImportedStatementDebt: (debt: Omit<Debt, "id"> | null) => void;
  toggleDebtSelected: (id: string) => void;
  setBudget: (budget: number) => void;
  setSimulation: (simulation: LocalSimulation | null) => void;
  setChosenStrategy: (strategy: PayoffStrategy) => void;
  setSavedPlanId: (id: string) => void;
  setCheckout: (checkout: CheckoutState | null) => void;
  setCheckoutStatus: (status: CheckoutState["status"]) => void;
  setHasHydrated: (hydrated: boolean) => void;
  clearPlan: () => void;
}

function activeDebts(debts: Debt[], selectedDebtIds: string[]): Debt[] {
  if (selectedDebtIds.length === 0) {
    return [];
  }

  return debts.filter(
    (debt) => debt.id != null && selectedDebtIds.includes(debt.id)
  );
}

function calculate(
  debts: Debt[],
  selectedDebtIds: string[],
  monthlyBudget: number
): LocalSimulation | null {
  const selected = activeDebts(debts, selectedDebtIds);

  if (selected.length === 0 || monthlyBudget <= 0) {
    return null;
  }

  return simulateBoth(selected, monthlyBudget);
}

const IMPORTED_STATEMENT_DEBT_ID = "imported-statement";

function isImportedStatementDebt(debt: Debt): boolean {
  return (
    debt.id === IMPORTED_STATEMENT_DEBT_ID ||
    (debt.type === "CREDIT_CARD" &&
      /^Fatura\s+(NUBANK|INTER|ITAU|BRADESCO|C6|SANTANDER|BB|CAIXA|GENERIC)$/i.test(
        debt.name
      ))
  );
}

const initialPlan = {
  debts: [] as Debt[],
  selectedDebtIds: [] as string[],
  monthlyBudget: 0,
  localSimulation: null as LocalSimulation | null,
  chosenStrategy: "AVALANCHE" as PayoffStrategy,
  savedPlanId: null,
  checkout: null as CheckoutState | null
};

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      ...initialPlan,
      hasHydrated: false,
      addDebt: (debt) =>
        set((state) => {
          const id = debt.id ?? crypto.randomUUID();
          const nextDebt = { ...debt, id };
          const debts = [...state.debts, nextDebt];
          const selectedDebtIds = [...state.selectedDebtIds, id];

          return {
            debts,
            selectedDebtIds,
            localSimulation: calculate(
              debts,
              selectedDebtIds,
              state.monthlyBudget
            )
          };
        }),
      removeDebt: (id) =>
        set((state) => {
          const debts = state.debts.filter((debt) => debt.id !== id);
          const selectedDebtIds = state.selectedDebtIds.filter(
            (selectedId) => selectedId !== id
          );

          return {
            debts,
            selectedDebtIds,
            localSimulation: calculate(
              debts,
              selectedDebtIds,
              state.monthlyBudget
            )
          };
        }),
      updateDebt: (id, changes) =>
        set((state) => {
          const debts = state.debts.map((debt) =>
            debt.id === id ? { ...debt, ...changes } : debt
          );

          return {
            debts,
            localSimulation: calculate(
              debts,
              state.selectedDebtIds,
              state.monthlyBudget
            )
          };
        }),
      syncImportedStatementDebt: (debt) =>
        set((state) => {
          const manualDebts = state.debts.filter(
            (item) => !isImportedStatementDebt(item)
          );
          const previousImport = state.debts.find(
            (item) => item.id === IMPORTED_STATEMENT_DEBT_ID
          );
          const debts = debt
            ? [
                ...manualDebts,
                {
                  ...debt,
                  id: IMPORTED_STATEMENT_DEBT_ID,
                  // Preserva juros editados pelo usuário na mesma fatura importada.
                  monthlyRate:
                    previousImport &&
                    previousImport.name === debt.name &&
                    previousImport.balance === debt.balance
                      ? previousImport.monthlyRate
                      : debt.monthlyRate
                }
              ]
            : manualDebts;
          const selectedDebtIds = [
            ...state.selectedDebtIds.filter((id) =>
              manualDebts.some((item) => item.id === id)
            ),
            ...(debt ? [IMPORTED_STATEMENT_DEBT_ID] : [])
          ];

          return {
            debts,
            selectedDebtIds,
            localSimulation: calculate(
              debts,
              selectedDebtIds,
              state.monthlyBudget
            )
          };
        }),
      toggleDebtSelected: (id) =>
        set((state) => {
          const selectedDebtIds = state.selectedDebtIds.includes(id)
            ? state.selectedDebtIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedDebtIds, id];

          return {
            selectedDebtIds,
            localSimulation: calculate(
              state.debts,
              selectedDebtIds,
              state.monthlyBudget
            )
          };
        }),
      setBudget: (monthlyBudget) =>
        set((state) => ({
          monthlyBudget,
          localSimulation: calculate(
            state.debts,
            state.selectedDebtIds,
            monthlyBudget
          )
        })),
      setSimulation: (localSimulation) => set({ localSimulation }),
      setChosenStrategy: (chosenStrategy) => set({ chosenStrategy }),
      setSavedPlanId: (savedPlanId) => set({ savedPlanId }),
      setCheckout: (checkout) => set({ checkout }),
      setCheckoutStatus: (status) =>
        set((state) => ({
          checkout: state.checkout ? { ...state.checkout, status } : null
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearPlan: () => set(initialPlan)
    }),
    {
      name: "meudim-plan-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        debts: state.debts,
        selectedDebtIds: state.selectedDebtIds,
        monthlyBudget: state.monthlyBudget,
        localSimulation: state.localSimulation,
        chosenStrategy: state.chosenStrategy,
        savedPlanId: state.savedPlanId,
        checkout: state.checkout
      }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<PlanStore>;
        const debts = stored.debts ?? current.debts;
        const selectedDebtIds =
          stored.selectedDebtIds ??
          debts
            .map((debt) => debt.id)
            .filter((id): id is string => Boolean(id));

        return {
          ...current,
          ...stored,
          debts,
          selectedDebtIds
        };
      },
      onRehydrateStorage: (state) => () => state.setHasHydrated(true)
    }
  )
);

export function getSelectedDebts(
  debts: Debt[],
  selectedDebtIds: string[]
): Debt[] {
  return activeDebts(debts, selectedDebtIds);
}
