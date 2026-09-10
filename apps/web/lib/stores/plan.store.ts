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
  monthlyBudget: number;
  localSimulation: LocalSimulation | null;
  chosenStrategy: PayoffStrategy;
  savedPlanId: string | null;
  checkout: CheckoutState | null;
  hasHydrated: boolean;
  addDebt: (debt: Debt) => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, changes: Partial<Debt>) => void;
  setBudget: (budget: number) => void;
  setSimulation: (simulation: LocalSimulation | null) => void;
  setChosenStrategy: (strategy: PayoffStrategy) => void;
  setSavedPlanId: (id: string) => void;
  setCheckout: (checkout: CheckoutState | null) => void;
  setCheckoutStatus: (status: CheckoutState["status"]) => void;
  setHasHydrated: (hydrated: boolean) => void;
  clearPlan: () => void;
}

function calculate(
  debts: Debt[],
  monthlyBudget: number
): LocalSimulation | null {
  if (debts.length === 0 || monthlyBudget <= 0) {
    return null;
  }

  return simulateBoth(debts, monthlyBudget);
}

const initialPlan = {
  debts: [] as Debt[],
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
          const debts = [...state.debts, debt];

          return {
            debts,
            localSimulation: calculate(debts, state.monthlyBudget)
          };
        }),
      removeDebt: (id) =>
        set((state) => {
          const debts = state.debts.filter((debt) => debt.id !== id);

          return {
            debts,
            localSimulation: calculate(debts, state.monthlyBudget)
          };
        }),
      updateDebt: (id, changes) =>
        set((state) => {
          const debts = state.debts.map((debt) =>
            debt.id === id ? { ...debt, ...changes } : debt
          );

          return {
            debts,
            localSimulation: calculate(debts, state.monthlyBudget)
          };
        }),
      setBudget: (monthlyBudget) =>
        set((state) => ({
          monthlyBudget,
          localSimulation: calculate(state.debts, monthlyBudget)
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
        monthlyBudget: state.monthlyBudget,
        localSimulation: state.localSimulation,
        chosenStrategy: state.chosenStrategy,
        savedPlanId: state.savedPlanId,
        checkout: state.checkout
      }),
      onRehydrateStorage: (state) => () => state.setHasHydrated(true)
    }
  )
);
