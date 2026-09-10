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
    query: "I manufacture domestic pressure cookers.",
    desc: "Identifies product characteristics & maps IS 2347:2017 with bursting pressure clauses",
    tag: "Mandatory QCO"
  },
  {
    category: "Step 2: Electrical Water Heaters",
    query: "What safety testing is mandatory for electric storage water heaters (geysers)?",
    desc: "Maps IS 302 (Part 2/Sec 21):2024 & IS 2082:2018 with boil-dry and hydrostatic tests",
    tag: "QCO 2025"
  },
  {
    category: "Step 3: हिंदी / Local Language",
    query: "IS 10500 पीने के पानी के मानक के बारे में बताइए",
    desc: "पीने के पानी में टीडीएस, भारी धातु (आर्सेनिक/लेड) और कॉलीफॉर्म बैक्टीरिया परीक्षण",
    tag: "Hindi Voice"
  },
  {
    category: "Step 4: Standard Comparison",
    query: "Compare IS 15844 (Part 1) and IS 15844 (Part 3) for sports footwear",
    desc: "Side-by-side comparison of General Purpose vs Professional Sports Footwear QCO rules",
    tag: "Comparison"
  },
  {
    category: "Step 5: Medical Device Certification",
    query: "What compliance is needed for sterile surgical gloves under IS 13422?",
    desc: "ISO 10282 water tightness AQL 0.65, tensile before/after aging, and sterility assurance",
    tag: "Medical Safety"
  },
  {
    category: "Step 6: Protective Equipment",
    query: "What are the mandatory testing clauses for two-wheeler helmets under IS 4151?",
    desc: "Shell impact attenuation peak 300g, chinstrap dynamic elongation, and penetration",
    tag: "Road Safety QCO"
  }
];

export const SAMPLE_DOCUMENTS = [
  {
    name: "NABL_Test_Report_Pressure_Cooker_5L.pdf",
    description: "NABL accredited test report for 5 Litre aluminium induction pressure cooker (Supports Clauses 4.1, 5.4, 6.1 - Missing Clause 7.2)",
    standard_id: "IS 2347:2017",
    content: `NATIONAL ACCREDITED TESTING LABORATORY (NABL ACCREDITED)
TEST REPORT NO: NABL/TR/2025/8812
Sample Description: Domestic Pressure Cooker 5 Litres (Induction Base)
Manufacturer: Bharat Cookware & Appliances Pvt. Ltd.
Standard Referenced: IS 2347:2017

1. Material Composition Analysis (Clause 4.1):
- Body Material: Wrought Aluminium Alloy IS 21 (Grade 40800)
- Aluminium Purity: 99.25% (Requirement: Min 99.0%) -> PASS
- Lead Extraction in Acetic Acid: 0.004 mg/kg (Limit: <0.01 mg/kg) -> PASS
- Cadmium Extraction: Below Detection Limit (BDL) -> PASS

2. Operating Pressure Regulation Test (Clause 5.4):
- Nominal Working Steam Pressure: 102 kPa (Permissible Range: 90 kPa - 110 kPa) -> PASS
- Vent Weight Free Movement: Satisfactory steam discharge -> PASS

3. Hydrostatic Bursting Pressure Safety Test (Clause 6.1):
- Target Proof Pressure: 300 kPa (3.0 kgf/cm²) maintained for 5 minutes
- Result: Zero leakage, zero body rupture, zero lid disengagement -> PASS

4. Secondary Safety Fusible Plug Verification (Clause 7.2):
- Fuse plug temperature rating: Not tested in this batch -> MISSING / PENDING

CONCLUSION: Sample conforms to Clauses 4.1, 5.4, and 6.1 of IS 2347:2017. Secondary fusible plug calibration certificate must be submitted.`
  },
  {
    name: "Type_Test_Report_Electric_Water_Heater_25L.pdf",
    description: "Electrical type test certificate for 25L storage geyser (Supports Clauses 8.1, 13.2, 19.1 - Missing Clause 22.101)",
    standard_id: "IS 302 (Part 2/Sec 21):2024",
    content: `CENTRAL ELECTRICAL TESTING LABORATORY
TYPE TEST CERTIFICATE NO: CETL/2025/3340
Product: Stationary Storage Electric Water Heater 25L (230V AC, 2000W, 0.8 MPa)
Standard: IS 302 (Part 2/Sec 21):2024 & IS 2082:2018

1. Protection Against Access to Live Parts (Clause 8.1):
- Probe B insertion: Zero contact with live terminal blocks -> PASS
- Earth Continuity Resistance: 0.04 Ohm (Permissible Max: 0.1 Ohm) -> PASS

2. Leakage Current & High Voltage Dielectric Test (Clause 13.2):
- Operating Temperature Leakage Current: 0.38 mA (Max Allowed: 0.75 mA) -> PASS
- Dielectric High Voltage Withstand: 1250V AC applied for 60 seconds -> PASS

3. Abnormal Operation & Dry Boil Safety Trip (Clause 19.1):
- Tank energized without water: Thermal cut-out disconnected circuit in 52 seconds -> PASS
- Max surface temperature during trip: 112°C (Safe cutoff without flame) -> PASS

4. Pressure Vessel Hydrostatic Proof Test (Clause 22.101):
- 1.2 MPa hydraulic pressure test report pending from pressure vessel vendor -> NEEDS REVIEW

CONCLUSION: Conforms to electrical safety clauses 8.1, 13.2, and 19.1 of IS 302 (Part 2/Sec 21):2024.`
  }
];

export const COMPARISON_PAIRS = [
  { std_a: "IS 15844 (Part 1):2023", std_b: "IS 15844 (Part 3):2024", label: "Sports Footwear: General Purpose vs Professional" },
  { std_a: "IS 302 (Part 2/Sec 21):2024", std_b: "IS 302 (Part 1):2024", label: "Water Heaters vs General Electrical Safety" },
  { std_a: "IS 269:2015", std_b: "IS 18189:2023", label: "Ordinary Portland Cement vs Low-Carbon Calcined Clay Cement" },
  { std_a: "IS 18266:2023", std_b: "IS 13422:2024 / ISO 10282:2023", label: "Medical Respirators vs Sterile Surgical Gloves" }
];
