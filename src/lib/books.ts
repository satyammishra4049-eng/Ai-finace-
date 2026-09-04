import type { BankLine, Bill, Books, Cents, Invoice, Payout, TaxRemittance, TruthLink } from "./types";

const c = (dollars: number): Cents => Math.round(dollars * 100);

export function loadBooks(): Books {
  const invoices: Invoice[] = [
    inv("INV-2401", "HARBOR", "Harbor Press LLC", "2026-08-03", "2026-09-02", 12840, 0, "Net 30", true),
    inv("INV-2402", "OAKELM", "Oak & Elm Packaging", "2026-08-03", "2026-09-02", 6720.5, 0, "Net 30", true),
    inv("INV-2403", "LAKESIDE", "Lakeside Bookbinders", "2026-08-04", "2026-09-03", 21400, 0, "Net 30", true),
    inv("INV-2404", "PRAIRIE", "Prairie Catalog Co.", "2026-08-04", "2026-08-18", 3890, 252.85, "Net 14", false),
    inv("INV-2405", "NSHORE", "North Shore Labels Inc", "2026-08-05", "2026-09-04", 9550.25, 0, "Net 30", true),
    inv("INV-2406", "REDLINE", "Redline Screenprint", "2026-08-05", "2026-08-19", 1420, 92.3, "Net 14", false),
    inv("INV-2407", "UNION", "Union Station Print", "2026-08-06", "2026-09-05", 18880, 0, "Net 30", true),
    inv("INV-2408", "FOXRIVER", "Fox River Converting", "2026-08-06", "2026-09-05", 7200, 0, "Net 30", true),
    inv("INV-2409", "BELLW", "Bellweather Publishing", "2026-08-07", "2026-09-06", 4410.75, 0, "Net 30", true),
    inv("INV-2410", "CINDER", "Cinder Stationery", "2026-08-07", "2026-08-21", 980, 63.7, "Net 14", false),
    inv("INV-2411", "MAILHOUSE", "Midwest Mailhouse", "2026-08-08", "2026-09-07", 15660, 0, "Net 30", true),
    inv("INV-2412", "ASTER", "Aster & Pine Design", "2026-08-08", "2026-08-22", 2340, 152.1, "Net 14", false),
    inv("INV-2413", "CITYHALL", "City of Evanston Print Shop", "2026-08-08", "2026-09-22", 6120, 0, "Net 45", true),
    inv("INV-2414", "HARBOR", "Harbor Press LLC", "2026-08-11", "2026-09-10", 8900, 0, "Net 30", true),
    inv("INV-2415", "OAKELM", "Oak & Elm Packaging", "2026-08-11", "2026-09-10", 4100, 0, "Net 30", true),
    inv("INV-2416", "LAKESIDE", "Lakeside Bookbinders", "2026-08-12", "2026-09-11", 9800, 0, "Net 30", true),
    inv("INV-2417", "PRAIRIE", "Prairie Catalog Co.", "2026-08-12", "2026-08-26", 2215.4, 144, "Net 14", false),
    inv("INV-2418", "NSHORE", "North Shore Labels Inc", "2026-08-13", "2026-09-12", 13320, 0, "Net 30", true),
    inv("INV-2419", "REDLINE", "Redline Screenprint", "2026-08-13", "2026-08-27", 760, 49.4, "Net 14", false),
    inv("INV-2420", "UNION", "Union Station Print", "2026-08-14", "2026-09-13", 6400, 0, "Net 30", true),
    inv("INV-2421", "FOXRIVER", "Fox River Converting", "2026-08-14", "2026-09-13", 11750, 0, "Net 30", true),
    inv("INV-2422", "BELLW", "Bellweather Publishing", "2026-08-15", "2026-09-14", 2750, 0, "Net 30", true),
    inv("INV-2423", "CINDER", "Cinder Stationery", "2026-08-15", "2026-08-29", 1640.2, 106.61, "Net 14", false),
    inv("INV-2424", "MAILHOUSE", "Midwest Mailhouse", "2026-08-18", "2026-09-17", 8420, 0, "Net 30", true),
    inv("INV-2425", "ASTER", "Aster & Pine Design", "2026-08-18", "2026-09-01", 1188, 77.22, "Net 14", false),
    inv("INV-2426", "CITYHALL", "City of Evanston Print Shop", "2026-08-18", "2026-10-02", 3900, 0, "Net 45", true),
    inv("INV-2427", "HARBOR", "Harbor Press LLC", "2026-08-19", "2026-09-18", 5600, 0, "Net 30", true),
    inv("INV-2428", "OAKELM", "Oak & Elm Packaging", "2026-08-20", "2026-09-19", 14880, 0, "Net 30", true),
    inv("INV-2429", "LAKESIDE", "Lakeside Bookbinders", "2026-08-20", "2026-09-19", 3300, 0, "Net 30", true),
    inv("INV-2430", "PRAIRIE", "Prairie Catalog Co.", "2026-08-21", "2026-09-04", 5055, 328.58, "Net 14", false),
    inv("INV-2431", "NSHORE", "North Shore Labels Inc", "2026-08-21", "2026-09-20", 2100, 0, "Net 30", true),
    inv("INV-2432", "REDLINE", "Redline Screenprint", "2026-08-22", "2026-09-05", 3188.9, 207.28, "Net 14", false),
    inv("INV-2433", "UNION", "Union Station Print", "2026-08-22", "2026-09-21", 10220, 0, "Net 30", true),
    inv("INV-2434", "FOXRIVER", "Fox River Converting", "2026-08-25", "2026-09-24", 4550, 0, "Net 30", true),
    inv("INV-2435", "BELLW", "Bellweather Publishing", "2026-08-25", "2026-09-24", 8900, 0, "Net 30", true),
    inv("INV-2436", "CINDER", "Cinder Stationery", "2026-08-26", "2026-09-09", 422, 27.43, "Net 14", false),
    inv("INV-2437", "MAILHOUSE", "Midwest Mailhouse", "2026-08-26", "2026-09-25", 17740, 0, "Net 30", true),
    inv("INV-2438", "ASTER", "Aster & Pine Design", "2026-08-27", "2026-09-10", 2765, 179.73, "Net 14", false),
    inv("INV-2439", "HARBOR", "Harbor Press LLC", "2026-08-27", "2026-09-26", 14990, 0, "Net 30", true),
    inv("INV-2440", "OAKELM", "Oak & Elm Packaging", "2026-08-28", "2026-09-27", 610, 0, "Net 30", true),
    inv("INV-2441", "LAKESIDE", "Lakeside Bookbinders", "2026-08-28", "2026-09-27", 12450, 0, "Net 30", true),
    inv("INV-2442", "NSHORE", "North Shore Labels Inc", "2026-08-28", "2026-09-27", 7800, 0, "Net 30", true),
    inv("INV-2443", "UNION", "Union Station Print", "2026-08-29", "2026-09-28", 2155, 0, "Net 30", true),
    inv("INV-2444", "FOXRIVER", "Fox River Converting", "2026-08-29", "2026-09-28", 16800, 0, "Net 30", true),
    inv("INV-2445", "BELLW", "Bellweather Publishing", "2026-08-29", "2026-09-28", 1340, 0, "Net 30", true),
    inv("INV-2446", "MAILHOUSE", "Midwest Mailhouse", "2026-09-01", "2026-10-01", 4920, 0, "Net 30", true),
    inv("INV-2447", "HARBOR", "Harbor Press LLC", "2026-09-01", "2026-10-01", 7200, 0, "Net 30", true),
    inv("INV-2448", "CITYHALL", "City of Evanston Print Shop", "2026-09-01", "2026-10-16", 8800, 0, "Net 45", true)
  ];

  const bills: Bill[] = [
    bill("BILL-811", "STORA", "Stora Mill America", "2026-07-28", "2026-08-12", 41200, "inventory"),
    bill("BILL-812", "CASCADE", "Cascade Fiber Inc", "2026-07-30", "2026-08-14", 18660.4, "inventory"),
    bill("BILL-813", "ULINE", "Uline", "2026-08-01", "2026-08-15", 2144.18, "inventory"),
    bill("BILL-814", "COMED", "ComEd", "2026-08-04", "2026-08-25", 1866.09, "utilities"),
    bill("BILL-815", "CINTAS", "Cintas", "2026-08-05", "2026-08-20", 312.5, "services"),
    bill("BILL-816", "WESTLOOP", "WestLoop Logistics", "2026-08-06", "2026-08-20", 4480, "freight"),
    bill("BILL-817", "HEIDEL", "Heidelberg Service North", "2026-08-07", "2026-08-21", 2750, "services"),
    bill("BILL-818", "ZURICH", "Zurich North America", "2026-08-08", "2026-08-22", 6410, "insurance"),
    bill("BILL-819", "STORA", "Stora Mill America", "2026-08-11", "2026-08-26", 33880, "inventory"),
    bill("BILL-820", "CASCADE", "Cascade Fiber Inc", "2026-08-12", "2026-08-27", 9920, "inventory"),
    bill("BILL-821", "ULINE", "Uline", "2026-08-13", "2026-08-27", 880.12, "inventory"),
    bill("BILL-822", "WESTLOOP", "WestLoop Logistics", "2026-08-14", "2026-08-28", 5120, "freight"),
    bill("BILL-823", "CINTAS", "Cintas", "2026-08-15", "2026-08-30", 312.5, "services"),
    bill("BILL-824", "ADP", "ADP Payroll", "2026-08-14", "2026-08-15", 28440.66, "payroll"),
    bill("BILL-825", "ILDOR", "IL Department of Revenue", "2026-08-15", "2026-08-20", 4188.4, "tax"),
    bill("BILL-826", "IRS", "United States Treasury", "2026-08-15", "2026-08-15", 9120, "tax"),
    bill("BILL-827", "STORA", "Stora Mill America", "2026-08-18", "2026-09-02", 27550, "inventory"),
    bill("BILL-828", "COMED", "ComEd", "2026-08-20", "2026-09-10", 1740.33, "utilities"),
    bill("BILL-829", "HEIDEL", "Heidelberg Service North", "2026-08-21", "2026-09-04", 640, "services"),
    bill("BILL-830", "WESTLOOP", "WestLoop Logistics", "2026-08-22", "2026-09-05", 3890, "freight"),
    bill("BILL-831", "CASCADE", "Cascade Fiber Inc", "2026-08-22", "2026-09-06", 15420.8, "inventory"),
    bill("BILL-832", "ADP", "ADP Payroll", "2026-08-28", "2026-08-29", 29110.2, "payroll"),
    bill("BILL-833", "ULINE", "Uline", "2026-08-26", "2026-09-09", 1566.9, "inventory"),
    bill("BILL-834", "CINTAS", "Cintas", "2026-08-27", "2026-09-11", 312.5, "services"),
    bill("BILL-835", "ZURICH", "Zurich North America", "2026-08-28", "2026-09-12", 6410, "insurance"),
    bill("BILL-836", "STORA", "Stora Mill America", "2026-08-29", "2026-09-13", 19880, "inventory"),
    bill("BILL-837", "WESTLOOP", "WestLoop Logistics", "2026-09-01", "2026-09-15", 2210, "freight"),
    bill("BILL-838", "ILDOR", "IL Department of Revenue", "2026-09-01", "2026-09-20", 3920.15, "tax")
  ];

  const payouts: Payout[] = [
    { id: "PO-0807", date: "2026-08-07", gross: c(4122.4), fees: c(141.18), net: c(3981.22), charges: 46, processor: "stripe" },
    { id: "PO-0814", date: "2026-08-14", gross: c(3880.1), fees: c(133.22), net: c(3746.88), charges: 41, processor: "stripe" },
    { id: "PO-0821", date: "2026-08-21", gross: c(5210.66), fees: c(176.44), net: c(5034.22), charges: 58, processor: "stripe" },
    { id: "PO-0828", date: "2026-08-28", gross: c(2975.0), fees: c(104.18), net: c(2870.82), charges: 33, processor: "stripe" },
    { id: "PO-0904", date: "2026-09-01", gross: c(1840.5), fees: c(66.9), net: c(1773.6), charges: 19, processor: "stripe" }
  ];

  const tax: TaxRemittance[] = [
    { id: "TAX-IL-JUL", agency: "IL Department of Revenue", period: "July 2026", due: "2026-08-20", amount: c(4188.4), kind: "sales" },
    { id: "TAX-941-AUG1", agency: "United States Treasury", period: "Aug 1–15 2026", due: "2026-08-15", amount: c(9120), kind: "payroll_federal" },
    { id: "TAX-941-AUG2", agency: "United States Treasury", period: "Aug 16–31 2026", due: "2026-09-03", amount: c(9344), kind: "payroll_federal" },
    { id: "TAX-IL-AUG", agency: "IL Department of Revenue", period: "August 2026", due: "2026-09-20", amount: c(3920.15), kind: "sales" }
  ];

  const bank: BankLine[] = [];
  const truth: TruthLink[] = [];

  const add = (line: BankLine, link: Omit<TruthLink, "bankId">) => {
    bank.push(line);
    truth.push({ bankId: line.id, ...link });
  };

  let n = 1;
  const bn = () => `BNK-${String(n++).padStart(3, "0")}`;

  add(op(bn(), "2026-08-04", 1284000, "ACH CREDIT HARBOR PRESS LLC INV2401", "Harbor Press LLC", "ACH-88421"), {
    invoiceIds: ["INV-2401"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-05", 672050, "ACH OAK AND ELM PACKAGING", "Oak & Elm Packaging", "ACH-88490"), {
    invoiceIds: ["INV-2402"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-06", 2140000, "WIRE LAKESIDE BOOKBINDERS", "Lakeside Bookbinders", "WIR-11028"), {
    invoiceIds: ["INV-2403"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-08", 414285, "ACH PRAIRIE CATALOG CO", "Prairie Catalog Co.", "ACH-89102"), {
    invoiceIds: ["INV-2404"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-08", 398122, "STRIPE TRANSFER ST-PO0807", "Stripe", "ST-0807"), {
    invoiceIds: [],
    billIds: [],
    payoutId: "PO-0807",
    kind: "payout"
  });
  add(op(bn(), "2026-08-09", 955025, "ACH NORTH SHORE LABELS", "North Shore Labels Inc", "ACH-89211"), {
    invoiceIds: ["INV-2405"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-10", 151230, "ACH REDLINE SCREENPRINT", "Redline Screenprint", "ACH-89300"), {
    invoiceIds: ["INV-2406"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-11", 1888000, "ACH UNION STATION PRINT INV2407", "Union Station Print", "ACH-89440"), {
    invoiceIds: ["INV-2407"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-12", -4120000, "ACH DEBIT STORA MILL AMERICA", "Stora Mill America", "ACH-D-2011"), {
    invoiceIds: [],
    billIds: ["BILL-811"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-12", 720000, "ACH FOX RIVER CONVERTING", "Fox River Converting", "ACH-89501"), {
    invoiceIds: ["INV-2408"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-13", 441075, "ACH BELLWEATHER PUB", "Bellweather Publishing", "ACH-89612"), {
    invoiceIds: ["INV-2409"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-14", 104370, "CHECK 4402 CINDER STATIONERY", "Cinder Stationery", "CHK-4402"), {
    invoiceIds: ["INV-2410"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-14", -1866040, "ACH CASCADE FIBER INC", "Cascade Fiber Inc", "ACH-D-2088"), {
    invoiceIds: [],
    billIds: ["BILL-812"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-14", 374688, "STRIPE TRANSFER ST-PO0814", "Stripe", "ST-0814"), {
    invoiceIds: [],
    billIds: [],
    payoutId: "PO-0814",
    kind: "payout"
  });
  add(op(bn(), "2026-08-15", 1566000, "ACH MIDWEST MAILHOUSE", "Midwest Mailhouse", "ACH-89880"), {
    invoiceIds: ["INV-2411"],
    billIds: [],
    kind: "ar"
  });
  add(pr(bn(), "2026-08-15", -2844066, "ADP WAGE PAY ILLINOIS", "ADP Payroll", "ADP-0815"), {
    invoiceIds: [],
    billIds: ["BILL-824"],
    kind: "payroll"
  });
  add(op(bn(), "2026-08-15", -912000, "IRS USATAXPYMT 941", "United States Treasury", "IRS-941A"), {
    invoiceIds: [],
    billIds: ["BILL-826"],
    taxId: "TAX-941-AUG1",
    kind: "tax"
  });
  add(op(bn(), "2026-08-15", 249210, "ACH ASTER AND PINE DESIGN", "Aster & Pine Design", "ACH-89910"), {
    invoiceIds: ["INV-2412"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-18", -214418, "ACH ULINE", "Uline", "ACH-D-2210"), {
    invoiceIds: [],
    billIds: ["BILL-813"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-18", 890000, "ACH HARBOR PRESS LLC INV2414", "Harbor Press LLC", "ACH-90102"), {
    invoiceIds: ["INV-2414"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-19", 410000, "ACH OAK & ELM PACKAGING", "Oak & Elm Packaging", "ACH-90211"), {
    invoiceIds: ["INV-2415"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-19", -448000, "ACH WESTLOOP LOGISTICS", "WestLoop Logistics", "ACH-D-2301"), {
    invoiceIds: [],
    billIds: ["BILL-816"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-20", -418840, "IL DOR SALES TAX E-PAY", "IL Department of Revenue", "IL-ST-JUL"), {
    invoiceIds: [],
    billIds: ["BILL-825"],
    taxId: "TAX-IL-JUL",
    kind: "tax"
  });
  add(op(bn(), "2026-08-20", 980000, "WIRE LAKESIDE BOOKBINDERS INV2416", "Lakeside Bookbinders", "WIR-11091"), {
    invoiceIds: ["INV-2416"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-20", -15, "INCOMING WIRE FEE", "First Midwest Bank", "FEE-WIR-091"), {
    invoiceIds: [],
    billIds: [],
    kind: "fee"
  });
  add(op(bn(), "2026-08-21", 235940, "ACH PRAIRIE CATALOG", "Prairie Catalog Co.", "ACH-90440"), {
    invoiceIds: ["INV-2417"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-21", 503422, "STRIPE TRANSFER ST-PO0821", "Stripe", "ST-0821"), {
    invoiceIds: [],
    billIds: [],
    payoutId: "PO-0821",
    kind: "payout"
  });
  add(op(bn(), "2026-08-21", -186609, "COMED ENERGY 447821", "ComEd", "ACH-D-2412"), {
    invoiceIds: [],
    billIds: ["BILL-814"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-22", 1332000, "ACH NORTHSHORE LABELS INC", "North Shore Labels Inc", "ACH-90590"), {
    invoiceIds: ["INV-2418"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-22", -31250, "CINTAS CORP", "Cintas", "ACH-D-2440"), {
    invoiceIds: [],
    billIds: ["BILL-815"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-22", 80940, "ACH REDLINE SCREEN PRINT", "Redline Screenprint", "ACH-90602"), {
    invoiceIds: ["INV-2419"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-22", -275000, "HEIDELBERG SERVICE NORTH", "Heidelberg Service North", "ACH-D-2455"), {
    invoiceIds: [],
    billIds: ["BILL-817"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-25", 640000, "ACH UNION STATION PRINT", "Union Station Print", "ACH-90770"), {
    invoiceIds: ["INV-2420"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-25", -641000, "ZURICH NA POLICY", "Zurich North America", "ACH-D-2501"), {
    invoiceIds: [],
    billIds: ["BILL-818"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-25", 1175000, "ACH FOX RIVER CONV", "Fox River Converting", "ACH-90812"), {
    invoiceIds: ["INV-2421"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-26", 275000, "ACH BELLWEATHER PUBLISHING", "Bellweather Publishing", "ACH-90900"), {
    invoiceIds: ["INV-2422"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-26", -3388000, "ACH STORA MILL AMERICA", "Stora Mill America", "ACH-D-2608"), {
    invoiceIds: [],
    billIds: ["BILL-819"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-26", 174681, "CHECK 4418 CINDER", "Cinder Stationery", "CHK-4418"), {
    invoiceIds: ["INV-2423"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-27", 842000, "ACH MIDWEST MAILHOUSE INV2424", "Midwest Mailhouse", "ACH-91040"), {
    invoiceIds: ["INV-2424"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-27", -992000, "ACH CASCADE FIBER", "Cascade Fiber Inc", "ACH-D-2710"), {
    invoiceIds: [],
    billIds: ["BILL-820"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-27", 126522, "ACH ASTER PINE DESIGN", "Aster & Pine Design", "ACH-91100"), {
    invoiceIds: ["INV-2425"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-28", -88012, "ULINE SHIPPING SUPPLY", "Uline", "ACH-D-2802"), {
    invoiceIds: [],
    billIds: ["BILL-821"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-28", 287082, "STRIPE TRANSFER ST-PO0828", "Stripe", "ST-0828"), {
    invoiceIds: [],
    billIds: [],
    payoutId: "PO-0828",
    kind: "payout"
  });
  add(op(bn(), "2026-08-28", -512000, "WESTLOOP LOGISTICS FREIGHT", "WestLoop Logistics", "ACH-D-2819"), {
    invoiceIds: [],
    billIds: ["BILL-822"],
    kind: "ap"
  });
  add(op(bn(), "2026-08-28", 559700, "ACH HARBOR PRESS", "Harbor Press LLC", "ACH-91220"), {
    invoiceIds: ["INV-2427"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-29", -31250, "CINTAS CORP NO 2", "Cintas", "ACH-D-2901"), {
    invoiceIds: [],
    billIds: ["BILL-823"],
    kind: "ap"
  });
  add(pr(bn(), "2026-08-29", -2911020, "ADP WAGE PAY ILLINOIS", "ADP Payroll", "ADP-0829"), {
    invoiceIds: [],
    billIds: ["BILL-832"],
    kind: "payroll"
  });
  add(op(bn(), "2026-08-29", 1488000, "ACH OAK AND ELM PACKAGING", "Oak & Elm Packaging", "ACH-91330"), {
    invoiceIds: ["INV-2428"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-09-01", 330000, "WIRE LAKESIDE BINDERS", "Lakeside Bookbinders", "WIR-11140"), {
    invoiceIds: ["INV-2429"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-09-01", 538358, "ACH PRAIRIE CATALOG CO INV2430", "Prairie Catalog Co.", "ACH-91410"), {
    invoiceIds: ["INV-2430"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-09-01", 177360, "STRIPE TRANSFER ST-PO0904", "Stripe", "ST-0904"), {
    invoiceIds: [],
    billIds: [],
    payoutId: "PO-0904",
    kind: "payout"
  });
  add(op(bn(), "2026-09-01", 210000, "ACH NORTH SHORE LABELS", "North Shore Labels Inc", "ACH-91500"), {
    invoiceIds: ["INV-2431"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-09-02", 339618, "ACH REDLINE SCREENPRINT", "Redline Screenprint", "ACH-91580"), {
    invoiceIds: ["INV-2432"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-09-02", -45, "MONTHLY SERVICE CHARGE", "First Midwest Bank", "FEE-SEP"), {
    invoiceIds: [],
    billIds: [],
    kind: "fee"
  });
  add(op(bn(), "2026-09-02", -3500, "ACH SQ *UNKNOWN 8472", "Unknown", "ACH-UNK-8472"), {
    invoiceIds: [],
    billIds: [],
    kind: "unmatchable"
  });
  add(op(bn(), "2026-09-02", 1022000, "ACH UNION STATION PRINT", "Union Station Print", "ACH-91640"), {
    invoiceIds: ["INV-2433"],
    billIds: [],
    kind: "ar"
  });
  add(op(bn(), "2026-08-25", 612000, "ACH CITY OF EVANSTON", "City of Evanston Print Shop", "ACH-90701"), {
    invoiceIds: ["INV-2413"],
    billIds: [],
    kind: "ar"
  });

  // Short pay: customer remitted $0.03 under invoice (INV-2436 is $449.43; they sent $449.40)
  add(op(bn(), "2026-09-02", 44940, "CHECK 4429 CINDER STATIONERY", "Cinder Stationery", "CHK-4429"), {
    invoiceIds: ["INV-2436"],
    billIds: [],
    kind: "ar"
  });

  // Combined deposit the books intend: INV-2434 + INV-2435 would be wrong parties.
  // Honest hard case: one ACH from a lockbox covering two Harbor invoices that are still open? Skip.
  // Unidentified lockbox residual
  add(op(bn(), "2026-09-02", 4712, "LOCKBOX REMIT BATCH 2291 RESIDUAL", "Lockbox 2291", "LBX-2291"), {
    invoiceIds: [],
    billIds: [],
    kind: "unmatchable"
  });
  add(op(bn(), "2026-09-02", 2135000, "ACH FOX RIVER CONVERTING", "Fox River Converting", "ACH-91702"), {
    invoiceIds: ["INV-2434", "INV-2444"],
    billIds: [],
    kind: "ar"
  });

  return {
    company: {
      name: "AI Finance Controller",
      legal: "AI Finance Services Pvt Ltd",
      ein: "GSTIN: 27AADCB2230M1Z2",
      asOf: "2026-09-02",
      period: "August close through 2 September 2026",
      bankName: "HDFC Bank",
      accountMask: "•••• 4418"
    },
    opening: { operating: c(186420.15), payroll: c(41200.88) },
    parties: [
      { id: "HARBOR", name: "Harbor Press LLC", aliases: ["harbor press", "harbor press llc"], kind: "customer" },
      { id: "OAKELM", name: "Oak & Elm Packaging", aliases: ["oak and elm", "oak & elm"], kind: "customer" },
      { id: "LAKESIDE", name: "Lakeside Bookbinders", aliases: ["lakeside binders", "lakeside bookbinders"], kind: "customer" },
      { id: "PRAIRIE", name: "Prairie Catalog Co.", aliases: ["prairie catalog"], kind: "customer" },
      { id: "NSHORE", name: "North Shore Labels Inc", aliases: ["northshore labels", "north shore labels"], kind: "customer" },
      { id: "REDLINE", name: "Redline Screenprint", aliases: ["redline screen print"], kind: "customer" },
      { id: "UNION", name: "Union Station Print", aliases: ["union station"], kind: "customer" },
      { id: "FOXRIVER", name: "Fox River Converting", aliases: ["fox river conv"], kind: "customer" },
      { id: "BELLW", name: "Bellweather Publishing", aliases: ["bellweather pub"], kind: "customer" },
      { id: "CINDER", name: "Cinder Stationery", aliases: ["cinder"], kind: "customer" },
      { id: "MAILHOUSE", name: "Midwest Mailhouse", aliases: ["midwest mailhouse"], kind: "customer" },
      { id: "ASTER", name: "Aster & Pine Design", aliases: ["aster pine", "aster and pine"], kind: "customer" },
      { id: "CITYHALL", name: "City of Evanston Print Shop", aliases: ["city of evanston"], kind: "customer" },
      { id: "STORA", name: "Stora Mill America", aliases: ["stora mill"], kind: "vendor" },
      { id: "CASCADE", name: "Cascade Fiber Inc", aliases: ["cascade fiber"], kind: "vendor" },
      { id: "ULINE", name: "Uline", aliases: ["uline"], kind: "vendor" },
      { id: "COMED", name: "ComEd", aliases: ["comed"], kind: "vendor" },
      { id: "CINTAS", name: "Cintas", aliases: ["cintas"], kind: "vendor" },
      { id: "WESTLOOP", name: "WestLoop Logistics", aliases: ["westloop"], kind: "vendor" },
      { id: "HEIDEL", name: "Heidelberg Service North", aliases: ["heidelberg"], kind: "vendor" },
      { id: "ZURICH", name: "Zurich North America", aliases: ["zurich"], kind: "vendor" },
      { id: "ADP", name: "ADP Payroll", aliases: ["adp"], kind: "payroll" },
      { id: "ILDOR", name: "IL Department of Revenue", aliases: ["il dor", "illinois"], kind: "tax" },
      { id: "IRS", name: "United States Treasury", aliases: ["irs", "usataxpymt"], kind: "tax" },
      { id: "STRIPE", name: "Stripe", aliases: ["stripe transfer"], kind: "processor" },
      { id: "BANK", name: "First Midwest Bank", aliases: ["service charge", "wire fee"], kind: "bank" }
    ],
    invoices,
    bills,
    bank,
    payouts,
    tax,
    truth
  };
}

function inv(
  number: string,
  customerId: string,
  customerName: string,
  issued: string,
  due: string,
  amount: number,
  tax: number,
  terms: string,
  resale: boolean
): Invoice {
  const total = c(amount) + c(tax);
  return { id: number, number, customerId, customerName, issued, due, amount: total, tax: c(tax), terms, resale };
}

function bill(
  number: string,
  vendorId: string,
  vendorName: string,
  issued: string,
  due: string,
  amount: number,
  category: Bill["category"]
): Bill {
  return { id: number, number, vendorId, vendorName, issued, due, amount: c(amount), category };
}

function op(id: string, date: string, amount: Cents, description: string, counterparty: string, ref: string): BankLine {
  return { id, date, amount, description, counterparty, ref, account: "operating" };
}

function pr(id: string, date: string, amount: Cents, description: string, counterparty: string, ref: string): BankLine {
  return { id, date, amount, description, counterparty, ref, account: "payroll" };
}
