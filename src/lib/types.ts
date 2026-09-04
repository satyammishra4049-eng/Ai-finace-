export type Cents = number;

export type AccountId = "operating" | "payroll";

export type ExceptionKind =
  | "unmatched_inflow"
  | "unmatched_outflow"
  | "short_pay"
  | "timing"
  | "fee_adjusted"
  | "split_unresolved"
  | "open_receivable"
  | "open_payable"
  | "tax_variance";

export interface Party {
  id: string;
  name: string;
  aliases: string[];
  kind: "customer" | "vendor" | "tax" | "bank" | "processor" | "payroll";
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  issued: string;
  due: string;
  amount: Cents;
  tax: Cents;
  terms: string;
  resale: boolean;
}

export interface Bill {
  id: string;
  number: string;
  vendorId: string;
  vendorName: string;
  issued: string;
  due: string;
  amount: Cents;
  category: "inventory" | "freight" | "utilities" | "insurance" | "services" | "tax" | "payroll";
}

export interface BankLine {
  id: string;
  date: string;
  amount: Cents;
  description: string;
  counterparty: string;
  ref: string;
  account: AccountId;
}

export interface Payout {
  id: string;
  date: string;
  gross: Cents;
  fees: Cents;
  net: Cents;
  charges: number;
  processor: "stripe";
}

export interface TaxRemittance {
  id: string;
  agency: string;
  period: string;
  due: string;
  amount: Cents;
  kind: "sales" | "payroll_federal" | "payroll_state";
}

export interface TruthLink {
  bankId: string;
  invoiceIds: string[];
  billIds: string[];
  payoutId?: string;
  taxId?: string;
  kind: "ar" | "ap" | "payout" | "tax" | "payroll" | "fee" | "transfer" | "unmatchable";
}

export interface Match {
  id: string;
  bankId: string;
  invoiceIds: string[];
  billIds: string[];
  payoutId?: string;
  taxId?: string;
  confidence: number;
  method: string;
  amount: Cents;
  note: string;
}

export interface Exception {
  id: string;
  kind: ExceptionKind;
  title: string;
  detail: string;
  amount: Cents;
  bankId?: string;
  invoiceIds: string[];
  billIds: string[];
  suggestedAction: string;
}

export interface CashDay {
  date: string;
  inflows: Cents;
  outflows: Cents;
  closing: Cents;
  label: string;
}

export interface ReconcileResult {
  runAt: string;
  asOf: string;
  bankLines: number;
  candidateDocs: number;
  matches: Match[];
  exceptions: Exception[];
  matchedBankIds: string[];
  unmatchedBankIds: string[];
  metrics: {
    matchRate: number;
    matchedCount: number;
    unmatchedCount: number;
    truthAccuracy: number;
    truthChecked: number;
    truthCorrect: number;
    openAr: Cents;
    openAp: Cents;
    operatingCash: Cents;
    payrollCash: Cents;
  };
}

export interface Books {
  company: {
    name: string;
    legal: string;
    ein: string;
    asOf: string;
    period: string;
    bankName: string;
    accountMask: string;
  };
  opening: { operating: Cents; payroll: Cents };
  parties: Party[];
  invoices: Invoice[];
  bills: Bill[];
  bank: BankLine[];
  payouts: Payout[];
  tax: TaxRemittance[];
  truth: TruthLink[];
}
