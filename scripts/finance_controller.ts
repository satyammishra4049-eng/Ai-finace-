import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

// --- Types ---
interface LedgerEntry {
  invoiceId: string;
  clientName: string;
  amountExpected: number;
  status: 'OPEN' | 'CLOSED';
}

interface BankTransaction {
  txnId: string;
  description: string;
  amountReceived: number;
  date: string;
  status: 'UNMATCHED' | 'MATCHED' | 'EXCEPTION';
  matchedTo?: string[];
  reasoning?: string;
}

// --- Data Generation ---
function generateSyntheticData() {
  const ledger: LedgerEntry[] = [];
  const bankFeed: BankTransaction[] = [];
  
  // Generate 60 records
  for (let i = 1; i <= 60; i++) {
    const amount = Math.floor(Math.random() * 900) + 100;
    const clientName = `Client_${i}`;
    const invoiceId = `INV-${1000 + i}`;
    
    ledger.push({
      invoiceId,
      clientName,
      amountExpected: amount,
      status: 'OPEN'
    });
    
    // 60% Perfect matches (1-36)
    if (i <= 36) {
      bankFeed.push({
        txnId: `TXN-${2000 + i}`,
        description: `PAYMENT FROM ${clientName} REF ${invoiceId}`,
        amountReceived: amount,
        date: '2026-09-01',
        status: 'UNMATCHED'
      });
    } 
    // 15% Fee deductions (37-45)
    else if (i <= 45) {
      const fee = 15;
      bankFeed.push({
        txnId: `TXN-${2000 + i}`,
        description: `WIRE FROM ${clientName} - WIRE FEE DEDUCTED`,
        amountReceived: amount - fee,
        date: '2026-09-01',
        status: 'UNMATCHED'
      });
    }
    // 15% Aggregated / Missing ref (46-54)
    else if (i <= 50) {
      // Missing reference entirely
      bankFeed.push({
        txnId: `TXN-${2000 + i}`,
        description: `ACH DEPOSIT - NO REMITTANCE`,
        amountReceived: amount,
        date: '2026-09-02',
        status: 'UNMATCHED'
      });
    } else if (i <= 54) {
      // Aggregated or Messy
      bankFeed.push({
        txnId: `TXN-${2000 + i}`,
        description: `BATCH PAYMENT - ${clientName}`,
        amountReceived: amount, 
        date: '2026-09-02',
        status: 'UNMATCHED'
      });
    }
  }
  
  // 5% True Exceptions (55-60)
  // These do not correspond to any invoice
  for (let i = 55; i <= 60; i++) {
    bankFeed.push({
      txnId: `TXN-${2000 + i}`,
      description: `UNKNOWN TRANSFER REF ABCXYZ`,
      amountReceived: Math.floor(Math.random() * 5000),
      date: '2026-09-03',
      status: 'UNMATCHED'
    });
  }
  
  return { ledger, bankFeed };
}

// --- Layer 1: Deterministic Matcher ---
function deterministicMatch(ledger: LedgerEntry[], bankFeed: BankTransaction[]) {
  let matchCount = 0;
  for (const txn of bankFeed) {
    if (txn.status !== 'UNMATCHED') continue;
    
    // Look for exact amount AND exact invoice ID in description
    const exactMatch = ledger.find(entry => 
      entry.status === 'OPEN' && 
      txn.amountReceived === entry.amountExpected &&
      txn.description.includes(entry.invoiceId)
    );
    
    if (exactMatch) {
      exactMatch.status = 'CLOSED';
      txn.status = 'MATCHED';
      txn.matchedTo = [exactMatch.invoiceId];
      txn.reasoning = 'Deterministic: Exact amount and Invoice ID matched.';
      matchCount++;
    }
  }
  return matchCount;
}

// --- Layer 2: Agentic Matcher ---
async function agenticMatch(ledger: LedgerEntry[], unmatchedFeed: BankTransaction[]) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("WARNING: OPENAI_API_KEY is not set. Skipping Agentic Matcher and marking remaining as EXCEPTIONS.");
    for (const txn of unmatchedFeed) {
      if (txn.status === 'UNMATCHED') {
         txn.status = 'EXCEPTION';
         txn.reasoning = 'Agent skipped (No API key)';
      }
    }
    return 0;
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let agenticMatchCount = 0;
  
  console.log(`Sending ${unmatchedFeed.length} unmatched transactions to the AI...`);
  
  for (const txn of unmatchedFeed) {
    if (txn.status !== 'UNMATCHED') continue;
    
    const openLedger = ledger.filter(l => l.status === 'OPEN');
    const ledgerContext = JSON.stringify(openLedger, null, 2);
    
    const prompt = `
      You are an AI Finance Controller. Your job is to reconcile a bank transaction against open ledger entries.
      Rules:
      1. You can match if the amount differs by less than $25 (wire fee) and the client name or reference aligns.
      2. If you are not 100% confident, you MUST NOT MATCH. Reply with EXCEPTION.
      3. Return ONLY a JSON object in this exact format:
         { "status": "MATCHED" | "EXCEPTION", "invoiceId": "INV-XXXX" (or null), "reasoning": "your explanation" }
      
      Bank Transaction:
      ${JSON.stringify(txn, null, 2)}
      
      Open Ledger Entries:
      ${ledgerContext}
    `;
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      if (content) {
        const result = JSON.parse(content);
        if (result.status === 'MATCHED' && result.invoiceId) {
          const entry = ledger.find(l => l.invoiceId === result.invoiceId);
          if (entry && entry.status === 'OPEN') {
            entry.status = 'CLOSED';
            txn.status = 'MATCHED';
            txn.matchedTo = [entry.invoiceId];
            txn.reasoning = `Agentic: ${result.reasoning}`;
            agenticMatchCount++;
          }
        } else {
          txn.status = 'EXCEPTION';
          txn.reasoning = result.reasoning || 'Agent flagged as exception.';
        }
      }
    } catch (e) {
      txn.status = 'EXCEPTION';
      txn.reasoning = 'Agent error during processing.';
    }
  }
  
  return agenticMatchCount;
}

// --- Main Execution ---
async function runController() {
  console.log("=== Starting AI Finance Controller ===");
  const { ledger, bankFeed } = generateSyntheticData();
  const totalTxn = bankFeed.length;
  
  console.log(`Generated ${totalTxn} bank transactions and ${ledger.length} invoices.`);
  
  const deterministicMatches = deterministicMatch(ledger, bankFeed);
  console.log(`Layer 1 (Deterministic) matched: ${deterministicMatches}`);
  
  const unmatched = bankFeed.filter(t => t.status === 'UNMATCHED');
  
  const agenticMatches = await agenticMatch(ledger, unmatched);
  console.log(`Layer 2 (Agentic) matched: ${agenticMatches}`);
  
  const exceptions = bankFeed.filter(t => t.status === 'EXCEPTION');
  
  const matchRate = ((deterministicMatches + agenticMatches) / totalTxn) * 100;
  
  console.log("\n=== AI Finance Controller Run Report ===");
  console.log(`Total Records Processed: ${totalTxn}`);
  console.log(`Deterministic Matches: ${deterministicMatches}`);
  console.log(`Agentic Matches:   ${agenticMatches}`);
  console.log(`Exceptions Flagged:  ${exceptions.length}`);
  console.log(`\nMatch Rate: ${matchRate.toFixed(2)}% (${deterministicMatches + agenticMatches}/${totalTxn})`);
  
  console.log("\n=== Exception List ===");
  exceptions.forEach((e, i) => {
    console.log(`${i+1}. ${e.txnId}: $${e.amountReceived} - ${e.description}`);
    console.log(`   Reasoning: ${e.reasoning}`);
  });
}

runController().catch(console.error);
