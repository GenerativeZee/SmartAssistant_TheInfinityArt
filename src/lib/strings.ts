/**
 * Every user-facing string in one place so the language can be switched later.
 * Hinglish for anything Shahid acts on (titles, buttons, section headers).
 * English for data he only reads.
 */
export const S = {
  appName: "The Infinity Art",

  tabs: {
    aaj: "Aaj",
    clients: "Clients",
    jobs: "Jobs",
    paisa: "Paisa",
  },

  nav: {
    settings: "Settings",
    add: "Naya",
  },

  aaj: {
    title: "Aaj Ka Kaam",
    callSection: "Call karna hai",
    paisaSection: "Paisa baaki",
    deliverySection: "Aaj / kal delivery",
    late: "LATE",
    allClearTitle: "Aaj kuch pending nahi",
    monthSoFar: "Is mahine ab tak",
    coldClients: "90 din se baat nahi hui",
    earned: "Kamaya",
    received: "Aaya",
    outstanding: "Baaki",
    newClients: "Naye clients",
  },

  actions: {
    call: "Call",
    whatsapp: "WhatsApp",
    done: "Done",
    kal: "Kal",
    snooze: "Kal",
    drop: "Hata do",
    save: "Save",
    cancel: "Cancel",
    preview: "Preview",
    send: "Bhejo",
    saveDraft: "Draft save karo",
  },

  quickAdd: {
    title: "Naya client / visit",
    phone: "Phone number",
    name: "Naam",
    requirement: "Kaam kya hai",
    whatNext: "Aage kya",
    callBack: "Call back",
    sendQuote: "Quotation bhejna",
    showDemo: "Demo dikhana",
    nothing: "Kuch nahi",
    kal: "Kal",
    twoDays: "2 din",
    thisWeek: "Is hafte",
    pickDate: "Date chuno",
    voiceNote: "Voice note",
    savedToast: (name: string) => `Saved · ${name}`,
    existingToast: (name: string) => `Purana client khula · ${name}`,
  },

  requirementChips: {
    signage: "Board / Signage",
    print: "Print",
    wedding: "Shaadi card",
    branding: "Logo / Branding",
    web: "Website",
    other: "Other",
    mockup: "Mockup",
  },

  client: {
    totalBusiness: "Total business",
    balance: "Baaki",
    advance: "Advance jama",
    newQuotation: "Naya quotation",
    newJob: "Naya job",
    timeline: "Poori kahani",
  },

  quotation: {
    title: "Quotation",
    builder: "Quotation banao",
    subtotal: "Subtotal",
    discount: "Discount",
    taxable: "Taxable",
    gst: "GST",
    cgst: "CGST",
    sgst: "SGST",
    grandTotal: "Total",
    addItem: "Item jodo",
    area: "sq.ft",
    statusDraft: "Draft",
    statusSent: "Bheja",
    statusFollowup: "Follow-up",
    statusWon: "Mil gaya",
    statusLost: "Nahi mila",
    sentAgo: "din pehle bheja",
    markWon: "Mil gaya",
    markLost: "Nahi mila",
  },

  won: {
    title: "Job banao",
    promisedDate: "Delivery kab deni hai",
    startStage: "Abhi kis stage pe",
    advance: "Advance mila (optional)",
    confirm: "Job banao",
  },

  job: {
    title: "Job",
    board: "Jobs",
    groupLate: "Late",
    groupToday: "Aaj",
    groupWeek: "Is hafte",
    groupLater: "Baad mein",
    total: "Total",
    received: "Aaya",
    balance: "Baaki",
    advanceStage: "Aage badhao",
    deliver: "Delivery karo",
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
    cancelled: "Cancel",
  },

  paisa: {
    title: "Paisa",
    toCollect: "Aana hai",
    received: "Aaya",
    addPayment: "Payment jodo",
    amount: "Kitna",
    mode: "Kaise",
    againstJob: "Kis job ke liye",
    date: "Date",
    monthTotal: "Is mahine",
    receiptNo: "Receipt",
    ageing0: "0–15 din",
    ageing1: "16–30 din",
    ageing2: "30+ din",
    ageingPending: "Delivery baaki",
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
    sqftRounding: "sq.ft rounding",
    greeting: "Greeting word",
    terms: "Quotation terms",
    templates: "Message templates",
    rateCard: "Rate card",
    exportExcel: "Sab Excel me export karo",
  },

  auth: {
    signIn: "Sign in",
    email: "Email",
    password: "Password",
    signInCta: "Andar aao",
    signOut: "Sign out",
    wrong: "Email ya password galat hai",
  },

  common: {
    loading: "Ruko…",
    empty: "Kuch nahi hai",
    saved: "Save ho gaya",
    error: "Kuch gadbad hui",
  },
} as const;

export type Strings = typeof S;
