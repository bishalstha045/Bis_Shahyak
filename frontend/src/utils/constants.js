export const INDIC_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect (स्वतः पहचान)' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'ur', name: 'اردو (Urdu)' }
];

export const DEMO_WORKFLOW_PROMPTS = [
  {
    category: "Step 1: Product Mapping",
    query: "I manufacture stainless steel water bottles.",
    desc: "Identifies product characteristics & maps IS 17803:2022 / IS 17526:2021",
    tag: "P0 Core Flow"
  },
  {
    category: "Step 2: Electrical Safety",
    query: "What safety standards apply to electric kettles?",
    desc: "Maps IS 302-2-15:2009 with boil-dry & thermal cut-out evidence",
    tag: "QCO Mandate"
  },
  {
    category: "Step 3: हिंदी / Local Language",
    query: "IS 3196 के बारे में बताइए",
    desc: "LPG गैस सिलेंडर के परीक्षण, सामग्री और सुरक्षा मानक",
    tag: "Hindi Voice"
  },
  {
    category: "Step 4: Standard Comparison",
    query: "Compare IS 302-2-15 and IS 302 (Part 1)",
    desc: "Side-by-side comparison of particular vs base electrical safety standards",
    tag: "Comparison"
  },
  {
    category: "Step 5: Toy Export Certification",
    query: "Which BIS certification do I need to export toys?",
    desc: "IS 9873 (Part 1 & 3) safety aspects, choking hazards & heavy metal limits",
    tag: "Exports"
  },
  {
    category: "Step 6: Gold Hallmarking & HUID",
    query: "What are the BIS gold hallmarking and HUID rules?",
    desc: "IS 1417 purity fineness grades and 6-digit laser HUID mandates",
    tag: "Hallmarking"
  }
];

export const SAMPLE_DOCUMENTS = [
  {
    name: "NABL_Test_Report_Stainless_Steel_Flask.pdf",
    description: "NABL accredited lab report for 750ml vacuum insulated bottle (Supports Clauses 4.1, 5.2, 6.1 - Missing Clause 8.1)",
    standard_id: "IS 17803:2022",
    content: `NATIONAL ACCREDITED TESTING LABORATORY
TEST REPORT NO: NABL/TR/2024/7719
Sample: Double-Walled Stainless Steel Vacuum Flask (750 ml)
Applicant: Alpha Stainless Works Ltd.
Standard Referenced: IS 17803:2022

1. Chemical Composition Analysis (Clause 4.1):
- Material: Austenitic Stainless Steel Grade SS 304 (IS 6911)
- Chromium: 18.35% (Requirement: >18.0%) -> PASS
- Nickel: 8.22% (Requirement: >8.0%) -> PASS
- Overall Migration in 3% Acetic Acid: 4.2 mg/kg (Limit: <60 mg/kg) -> PASS

2. Thermal Insulation Retention Test (Clause 5.2):
- Initial Boiling Water Temperature: 98.5°C
- Ambient Room Temperature: 27°C ± 1°C
- 6-Hour Retention Temperature: 64.8°C (Minimum Requirement: 60°C) -> PASS

3. Inversion Leakage Test (Clause 6.1):
- Pressure: 20 kPa internal pneumatic pressure for 30 minutes
- Seepage / Gasket Deformation: None Observed (Zero Seepage) -> PASS

CONCLUSION: The submitted sample conforms to Clauses 4.1, 5.2, and 6.1 of IS 17803:2022. Note: Marking and Laser Etching verification was not submitted in this lot.`
  },
  {
    name: "Type_Test_Report_Electric_Kettle_2200W.pdf",
    description: "Electrical type test report for 1.7L cordless electric kettle (Supports Clauses 7.1, 13.2, 19.101 - Missing Clause 22.103)",
    standard_id: "IS 302-2-15:2009",
    content: `CENTRAL ELECTRICAL TESTING LABORATORY
TYPE TEST CERTIFICATE NO: CETL/2024/5521
Product: Cordless Electric Kettle 1.7L (230V AC, 2200W)
Standard: IS 302-2-15:2009 & IS 302 (Part 1):2008

1. Rating Marking & Instructions (Clause 7.1):
- Voltage, Wattage, Model No, and ISI Logo layout present on base rating plate -> PASS

2. Leakage Current & Dielectric Breakdown (Clause 13.2 & 16):
- Dielectric Withstand: 1000V AC applied for 60 seconds with zero flashover -> PASS
- Operating Leakage Current: Measured 0.24 mA (Permissible Max: 0.75 mA) -> PASS

3. Abnormal Operation & Boil-Dry Protection (Clause 19.101):
- Energized without liquid: Bimetal thermal cut-out activated at 182°C within 38 seconds -> PASS
- Casing flame or deformation: None observed -> PASS

CONCLUSION: Sample conforms to safety clauses 7.1, 13.2, and 19.101 of IS 302-2-15:2009.`
  }
];

export const COMPARISON_PAIRS = [
  { std_a: "IS 302-2-15:2009", std_b: "IS 302 (Part 1):2008", label: "Electric Kettles vs General Safety" },
  { std_a: "IS 17803:2022", std_b: "IS 17526:2021", label: "Vacuum Insulated vs Single-Wall Steel Bottles" },
  { std_a: "IS 14543:2004", std_b: "IS 15410:2003", label: "Packaged Drinking Water vs PET Packaging" },
  { std_a: "IS 9873 (Part 1):2019", std_b: "IS 9873 (Part 3):2020", label: "Toy Mechanical Safety vs Heavy Metal Toxicity" }
];
