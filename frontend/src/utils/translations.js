import { translateText } from '../services/api';

export const UI_TRANSLATIONS = {
  en: {
    // Navigation & Global
    home: "Home",
    standards: "Standards",
    compliance: "Compliance",
    documents: "Documents",
    verification: "Verification",
    assistant: "AI Assistant",
    compare: "Compare",
    notifications: "Notifications",
    admin_portal: "Admin Portal",
    official_portal: "BIS Sahayak V2 (बीआईएस सहायक)",
    portal_subtitle: "AI-Powered BIS Compliance Navigator & Standards Decision Platform",
    standards_guide: "Standards Guide the Nation",
    standards_tagline: "सही मानक, सुरक्षित भारत",

    // Home Dashboard Hero
    welcome_title: "Welcome to BIS Sahayak",
    hero_headline: "Understand. Comply. Grow.",
    hero_subheadline: "Your AI assistant for BIS standards, compliance guidance, and evidence-based recommendations.",
    search_placeholder: "Describe your product, requirement or ask a BIS question...",
    ask_ai: "Ask AI",
    example_label: "Example:",
    example_text: "I manufacture stainless steel water bottles for children.",

    // Action Cards
    action_find_std: "Find Applicable Standard",
    action_find_std_desc: "Discover relevant BIS standards",
    action_check_comp: "Check Compliance",
    action_check_comp_desc: "Evaluate your readiness",
    action_analyze_docs: "Analyze Documents",
    action_analyze_docs_desc: "Verify test reports & gap check",
    action_verify_lic: "Verify License",
    action_verify_lic_desc: "Check ISI / CML validity",
    action_compare_std: "Compare Standards",
    action_compare_std_desc: "Side-by-side clause breakdown",

    // Dashboard Sections
    top_standards_heading: "Frequently Accessed Standards",
    announcements_heading: "Recent Regulatory Gazette Updates",
    view_all_standards: "View All Standards",
    recent_updates: "Recent Gazette Updates",

    // Chat Interface
    chat_title: "How can I help you with BIS compliance today?",
    chat_subtitle: "Trusted. Accurate. BIS Knowledge at Your Fingertips.",
    ask_placeholder: "Ask anything about BIS standards, certification, test clauses...",
    ask_placeholder_hi: "भारतीय मानकों (BIS), ISI मार्क, या नियमों के बारे में पूछें...",
    popular_questions: "Popular Questions",
    disclaimer: "AI responses are based on official BIS data and publications.",
    press_enter: "Press Enter to send • Shift + Enter for new line",

    // Prompts
    prompt_product_mapping: "Product & Standard Mapping",
    prompt_safety_testing: "Safety & Test Requirements",
    prompt_local_language: "Hindi / Local Language",
    prompt_comparison: "Standards Comparison",
    prompt_toy_export: "Toy Export Certification",
    prompt_gold_huid: "Gold Hallmarking & HUID",

    // General Actions
    quick_verify: "Verify CML License",
    start_compliance: "Start Compliance Journey",
    upload_test_report: "Upload & Analyze Test Report",
    search_standards: "Search Indian Standards...",
    view_details: "View Details",
    confidence_score: "AI Grounding Confidence",
    compliance_score: "Compliance Readiness",
    evidence_found: "Statutory Citations",
    recommended_action: "Recommended Next Step"
  },
  hi: {
    // Navigation & Global
    home: "होम",
    standards: "मानक पुस्तकालय",
    compliance: "अनुपालन नेविगेटर",
    documents: "दस्तावेज़ विश्लेषक",
    verification: "ISI / CML सत्यापन",
    assistant: "एआई सहायक",
    compare: "मानकों की तुलना",
    notifications: "सूचनाएं",
    admin_portal: "व्यवस्थापक पोर्टल",
    official_portal: "बीआईएस सहायक V2",
    portal_subtitle: "एआई-संचालित बीआईएस अनुपालन नेविगेटर और मानक निर्णय मंच",
    standards_guide: "मानक राष्ट्र का मार्गदर्शन करते हैं",
    standards_tagline: "सही मानक, सुरक्षित भारत",

    // Home Dashboard Hero
    welcome_title: "बीआईएस सहायक में आपका स्वागत है",
    hero_headline: "समझें। अनुपालन करें। आगे बढ़ें।",
    hero_subheadline: "बीआईएस मानकों, अनुपालन मार्गदर्शन और साक्ष्य-आधारित सिफारिशों के लिए आपका एआई सहायक।",
    search_placeholder: "अपने उत्पाद, आवश्यकता का वर्णन करें या बीआईएस प्रश्न पूछें...",
    ask_ai: "एआई से पूछें",
    example_label: "उदाहरण:",
    example_text: "मैं बच्चों के लिए स्टेनलेस स्टील की पानी की बोतलें बनाता हूँ।",

    // Action Cards
    action_find_std: "लागू मानक खोजें",
    action_find_std_desc: "प्रासंगिक बीआईएस मानकों की खोज करें",
    action_check_comp: "अनुपालन जांचें",
    action_check_comp_desc: "अपनी तत्परता का मूल्यांकन करें",
    action_analyze_docs: "दस्तावेज़ विश्लेषण",
    action_analyze_docs_desc: "परीक्षण रिपोर्ट और अंतर की जांच करें",
    action_verify_lic: "लाइसेंस सत्यापित करें",
    action_verify_lic_desc: "प्रमाणिक ISI और CML मार्क सत्यापित करें",
    action_compare_std: "मानकों की तुलना करें",
    action_compare_std_desc: "खंड-दर-खंड तुलना",

    // Dashboard Sections
    top_standards_heading: "अक्सर उपयोग किए जाने वाले मानक",
    announcements_heading: "नवीनतम विनियामक राजपत्र अपडेट",
    view_all_standards: "सभी मानक देखें",
    recent_updates: "हालिया राजपत्र अपडेट",

    // Chat Interface
    chat_title: "आज मैं बीआईएस अनुपालन में आपकी क्या मदद कर सकता हूँ?",
    chat_subtitle: "विश्वसनीय। सटीक। आपकी उंगलियों पर बीआईएस ज्ञान।",
    ask_placeholder: "भारतीय मानकों (BIS), ISI मार्क, या नियमों के बारे में पूछें...",
    ask_placeholder_hi: "भारतीय मानकों (BIS), ISI मार्क, या नियमों के बारे में पूछें...",
    popular_questions: "लोकप्रिय प्रश्न",
    disclaimer: "एआई उत्तर आधिकारिक बीआईएस डेटा और प्रकाशनों पर आधारित हैं।",
    press_enter: "भेजने के लिए Enter दबाएं • नई पंक्ति के लिए Shift + Enter",

    // Prompts
    prompt_product_mapping: "उत्पाद एवं मानक मैपिंग",
    prompt_safety_testing: "सुरक्षा एवं परीक्षण आवश्यकताएं",
    prompt_local_language: "हिंदी / स्थानीय भाषा",
    prompt_comparison: "मानकों की तुलना",
    prompt_toy_export: "खिलौना निर्यात प्रमाणीकरण",
    prompt_gold_huid: "स्वर्ण हॉलमार्किंग और HUID",

    // General Actions
    quick_verify: "लाइसेंस सत्यापित करें",
    start_compliance: "अनुपालन यात्रा शुरू करें",
    upload_test_report: "परीक्षण रिपोर्ट जांचें",
    search_standards: "भारतीय मानक खोजें...",
    view_details: "विवरण देखें",
    confidence_score: "एआई ग्राउंडिंग सटीकता",
    compliance_score: "अनुपालन तत्परता",
    evidence_found: "वैधानिक संदर्भ",
    recommended_action: "अनुशंसित अगला कदम"
  },
  ta: {
    // Navigation & Global
    home: "முகப்பு",
    standards: "தரநிலைகள்",
    compliance: "இணக்கம்",
    documents: "ஆவணங்கள்",
    verification: "சரிபார்ப்பு",
    assistant: "AI உதவியாளர்",
    compare: "ஒப்பீடு",
    notifications: "அறிவிப்புகள்",
    admin_portal: "நிர்வாகி தளம்",
    official_portal: "பிஐஎஸ் சகாயக் V2",
    portal_subtitle: "AI இயங்கும் BIS இணக்க வழிகாட்டி மற்றும் தரநிலைகள் தளம்",
    standards_guide: "தரநிலைகள் தேசத்தை வழிநடத்துகின்றன",
    standards_tagline: "சரியான தரநிலைகள், பாதுகாப்பான இந்தியா",

    // Home Dashboard Hero
    welcome_title: "BIS சகாயக்கிற்கு நல்வரவு",
    hero_headline: "புரிந்து கொள்ளுங்கள். இணங்குங்கள். வளருங்கள்.",
    hero_subheadline: "BIS தரநிலைகள் மற்றும் இணக்க வழிகாட்டுதலுக்கான உங்கள் AI உதவியாளர்.",
    search_placeholder: "உங்கள் தயாரிப்பை விவரிக்கவும் அல்லது BIS கேள்வியைக் கேட்கவும்...",
    ask_ai: "AI இடம் கேளுங்கள்",
    example_label: "உதாரணம்:",
    example_text: "நான் குழந்தைகளுக்கான துருப்பிடிக்காத எஃகு தண்ணீர் பாட்டில்களை உற்பத்தி செய்கிறேன்.",

    // Action Cards
    action_find_std: "பொருத்தமான தரநிலையைக் கண்டறியவும்",
    action_find_std_desc: "தொடர்புடைய BIS தரநிலைகளைக் கண்டறியவும்",
    action_check_comp: "இணக்கத்தை சரிபார்க்கவும்",
    action_check_comp_desc: "உங்கள் தயார்நிலையை மதிப்பீடு செய்யுங்கள்",
    action_analyze_docs: "ஆவணங்களை பகுப்பாய்வு செய்க",
    action_analyze_docs_desc: "சோதனை அறிக்கைகளை சரிபார்க்கவும்",
    action_verify_lic: "உரிமத்தை சரிபார்க்கவும்",
    action_verify_lic_desc: "அங்கீகரிக்கப்பட்ட ISI & CML சரிபார்க்கவும்",
    action_compare_std: "தரநிலைகளை ஒப்பிடுக",
    action_compare_std_desc: "பிரிவு வாரியாக ஒப்பீடு",

    top_standards_heading: "அடிக்கடி பார்க்கப்படும் தரநிலைகள்",
    announcements_heading: "சமீபத்திய ஒழுங்குமுறை அறிவிப்புகள்",
    view_all_standards: "அனைத்து தரநிலைகளையும் காண்க",
    recent_updates: "சமீபத்திய அறிவிப்புகள்",

    chat_title: "இன்று BIS இணக்கத்தில் நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    chat_subtitle: "நம்பகமான. துல்லியமான. உங்கள் விரல் நுனியில் BIS அறிவு.",
    ask_placeholder: "BIS தரநிலைகள், சான்றிதழ், சோதனை விதிகள் பற்றி கேட்கவும்...",
    popular_questions: "பிரபலமான கேள்விகள்",
    disclaimer: "AI பதில்கள் அதிகாரப்பூர்வ BIS தரவுகளை அடிப்படையாகக் கொண்டவை.",
    press_enter: "அனுப்ப Enter அழுத்தவும் • புதிய வரிக்கு Shift + Enter"
  },
  te: {
    home: "హోమ్",
    standards: "ప్రమాణాలు",
    compliance: "సమ్మతి",
    documents: "పత్రాలు",
    verification: "ధృవీకరణ",
    assistant: "AI అసిస్టెంట్",
    compare: "పోలిక",
    notifications: "నోటిఫికేషన్లు",
    admin_portal: "అడ్మిన్ పోర్టల్",
    official_portal: "బిఐఎస్ సహాయక్ V2",
    portal_subtitle: "AI-ఆధారిత BIS సమ్మతి నావిగేటర్",
    standards_guide: "ప్రమాణాలు దేశానికి మార్గదర్శనం చేస్తాయి",
    standards_tagline: "సరైన ప్రమాణాలు, సురక్షిత భారతదేశం",

    welcome_title: "BIS సహాయక్ కు స్వాగతం",
    hero_headline: "అర్థం చేసుకోండి. పాటించండి. వృద్ధి చెందండి.",
    hero_subheadline: "BIS ప్రమాణాలు మరియు సమ్మతి మార్గదర్శకత్వం కోసం మీ AI అసిస్టెంట్.",
    search_placeholder: "మీ ఉత్పత్తిని వివరించండి లేదా BIS ప్రశ్నను అడగండి...",
    ask_ai: "AI ని అడగండి",
    example_label: "ఉదాహరణ:",
    example_text: "నేను పిల్లల కోసం స్టెయిన్‌లెస్ స్టీల్ నీటి సీసాలను తయారు చేస్తాను.",

    action_find_std: "వర్తించే ప్రమాణాన్ని కనుగొనండి",
    action_find_std_desc: "సంబంధిత BIS ప్రమాణాలను కనుగొనండి",
    action_check_comp: "సమ్మతిని తనిఖీ చేయండి",
    action_check_comp_desc: "మీ సంసిద్ధతను అంచనా వేయండి",
    action_analyze_docs: "పత్రాలను విశ్లేషించండి",
    action_analyze_docs_desc: "పరీక్ష నివేదికలను తనిఖీ చేయండి",
    action_verify_lic: "లైసెన్స్‌ను ధృవీకరించండి",
    action_verify_lic_desc: "ISI & CML ధృవీకరణ",
    action_compare_std: "ప్రమాణాలను పోల్చండి",
    action_compare_std_desc: "నిబంధనల వారీగా పోలిక",

    top_standards_heading: "తరచుగా ఉపయోగించే ప్రమాణాలు",
    announcements_heading: "ఇటీవలి నిబంధనల నవీకరణలు",
    view_all_standards: "అన్ని ప్రమాణాలను వీక్షించండి",
    recent_updates: "ఇటీవలి నవీకరణలు",

    chat_title: "ఈరోజు BIS సమ్మతిలో నేను మీకు ఎలా సహాయపడగలను?",
    chat_subtitle: "విశ్వసనీయమైనది. ఖచ్చితమైనది. మీ చేతివేళ్ల వద్ద BIS సమాచారం.",
    ask_placeholder: "BIS ప్రమాణాలు, ధృవీకరణ, పరీక్ష నిబంధనల గురించి అడగండి...",
    popular_questions: "ప్రసిద్ధ ప్రశ్నలు",
    disclaimer: "AI సమాధానాలు అధికారిక BIS డేటా ఆధారంగా ఉంటాయి.",
    press_enter: "పంపడానికి Enter నొక్కండి • కొత్త లైన్ కోసం Shift + Enter"
  },
  kn: {
    home: "ಮುಖಪುಟ",
    standards: "ಮಾನದಂಡಗಳು",
    compliance: "ಅನುಸರಣೆ",
    documents: "ದಾಖಲೆಗಳು",
    verification: "ಪರಿಶೀಲನೆ",
    assistant: "AI ಸಹಾಯಕ",
    compare: "ಹೋಲಿಕೆ",
    notifications: "ಅಧಿಸೂಚನೆಗಳು",
    admin_portal: "ನಿರ್ವಾಹಕ ಪೋರ್ಟಲ್",
    official_portal: "ಬಿಐಎಸ್ ಸಹಾಯಕ V2",
    portal_subtitle: "AI-ಚಾಲಿತ BIS ಅನುಸರಣೆ ನ್ಯಾವಿಗೇಟರ್ ಮತ್ತು ಮಾನದಂಡಗಳ ನಿರ್ಧಾರ ವೇದಿಕೆ",
    standards_guide: "ಮಾನದಂಡಗಳು ರಾಷ್ಟ್ರಕ್ಕೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತವೆ",
    standards_tagline: "ಸರಿಯಾದ ಮಾನದಂಡ, ಸುರಕ್ಷಿತ ಭಾರತ",

    welcome_title: "BIS ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ",
    hero_headline: "ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಅನುಸರಿಸಿ. ಬೆಳೆಯಿರಿ.",
    hero_subheadline: "BIS ಮಾನದಂಡಗಳು, ಅನುಸರಣಾ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸಾಕ್ಷ್ಯ-ಆಧಾರಿತ ಶಿಫಾರಸುಗಳಿಗಾಗಿ ನಿಮ್ಮ AI ಸಹಾಯಕ.",
    search_placeholder: "ನಿಮ್ಮ ಉತ್ಪನ್ನ, ಅಗತ್ಯವನ್ನು ವಿವರಿಸಿ ಅಥವಾ BIS ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...",
    ask_ai: "AI ಗೆ ಕೇಳಿ",
    example_label: "ಉದಾಹರಣೆ:",
    example_text: "ನಾನು ಮಕ್ಕಳಿಗಾಗಿ ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್ ನೀರಿನ ಬಾಟಲಿಗಳನ್ನು ತಯಾರಿಸುತ್ತೇನೆ.",

    action_find_std: "ಅನ್ವಯವಾಗುವ ಮಾನದಂಡವನ್ನು ಹುಡುಕಿ",
    action_find_std_desc: "ಸಂಬಂಧಿತ BIS ಮಾನದಂಡಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    action_check_comp: "ಅನುಸರಣೆ ಪರಿಶೀಲಿಸಿ",
    action_check_comp_desc: "ನಿಮ್ಮ ಸಿದ್ಧತೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ",
    action_analyze_docs: "ದಾಖಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    action_analyze_docs_desc: "ಪರೀಕ್ಷಾ ವರದಿಗಳು ಮತ್ತು ಅಂತರವನ್ನು ಪರಿಶೀಲಿಸಿ",
    action_verify_lic: "ಪರವಾನಗಿ ಪರಿಶೀಲಿಸಿ",
    action_verify_lic_desc: "ISI / CML ಮಾನ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
    action_compare_std: "ಮಾನದಂಡಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ",
    action_compare_std_desc: "ವಿಧಿ ಪ್ರಕಾರ ವಿವರವಾದ ಹೋಲಿಕೆ",

    top_standards_heading: "ಹೆಚ್ಚು ಬಳಸಲಾಗುವ ಮಾನದಂಡಗಳು",
    announcements_heading: "ಇತ್ತೀಚಿನ ನಿಯಂತ್ರಕ ನವೀಕರಣಗಳು",
    view_all_standards: "ಎಲ್ಲಾ ಮಾನದಂಡಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    recent_updates: "ಇತ್ತೀಚಿನ ಗೆಜೆಟ್ ನವೀಕರಣಗಳು",

    chat_title: "ಇಂದು BIS ಅನುಸರಣೆಯಲ್ಲಿ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    chat_subtitle: "ವಿಶ್ವಾಸಾರ್ಹ. ನಿಖರ. ನಿಮ್ಮ ಬೆರಳ ತುದಿಯಲ್ಲಿ BIS ಜ್ಞಾನ.",
    ask_placeholder: "BIS ಮಾನದಂಡಗಳು, ಪ್ರಮಾಣೀಕರಣ, ಪರೀಕ್ಷಾ ನಿಯಮಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
    popular_questions: "ಜನಪ್ರಿಯ ಪ್ರಶ್ನೆಗಳು",
    disclaimer: "AI ಉತ್ತರಗಳು ಅಧಿಕೃತ BIS ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಡೇಟಾವನ್ನು ಆಧರಿಸಿವೆ.",
    press_enter: "ಕಳುಹಿಸಲು Enter ಒತ್ತಿರಿ • ಹೊಸ ಸಾಲಿಗೆ Shift + Enter",

    quick_verify: "CML ಪರವಾನಗಿ ಪರಿಶೀಲಿಸಿ",
    start_compliance: "ಅನುಸರಣೆ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
    upload_test_report: "ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    search_standards: "ಭಾರತೀಯ ಮಾನದಂಡಗಳನ್ನು ಹುಡುಕಿ...",
    view_details: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    confidence_score: "AI ಗ್ರೌಂಡಿಂಗ್ ನಿಖರತೆ",
    compliance_score: "ಅನುಸರಣೆ ಸಿದ್ಧತೆ",
    evidence_found: "ಶಾಸನಬದ್ಧ ಉಲ್ಲೇಖಗಳು",
    recommended_action: "ಶಿಫಾರಸು ಮಾಡಿದ ಮುಂದಿನ ಹೆಜ್ಜೆ"
  },
  ur: {
    home: "ہوم",
    standards: "معیارات لائبریری",
    compliance: "تعمیل نیویگیٹر",
    documents: "دستاویزات کا تجزیہ",
    verification: "آئی ایس آئی / سی ایم ایل تصدیق",
    assistant: "اے آئی معاون",
    compare: "معیارات کا موازنہ",
    notifications: "نوٹیفیکیشنز",
    admin_portal: "ایڈمن پورٹل",
    official_portal: "بی آئی ایس معاون V2",
    portal_subtitle: "اے آئی سے چلنے والا بی آئی ایس تعمیل نیویگیٹر اور فیصلے کا پلیٹ فارم",
    standards_guide: "معیارات قوم کی رہنمائی کرتے ہیں",
    standards_tagline: "صحیح معیار، محفوظ بھارت",

    welcome_title: "بی آئی ایس معاون میں خوش آمدید",
    hero_headline: "سمجھیں۔ عمل کریں۔ ترقی کریں۔",
    hero_subheadline: "بی آئی ایس معیارات، تعمیل کی رہنمائی اور ثبوت پر مبنی تجاویز کے لیے آپ کا اے آئی معاون۔",
    search_placeholder: "اپنی مصنوعات، ضرورت بیان کریں یا بی آئی ایس سے متعلق سوال پوچھیں...",
    ask_ai: "اے آئی سے پوچھیں",
    example_label: "مثال:",
    example_text: "میں بچوں کے لیے سٹینلیس سٹیل کی پانی کی بوتلیں بناتا ہوں۔",

    action_find_std: "لاگو ہونے والا معیار تلاش کریں",
    action_find_std_desc: "متعلقہ بی آئی ایس معیارات دریافت کریں",
    action_check_comp: "تعمیل چیک کریں",
    action_check_comp_desc: "اپنی تیاری کا اندازہ لگائیں",
    action_analyze_docs: "دستاویزات کا تجزیہ کریں",
    action_analyze_docs_desc: "ٹیسٹ رپورٹس کی تصدیق اور خامیوں کی جانچ",
    action_verify_lic: "لائسنس کی تصدیق کریں",
    action_verify_lic_desc: "آئی ایس آئی / سی ایم ایل کی قانونی حیثیت چیک کریں",
    action_compare_std: "معیارات کا موازنہ کریں",
    action_compare_std_desc: "شق وار تفصیلی موازنہ",

    top_standards_heading: "کثرت سے دیکھے جانے والے معیارات",
    announcements_heading: "حالیہ ریگولیٹری گزٹ اپڈیٹس",
    view_all_standards: "تمام معیارات دیکھیں",
    recent_updates: "حالیہ گزٹ اپڈیٹس",

    chat_title: "آج بی آئی ایس تعمیل میں میں آپ کی کیا مدد کر سکتا ہوں؟",
    chat_subtitle: "قابل اعتماد۔ درست۔ بی آئی ایس معلومات آپ کی انگلیوں پر۔",
    ask_placeholder: "بی آئی ایس معیارات، سرٹیفیکیشن، ٹیسٹ شقوں کے بارے میں پوچھیں...",
    popular_questions: "مشہور سوالات",
    disclaimer: "اے آئی کے جوابات سرکاری بی آئی ایس ڈیٹا پر مبنی ہیں۔",
    press_enter: "بھیجنے کے لیے Enter دبائیں • نئی لائن کے لیے Shift + Enter",

    quick_verify: "سی ایم ایل لائسنس کی تصدیق",
    start_compliance: "تعمیل کا سفر شروع کریں",
    upload_test_report: "ٹیسٹ رپورٹ اپ لوڈ اور تجزیہ کریں",
    search_standards: "ہندوستانی معیارات تلاش کریں...",
    view_details: "تفصیلات دیکھیں",
    confidence_score: "اے آئی درستی سکور",
    compliance_score: "تعمیل کی تیاری",
    evidence_found: "قانونی حوالے",
    recommended_action: "تجویز کردہ اگلا اقدام"
  }
};

/**
 * Returns localized string for the specified key and language.
 * Falls back to English if key or language is missing.
 */
export function getTranslation(key, lang = 'en') {
  const effectiveLang = (!lang || lang === 'auto') ? 'en' : lang;
  const langDict = UI_TRANSLATIONS[effectiveLang] || UI_TRANSLATIONS['en'];
  return langDict[key] || UI_TRANSLATIONS['en'][key] || key;
}

// In-memory cache for dynamic Bhashini translations
const translationCache = new Map();

/**
 * Dynamically translates text using the Bhashini API with client-side caching.
 */
export async function translateDynamic(text, targetLang = 'en') {
  if (!text || !targetLang || targetLang === 'en' || targetLang === 'auto') {
    return text;
  }
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const translated = await translateText({
      text,
      source_language: 'en',
      target_language: targetLang
    });
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.warn("[Bhashini Dynamic] Translation error:", err);
    return text;
  }
}
