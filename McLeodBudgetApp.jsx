import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Coins,
  Plus,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const STORAGE_KEY = 'mcleod-budgeting-app:v1';

const MONTH_INDEX = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatMonthId(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function parseMonthId(monthId) {
  if (typeof monthId !== 'string') {
    return null;
  }

  const [monthName, yearText] = monthId.trim().split(' ');
  const monthIndex = MONTH_INDEX[monthName];
  const year = Number(yearText);

  if (monthIndex === undefined || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, monthIndex, 1);
}

function shiftMonthId(monthId, offset) {
  const baseDate = parseMonthId(monthId) ?? new Date();
  const shifted = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
  return formatMonthId(shifted);
}

function currency(value) {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function toNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function makeIncome(name = 'New Income', amount = 0) {
  return {
    id: createId(),
    name,
    amount,
  };
}

function makeExpense(name = 'New Expense', planned = 0, spent = 0) {
  return {
    id: createId(),
    name,
    planned,
    spent,
  };
}

function makeSaving(name = 'New Savings', amount = 0) {
  return {
    id: createId(),
    name,
    amount,
  };
}

function createStarterMonth(monthId = formatMonthId()) {
  return {
    month_id: monthId,
    incomes: [makeIncome('Check 1', 0), makeIncome('Balance Reset', 0)],
    expenses: [makeExpense('Rent - 1st', 0, 0), makeExpense('Internet - 11th', 0, 0)],
    savings: [makeSaving('Emergency Fund', 0), makeSaving('Tithe', 0)],
  };
}

function normalizeMonth(month) {
  if (!month || typeof month !== 'object') {
    return null;
  }

  return {
    month_id: typeof month.month_id === 'string' && month.month_id.trim() ? month.month_id : formatMonthId(),
    incomes: Array.isArray(month.incomes)
      ? month.incomes.map((item) => ({
          id: typeof item?.id === 'string' ? item.id : createId(),
          name: typeof item?.name === 'string' ? item.name : 'Income',
          amount: toNumber(item?.amount),
        }))
      : [],
    expenses: Array.isArray(month.expenses)
      ? month.expenses.map((item) => ({
          id: typeof item?.id === 'string' ? item.id : createId(),
          name: typeof item?.name === 'string' ? item.name : 'Expense',
          planned: toNumber(item?.planned),
          spent: toNumber(item?.spent),
        }))
      : [],
    savings: Array.isArray(month.savings)
      ? month.savings.map((item) => ({
          id: typeof item?.id === 'string' ? item.id : createId(),
          name: typeof item?.name === 'string' ? item.name : 'Savings',
          amount: toNumber(item?.amount),
        }))
      : [],
  };
}

function loadMonths() {
  if (typeof window === 'undefined') {
    return [createStarterMonth()];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [createStarterMonth()];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createStarterMonth()];
    }

    const normalized = parsed.map(normalizeMonth).filter(Boolean);
    return normalized.length > 0 ? normalized : [createStarterMonth()];
  } catch {
    return [createStarterMonth()];
  }
}

function StatCard({ title, value, icon: Icon, tone, subtitle, emphasis = false }) {
  const toneClasses = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-400/20 text-emerald-100',
    rose: 'from-rose-500/20 to-rose-500/5 border-rose-400/20 text-rose-100',
    sky: 'from-sky-500/20 to-sky-500/5 border-sky-400/20 text-sky-100',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-400/20 text-amber-100',
  };

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur ${toneClasses[tone]} ${
        emphasis ? 'ring-1 ring-white/10' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">{title}</p>
          <div className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</div>
          {subtitle ? <p className="mt-2 text-sm text-white/55">{subtitle}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/85">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function BudgetSection({
  title,
  description,
  icon: Icon,
  onAdd,
  children,
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 hover:text-emerald-100"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {children}
    </section>
  );
}

function FieldInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/40 focus:bg-white/8 focus:ring-2 focus:ring-sky-400/15 ${className}`}
    />
  );
}

export default function McLeodBudgetApp() {
  const [months, setMonths] = useState(loadMonths);
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(months));
  }, [months]);

  useEffect(() => {
    if (months.length === 0) {
      setMonths([createStarterMonth()]);
      setActiveMonthIndex(0);
      return;
    }

    setActiveMonthIndex((currentIndex) => Math.min(currentIndex, months.length - 1));
  }, [months.length]);

  const activeMonth = months[activeMonthIndex] ?? createStarterMonth();

  const totals = useMemo(() => {
    const totalMonthlyIncome = activeMonth.incomes.reduce((sum, entry) => sum + toNumber(entry.amount), 0);
    const totalMonthlyExpenses = activeMonth.expenses.reduce((sum, entry) => sum + toNumber(entry.spent), 0);
    const totalPlannedExpenses = activeMonth.expenses.reduce((sum, entry) => sum + toNumber(entry.planned), 0);
    const totalMonthlySavings = activeMonth.savings.reduce((sum, entry) => sum + toNumber(entry.amount), 0);
    const cashBalance = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlySavings;

    return {
      totalMonthlyIncome,
      totalMonthlyExpenses,
      totalPlannedExpenses,
      totalMonthlySavings,
      cashBalance,
    };
  }, [activeMonth]);

  const updateMonth = (updater) => {
    setMonths((currentMonths) => currentMonths.map((month, index) => (index === activeMonthIndex ? updater(month) : month)));
  };

  const updateIncome = (incomeId, field, value) => {
    updateMonth((month) => ({
      ...month,
      incomes: month.incomes.map((income) =>
        income.id === incomeId
          ? {
              ...income,
              [field]: field === 'name' ? value : toNumber(value),
            }
          : income,
      ),
    }));
  };

  const updateExpense = (expenseId, field, value) => {
    updateMonth((month) => ({
      ...month,
      expenses: month.expenses.map((expense) =>
        expense.id === expenseId
          ? {
              ...expense,
              [field]: field === 'name' ? value : toNumber(value),
            }
          : expense,
      ),
    }));
  };

  const updateSaving = (savingId, field, value) => {
    updateMonth((month) => ({
      ...month,
      savings: month.savings.map((saving) =>
        saving.id === savingId
          ? {
              ...saving,
              [field]: field === 'name' ? value : toNumber(value),
            }
          : saving,
      ),
    }));
  };

  const addIncome = () => {
    updateMonth((month) => ({
      ...month,
      incomes: [...month.incomes, makeIncome()],
    }));
  };

  const addExpense = () => {
    updateMonth((month) => ({
      ...month,
      expenses: [...month.expenses, makeExpense()],
    }));
  };

  const addSaving = () => {
    updateMonth((month) => ({
      ...month,
      savings: [...month.savings, makeSaving()],
    }));
  };

  const removeIncome = (incomeId) => {
    updateMonth((month) => ({
      ...month,
      incomes: month.incomes.filter((income) => income.id !== incomeId),
    }));
  };

  const removeExpense = (expenseId) => {
    updateMonth((month) => ({
      ...month,
      expenses: month.expenses.filter((expense) => expense.id !== expenseId),
    }));
  };

  const removeSaving = (savingId) => {
    updateMonth((month) => ({
      ...month,
      savings: month.savings.filter((saving) => saving.id !== savingId),
    }));
  };

  const startNewMonth = () => {
    const sourceMonth = months[activeMonthIndex] ?? createStarterMonth();
    let newMonthId = shiftMonthId(sourceMonth.month_id, 1);
    const existingMonthIds = new Set(months.map((month) => month.month_id));

    while (existingMonthIds.has(newMonthId)) {
      newMonthId = shiftMonthId(newMonthId, 1);
    }

    const carriedExpenses = sourceMonth.expenses.map((expense) => ({
      id: createId(),
      name: expense.name,
      planned: toNumber(expense.planned),
      spent: 0,
    }));

    const carryOverIncome = makeIncome('Leftover - Last Month', totals.cashBalance);

    const newMonth = {
      month_id: newMonthId,
      incomes: [carryOverIncome],
      expenses: carriedExpenses,
      savings: [],
    };

    setMonths((currentMonths) => {
      const nextMonths = [...currentMonths];
      nextMonths.splice(activeMonthIndex + 1, 0, newMonth);
      return nextMonths;
    });

    setActiveMonthIndex((index) => index + 1);
  };

  const monthOptions = months.map((month, index) => ({
    value: String(index),
    label: month.month_id,
  }));

  const canGoBack = activeMonthIndex > 0;
  const canGoForward = activeMonthIndex < months.length - 1;
  const cashBalanceIsNegative = totals.cashBalance < 0;

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        backgroundImage:
          'radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 30%), radial-gradient(circle at top right, rgba(16,185,129,0.12), transparent 24%), linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      }}
    >
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/80">
                <CalendarDays className="h-3.5 w-3.5" />
                McLeod Budgeting
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Personal budget control with zero backend and instant local persistence.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Edit any name or number inline, switch between months, and roll a new month forward with your recurring expenses and leftover cash balance already carried over.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[540px]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2">
                  <button
                    type="button"
                    onClick={() => setActiveMonthIndex((index) => Math.max(0, index - 1))}
                    disabled={!canGoBack}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Previous month"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <select
                    value={String(activeMonthIndex)}
                    onChange={(event) => setActiveMonthIndex(Number(event.target.value))}
                    className="min-w-[220px] appearance-none rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-white outline-none"
                    aria-label="Select month"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setActiveMonthIndex((index) => Math.min(months.length - 1, index + 1))}
                    disabled={!canGoForward}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Next month"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={startNewMonth}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 hover:text-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Start New Month
                </button>
              </div>

              <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">LocalStorage-backed state</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">Inline editable rows</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">Automatic cash math</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Monthly Income"
            value={currency(totals.totalMonthlyIncome)}
            icon={TrendingUp}
            tone="emerald"
            subtitle="Sum of all income amounts"
          />
          <StatCard
            title="Total Monthly Expenses"
            value={currency(totals.totalMonthlyExpenses)}
            icon={TrendingDown}
            tone="rose"
            subtitle="Sum of all spent values"
          />
          <StatCard
            title="Total Monthly Savings"
            value={currency(totals.totalMonthlySavings)}
            icon={Coins}
            tone="sky"
            subtitle="Sum of all savings amounts"
          />
          <StatCard
            title="Cash Balance"
            value={currency(totals.cashBalance)}
            icon={Wallet}
            tone={cashBalanceIsNegative ? 'rose' : 'amber'}
            subtitle={cashBalanceIsNegative ? 'Below zero, so it is highlighted in red' : 'Income minus expenses minus savings'}
            emphasis
          />
        </section>

        <main className="mt-6 grid gap-6 xl:grid-cols-3">
          <BudgetSection
            title="Monthly Income"
            description="Item name and amount"
            icon={Banknote}
            onAdd={addIncome}
          >
            <div className="space-y-3">
              <div className="hidden grid-cols-[1fr_160px_48px] gap-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 md:grid">
                <div>Item Name</div>
                <div>Amount</div>
                <div />
              </div>

              {activeMonth.incomes.map((income) => (
                <div
                  key={income.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_160px_48px] md:items-center"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Item Name</div>
                    <FieldInput
                      value={income.name}
                      onChange={(event) => updateIncome(income.id, 'name', event.target.value)}
                      placeholder="Income name"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Amount</div>
                    <FieldInput
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={income.amount}
                      onChange={(event) => updateIncome(income.id, 'amount', event.target.value)}
                      className="text-right font-semibold"
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIncome(income.id)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-200"
                    aria-label="Delete income row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm">
                <span className="font-medium text-slate-400">Total Income</span>
                <span className="text-lg font-black text-emerald-300">{currency(totals.totalMonthlyIncome)}</span>
              </div>
            </div>
          </BudgetSection>

          <BudgetSection
            title="Monthly Expenses"
            description="Item, planned amount, spent amount, and what's left"
            icon={CircleDollarSign}
            onAdd={addExpense}
          >
            <div className="space-y-3">
              <div className="hidden grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_48px] gap-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 xl:grid">
                <div>Item & Date</div>
                <div>Planned</div>
                <div>Spent</div>
                <div>What's Left</div>
                <div />
              </div>

              {activeMonth.expenses.map((expense) => {
                const delta = toNumber(expense.planned) - toNumber(expense.spent);
                const deltaIsNegative = delta < 0;

                return (
                  <div
                    key={expense.id}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 xl:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_48px] xl:items-center"
                  >
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 xl:hidden">Item & Date</div>
                      <FieldInput
                        value={expense.name}
                        onChange={(event) => updateExpense(expense.id, 'name', event.target.value)}
                        placeholder="Expense name"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 xl:hidden">Planned</div>
                      <FieldInput
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={expense.planned}
                        onChange={(event) => updateExpense(expense.id, 'planned', event.target.value)}
                        className="text-right font-semibold"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 xl:hidden">Spent</div>
                      <FieldInput
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={expense.spent}
                        onChange={(event) => updateExpense(expense.id, 'spent', event.target.value)}
                        className="text-right font-semibold"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 xl:hidden">What's Left</div>
                      <div
                        className={`rounded-2xl border px-4 py-3 text-right text-sm font-black ${
                          deltaIsNegative
                            ? 'border-rose-400/20 bg-rose-500/10 text-rose-300'
                            : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {currency(delta)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExpense(expense.id)}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-200"
                      aria-label="Delete expense row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 xl:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_48px] xl:items-center">
                <div className="text-sm font-medium text-slate-400">Totals</div>
                <div className="text-sm font-bold text-white">{currency(totals.totalPlannedExpenses)}</div>
                <div className="text-sm font-bold text-white">{currency(totals.totalMonthlyExpenses)}</div>
                <div className="text-sm font-bold text-white">{currency(totals.totalPlannedExpenses - totals.totalMonthlyExpenses)}</div>
                <div />
              </div>
            </div>
          </BudgetSection>

          <BudgetSection
            title="Monthly Savings"
            description="Savings goal items and amounts"
            icon={Coins}
            onAdd={addSaving}
          >
            <div className="space-y-3">
              <div className="hidden grid-cols-[1fr_160px_48px] gap-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 md:grid">
                <div>Name</div>
                <div>Amount</div>
                <div />
              </div>

              {activeMonth.savings.map((saving) => (
                <div
                  key={saving.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_160px_48px] md:items-center"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Name</div>
                    <FieldInput
                      value={saving.name}
                      onChange={(event) => updateSaving(saving.id, 'name', event.target.value)}
                      placeholder="Savings name"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Amount</div>
                    <FieldInput
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={saving.amount}
                      onChange={(event) => updateSaving(saving.id, 'amount', event.target.value)}
                      className="text-right font-semibold"
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSaving(saving.id)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-200"
                    aria-label="Delete savings row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm">
                <span className="font-medium text-slate-400">Total Savings</span>
                <span className="text-lg font-black text-sky-300">{currency(totals.totalMonthlySavings)}</span>
              </div>
            </div>
          </BudgetSection>
        </main>
      </div>
    </div>
  );
}