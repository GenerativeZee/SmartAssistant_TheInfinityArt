/**
 * Every user-facing string in one place so copy can be changed without
 * touching components. App UI is English throughout (D15) — Shahid reads
 * English comfortably; only the outbound WhatsApp templates (lib/messages.ts)
 * stay Hinglish, because those are written to his customers, not to him.
 */
export const S = {
  appName: "The Infinity Art",

  tabs: {
    aaj: "Today",
    clients: "Clients",
    jobs: "Jobs",
    paisa: "Payments",
  },

  nav: {
    settings: "Settings",
    add: "New",
  },

  aaj: {
    title: "Today",
    callSection: "Calls due",
    paisaSection: "Payments due",
    deliverySection: "Delivering today / tomorrow",
    late: "LATE",
    allClearTitle: "Nothing pending today",
    monthSoFar: "This month so far",
    coldClients: "Not contacted in 90 days",
    earned: "Billed",
    received: "Received",
    outstanding: "Outstanding",
    newClients: "New clients",
  },

  actions: {
    call: "Call",
    whatsapp: "WhatsApp",
    done: "Done",
    kal: "Tomorrow",
    snooze: "Snooze",
    drop: "Drop",
    save: "Save",
    cancel: "Cancel",
    preview: "Preview",
    send: "Send",
    saveDraft: "Save draft",
  },

  quickAdd: {
    title: "New client / visit",
    phone: "Phone number",
    name: "Name",
    requirement: "What do they need",
    whatNext: "What's next",
    callBack: "Call back",
    sendQuote: "Send a quote",
    showDemo: "Show a demo",
    nothing: "Nothing for now",
    kal: "Tomorrow",
    twoDays: "In 2 days",
    thisWeek: "This week",
    pickDate: "Pick a date",
    voiceNote: "Voice note",
    savedToast: (name: string) => `Saved · ${name}`,
    existingToast: (name: string) => `Existing client · ${name}`,
  },

  requirementChips: {
    signage: "Signage",
    print: "Print",
    wedding: "Wedding cards",
    branding: "Logo / Branding",
    web: "Website",
    other: "Other",
    mockup: "Mockup",
  },

  client: {
    totalBusiness: "Total business",
    balance: "Balance due",
    advance: "In credit",
    newQuotation: "New quotation",
    newJob: "New job",
    timeline: "History",
  },

  quotation: {
    title: "Quotation",
    builder: "New quotation",
    subtotal: "Subtotal",
    discount: "Discount",
    taxable: "Taxable value",
    gst: "GST",
    cgst: "CGST",
    sgst: "SGST",
    grandTotal: "Total",
    addItem: "Add item",
    area: "sq.ft",
    statusDraft: "Draft",
    statusSent: "Sent",
    statusFollowup: "Following up",
    statusWon: "Won",
    statusLost: "Lost",
    sentAgo: "days ago",
    markWon: "Mark won",
    markLost: "Mark lost",
  },

  won: {
    title: "Create job",
    promisedDate: "Promised delivery date",
    startStage: "Starting stage",
    advance: "Advance received (optional)",
    confirm: "Create job",
  },

  job: {
    title: "Job",
    board: "Jobs",
    groupLate: "Late",
    groupToday: "Today",
    groupWeek: "This week",
    groupLater: "Later",
    total: "Total",
    received: "Received",
    balance: "Balance",
    advanceStage: "Advance stage",
    deliver: "Mark delivered",
    stageNote: "Note (optional)",
    attachments: "Files",
  },

  stages: {
    design: "Design",
    approval: "Approval",
    print: "Print",
    finishing: "Finishing",
    installation: "Installation",
    delivered: "Delivered",
    cancelled: "Cancelled",
  },

  paisa: {
    title: "Payments",
    toCollect: "Receivable",
    received: "Received",
    addPayment: "Add payment",
    amount: "Amount",
    mode: "Mode",
    againstJob: "Against job",
    date: "Date",
    monthTotal: "This month",
    receiptNo: "Receipt",
    ageing0: "0–15 days",
    ageing1: "16–30 days",
    ageing2: "30+ days",
    ageingPending: "Not yet delivered",
  },

  modes: {
    cash: "Cash",
    upi: "UPI",
    bank: "Bank",
    cheque: "Cheque",
  },

  settings: {
    title: "Settings",
    shopProfile: "Shop profile",
    logo: "Logo",
    gstin: "GSTIN",
    upiId: "UPI ID",
    upiQr: "UPI QR",
    gstRate: "Default GST %",
    sqftRounding: "Sq.ft rounding",
    greeting: "Greeting word",
    terms: "Quotation terms",
    templates: "Message templates",
    rateCard: "Rate card",
    exportExcel: "Export everything to Excel",
  },

  auth: {
    signIn: "Sign in",
    email: "Email",
    password: "Password",
    signInCta: "Sign in",
    signOut: "Sign out",
    wrong: "Incorrect email or password",
  },

  common: {
    loading: "Loading…",
    empty: "Nothing here yet",
    saved: "Saved",
    error: "Something went wrong",
    comingSoon: "Coming soon",
  },
} as const;

export type Strings = typeof S;
