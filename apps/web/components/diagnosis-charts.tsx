"use client";

import type {
  InstallmentMonth,
  OffenderItem
} from "@meudim/shared";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatBRL, formatMonth } from "@/lib/format";

const BAR_COLORS = [
  "#DC2626",
  "#DC2626",
  "#D97706",
  "#D97706",
  "#64748B"
];

export function OffendersChart({
  offenders
}: {
  offenders: OffenderItem[];
}): React.JSX.Element {
  const [expanded, setExpanded] = useState<string | null>(
    offenders[0]?.category ?? null
  );
  const chartData = offenders.map((offender) => ({
    ...offender,
    label:
      offender.category.length > 18
        ? `${offender.category.slice(0, 16)}…`
        : offender.category
  }));

  if (offenders.length === 0) {
    return (
      <p className="rounded-xl bg-brand-50 p-5 text-sm text-ink-muted">
        Não encontramos gastos suficientes para montar este gráfico.
      </p>
    );
  }

  return (
    <div>
      <div className="h-[280px] w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} stroke="#E8EEF4" />
            <XAxis
              type="number"
              tickFormatter={(value: number) =>
                value >= 1000 ? `${Math.round(value / 1000)} mil` : String(value)
              }
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={112}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#0B1F3B", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "#F2F5F8" }}
              formatter={(value) => [formatBRL(Number(value)), "Total"]}
              labelFormatter={(_label, payload) => {
                const item = payload[0]?.payload as
                  | { category?: string; percentage?: number }
                  | undefined;

                return item
                  ? `${item.category} · ${(item.percentage ?? 0).toFixed(1)}%`
                  : "";
              }}
              contentStyle={{
                border: "1px solid #D9E1EA",
                borderRadius: 12,
                boxShadow: "0 12px 30px rgba(11,31,59,.12)"
              }}
            />
            <Bar dataKey="total" radius={[0, 7, 7, 0]}>
              {chartData.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={BAR_COLORS[index] ?? "#64748B"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 divide-y divide-ink-border border-t border-ink-border">
        {offenders.map((offender) => {
          const isOpen = expanded === offender.category;

          return (
            <div key={offender.category}>
              <button
                type="button"
                onClick={() =>
                  setExpanded(isOpen ? null : offender.category)
                }
                className="flex w-full items-center gap-3 py-3 text-left text-sm"
              >
                <span className="font-semibold text-brand-900">
                  {offender.category}
                </span>
                <span className="ml-auto tabular-nums text-ink-muted">
                  {formatBRL(offender.total)} ·{" "}
                  {offender.percentage.toFixed(1)}%
                </span>
                <ChevronDown
                  className={[
                    "h-4 w-4 text-ink-muted transition",
                    isOpen ? "rotate-180" : ""
                  ].join(" ")}
                />
              </button>
              {isOpen ? (
                <ul className="mb-3 grid gap-2 rounded-xl bg-brand-50 p-3">
                  {offender.topMerchants.map((merchant) => (
                    <li
                      key={merchant.name}
                      className="flex justify-between gap-4 text-xs text-ink-muted"
                    >
                      <span className="truncate">{merchant.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-brand-900">
                        {formatBRL(merchant.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InstallmentsChart({
  forecast
}: {
  forecast: InstallmentMonth[];
}): React.JSX.Element {
  const data = forecast.slice(0, 6).map((item) => ({
    ...item,
    label: formatMonth(item.month).split(" de ")[0]
  }));

  return (
    <div className="h-[280px] w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 8, left: -14, bottom: 0 }}
        >
          <defs>
            <linearGradient id="installmentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4A78A8" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#C9D6E5" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E8EEF4" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
            }
          />
          <Tooltip
            formatter={(value) => [formatBRL(Number(value)), "Parcelas"]}
            labelFormatter={(_label, payload) => {
              const item = payload[0]?.payload as
                | { month?: string }
                | undefined;

              return item?.month ? formatMonth(item.month) : "";
            }}
            contentStyle={{
              border: "1px solid #D9E1EA",
              borderRadius: 12,
              boxShadow: "0 12px 30px rgba(11,31,59,.12)"
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#2F5D8C"
            strokeWidth={3}
            fill="url(#installmentFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
