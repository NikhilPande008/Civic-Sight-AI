export interface UIStrings {
  appName: string;
  appTagline: string;
  resetSeeds: string;
  geminiActive: string;
  triageStation: string;
  launchReport: string;
  welcomeTitle: string;
  welcomeText: string;
  step1Label: string;
  removePhoto: string;
  realVisionActive: string;
  demoActiveBadge: string;
  demoActiveText: string;
  switchToRealPhoto: string;
  dragDropText: string;
  geminiFlashText: string;
  chooseFile: string;
  step2Label: string;
  coordinatesActive: string;
  mapUnavailableHeader: string;
  mapUnavailableText: string;
  relocate: string;
  pinnedAddress: string;
  fetchingAddress: string;
  attachLocation: string;
  step3Label: string;
  step3Placeholder: string;
  step4Label: string;
  submitButton: string;
  orChoosePreset: string;
  sandboxSamplesTitle: string;
  sandboxSamplesText: string;
  guideHeader: string;
  guideWelcome: string;
  guideStep1Title: string;
  guideStep1Desc: string;
  guideStep2Title: string;
  guideStep2Desc: string;
  guideStep3Title: string;
  guideStep3Desc: string;
  guideFooterLandmarks: string;
  guideFooterSupport: string;
  triageCompleted: string;
  triageCompletedDesc: string;
  assignedUnit: string;
  generalWardOffice: string;
  severityScore: string;
  classification: string;
  issueCategory: string;
  other: string;
  officialCitizenComm: string;
  fileAnotherReport: string;
  reportsRegistry: string;
  filterAll: string;
  filterActive: string;
  filterResolved: string;
  noReportsFoundTitle: string;
  noReportsFoundText: string;
  originalDesc: string;
  detailedTriage: string;
  submittedAt: string;
  markResolved: string;
  fallbackActiveHeader: string;
  fallbackActiveText: string;
  originalCapture: string;
  citizenRequestProfile: string;
  locationDesc: string;
  languageLabel: string;
  triageResolution: string;
  issueClassification: string;
  geocodedMatch: string;
  pendingEvaluation: string;
  duplicateDetectedTitle: string;
  duplicateDetectedText: string;
  communityConsensus: string;
  corroborationSingular: string;
  corroborationPlural: string;
  escalatedToHumanTitle: string;
  escalatedReason: string;
  escalatedQueueBadge: string;
  severityGrade: string;
  assignedDepartment: string;
  notAssigned: string;
  citizenProgressNotification: string;
  developerTools: string;
  hideTechnicalLogs: string;
  showTechnicalLogs: string;
  operationsCount: string;
  operationsExecuted: string;
  devLogsHeader: string;
  inputsParameters: string;
  resultOutput: string;
  agentReasoningHeader: string;
  whyAssessment: string;
  footerText: string;
  footerPort: string;
  toastPhotoError: string;
  toastResetConfirm: string;
  toastFallbackWarning: string;
  toastTimeout: string;
  toastReachFailed: string;
  toastSessionFailed: string;
  loadingProgressTitle: string;
  acquiringCoordinates: string;
  processingLiveSignals: string;
  municipalTriageCenter: string;

  // Agent Steps translations
  step_init_title: string;
  step_init_running_desc: string;
  step_init_completed_desc: string;
  step_analyze_title: string;
  step_analyze_running_desc: string;
  step_analyze_completed_desc: string;
  step_geocode_title: string;
  step_geocode_running_desc: string;
  step_geocode_completed_desc: string;
  step_duplicate_title: string;
  step_duplicate_running_desc: string;
  step_duplicate_completed_no_dup: string;
  step_duplicate_completed_dup: string;
  step_route_title: string;
  step_route_running_desc: string;
  step_route_completed_desc: string;
  step_draft_title: string;
  step_draft_running_desc: string;
  step_draft_completed_desc: string;
  step_escalate_title: string;
  step_escalate_running_desc: string;
  step_escalate_completed_desc: string;
  step_fallback_title: string;
  step_fallback_desc: string;
  step_validate_title: string;
  step_validate_running_desc: string;
  step_validate_completed_desc: string;
  step_default_title: string;
  step_default_running_desc: string;
  step_default_completed_desc: string;
  retryBusyNotice: string;
  duplicateDetectedNotice: string;
  filterNeedsReview: string;
  statTotalOpen: string;
  statResolved: string;
  statNeedsReview: string;
  statTopDept: string;
  statHotspot: string;
  noHotspots: string;
  hotspotAlert: string;
  trackYourReportTab: string;
  fileReportTab: string;
  trackPlaceholder: string;
  trackButton: string;
  trackStatusHeading: string;
  trackNoIdError: string;
  trackNotFoundError: string;
  trackCorroborations: string;
  trackEstResolution: string;
  trackBtnBack: string;
  trackBtnTrackThis: string;
  trackCopySuccess: string;
  trackBtnCopy: string;
  trackStageReported: string;
  trackStageAcknowledged: string;
  trackStageInProgress: string;
  trackStageResolved: string;
  photoQualityLabel: string;
  photoQualityGood: string;
  photoQualityWarning: string;
  retakeButton: string;
  continueAnywayButton: string;
  photoQualityChecking: string;
  photoBlurryReason: string;
  photoDarkReason: string;
  photoLowResReason: string;
}

export const translations: Record<string, UIStrings> = {
  en: {
    appName: "CivicSight AI",
    appTagline: "Autonomous Multi-Agent Civic Triage Engine",
    resetSeeds: "Reset Seeds",
    geminiActive: "AI Triage: Active",
    triageStation: "Triage Station",
    launchReport: "Launch Citizen Report",
    welcomeTitle: "First-time visitor?",
    welcomeText: "Click any of the Sandbox Fallback Samples at the bottom of this form to instantly auto-fill a sample civic issue and see the AI agent run its real-time triage in seconds!",
    step1Label: "Step 1: Upload Real Civic Issue Photo",
    removePhoto: "Remove Photo",
    realVisionActive: "REAL VISION API ACTIVE",
    demoActiveBadge: "🧪 Sample Mode (Demo)",
    demoActiveText: "Bypasses live camera analyzer. Returns pre-cached mock triage attributes.",
    switchToRealPhoto: "Switch to Real Photo Upload",
    dragDropText: "Drag & drop or click to upload a photo",
    geminiFlashText: "Uses gemini-3.5-flash for real-time visual assessment",
    chooseFile: "Choose File",
    step2Label: "Step 2: Pin Exact Location on Map",
    coordinatesActive: "Location Pinned",
    mapUnavailableHeader: "Map Pinning Unavailable",
    mapUnavailableText: "Interactive map pinning is offline because a Google Maps API key is missing on this preview. Please specify your landmark description below to allow natural language geocoding.",
    relocate: "Re-locate",
    pinnedAddress: "Pinned Address",
    fetchingAddress: "Fetching pinned address details...",
    attachLocation: "Attach this pinned exact location to the report",
    step3Label: "Step 3: Landmark / Location Description",
    step3Placeholder: "e.g. Near Shivaji Chowk, FC Road, or opposite the bus depot",
    step4Label: "Step 4: Citizen's Communication Language",
    submitButton: "Submit Civic Issue Report",
    orChoosePreset: "OR CHOOSE A SANDBOX DEMO PRESET",
    sandboxSamplesTitle: "🧪 Sandbox Fallback Samples",
    sandboxSamplesText: "Bypasses Gemini Vision to quickly test agent routing behaviors, such as translations, duplicates, or human review queues.",
    guideHeader: "How This Citizen Portal Works",
    guideWelcome: "Welcome! This intelligent civic portal uses advanced AI to process citizen reports, identify issues, and automatically alert the right local authority.",
    guideStep1Title: "Submit Your Report",
    guideStep1Desc: "Describe the issue and upload a photo. You can describe locations using nearby landmarks and area names naturally (e.g., \"near Shivaji Chowk\" or \"opposite Shivaji Park playground\").",
    guideStep2Title: "Smart AI Verification",
    guideStep2Desc: "Our AI automatically analyzes the photo, converts your landmark description into geographic coordinates, and scans nearby active reports for duplicates.",
    guideStep3Title: "Instant Routing & Native Updates",
    guideStep3Desc: "Once verified, the report is instantly assigned to the responsible Indian department (like PWD, Solid Waste Management, etc.), and a polite update is drafted in your chosen native language.",
    guideFooterLandmarks: "📍 Geocoding tuned for landmarks across India",
    guideFooterSupport: "🇮🇳 Pan-India Support",
    triageCompleted: "Triage Process Completed",
    triageCompletedDesc: "Your report has been successfully verified, categorized, and forwarded to the municipal corporation.",
    assignedUnit: "Assigned Unit",
    generalWardOffice: "General Ward Office",
    severityScore: "Severity Score",
    classification: "Classification",
    issueCategory: "Issue Category",
    other: "Other",
    officialCitizenComm: "Official Citizen Communication",
    fileAnotherReport: "File Another Citizen Report",
    reportsRegistry: "Reports Registry ({count})",
    filterAll: "All",
    filterActive: "Active",
    filterResolved: "Resolved",
    noReportsFoundTitle: "No reports found matching selection",
    noReportsFoundText: "Select a preset and submit a report to populate this register.",
    originalDesc: "Original desc:",
    detailedTriage: "Detailed Triage Analysis",
    submittedAt: "Submitted at {time}",
    markResolved: "Mark Resolved",
    fallbackActiveHeader: "Intelligent Fallback Active (AI Quota Limit Exceeded)",
    fallbackActiveText: "The public Gemini API has reached its free tier rate limit. The citizen portal automatically switched to its built-in local autonomous heuristics engine to successfully process and register your report without delay.",
    originalCapture: "Original Capture",
    citizenRequestProfile: "Citizen Request Profile",
    locationDesc: "Location Desc:",
    languageLabel: "Language:",
    triageResolution: "Triage Resolution",
    issueClassification: "Issue Classification",
    geocodedMatch: "Geocoded Match",
    pendingEvaluation: "Pending evaluation",
    duplicateDetectedTitle: "Duplicate Issue Detected",
    duplicateDetectedText: "This issue was flagged as duplicate of report {duplicateOf} which lies within 150 meters. The agent skipped new creation to prevent department backlog.",
    communityConsensus: "Community Consensus",
    corroborationSingular: "Corroborated by 1 citizen",
    corroborationPlural: "Corroborated by {count} citizens",
    escalatedToHumanTitle: "Escalated to Human Review",
    escalatedReason: "Reason:",
    escalatedQueueBadge: "Queue: Municipal Triage Escalation Queue",
    severityGrade: "Severity Grade",
    assignedDepartment: "Assigned Department",
    notAssigned: "Not Assigned",
    citizenProgressNotification: "Citizen Progress Notification ({language})",
    developerTools: "Developer Tools",
    hideTechnicalLogs: "Hide Technical AI Logs",
    showTechnicalLogs: "Show Technical AI Logs",
    operationsCount: "{count} operations",
    operationsExecuted: "{count} Operations executed",
    devLogsHeader: "Autonomous Multi-Agent Triage Execution Logs",
    inputsParameters: "Inputs / Parameters",
    resultOutput: "Result / Output",
    agentReasoningHeader: "Agent Reasoning & Findings (Cohesive Summary)",
    whyAssessment: "Why this assessment?",
    footerText: "CivicSight AI • Powered by Google Gemini 3.5",
    footerPort: "System Status: Online & Secure",
    toastPhotoError: "Please upload a real photo or choose a Demo Sample Preset below.",
    toastResetConfirm: "Are you sure you want to reset the reports database to default seeds?",
    toastFallbackWarning: "AI system is temporarily saturated. Initiating intelligent local fallback triage...",
    toastTimeout: "Triage request timed out due to inactivity. Please retry.",
    toastReachFailed: "Failed to reach server. Please try again.",
    toastSessionFailed: "Triage session failed.",
    loadingProgressTitle: "Our automated system is verifying your report, determining coordinates, and checking for duplicates:",
    acquiringCoordinates: "Acquiring current coordinates...",
    processingLiveSignals: "Checking nearby reports...",
    municipalTriageCenter: "Municipal Triage Center",

    // Agent Steps translations
    step_init_title: "Connecting to municipal reporting portal",
    step_init_running_desc: "Connecting to reporting system and loading template...",
    step_init_completed_desc: "Connected. Ready to file your report.",
    step_analyze_title: "Analyzing report photograph",
    step_analyze_running_desc: "Scanning photograph to assess issue category and severity...",
    step_analyze_completed_desc: "Analysing your photo... found a {issue_type} ({confidence}% confidence)",
    step_geocode_title: "Resolving report location",
    step_geocode_running_desc: "Searching city maps and landmark references to pin coordinates...",
    step_geocode_completed_desc: "Pinpointed the location on {formatted_address}",
    step_duplicate_title: "Checking for duplicate reports",
    step_duplicate_running_desc: "Checking if this has already been reported nearby...",
    step_duplicate_completed_no_dup: "No duplicate reports found. This is a new issue.",
    step_duplicate_completed_dup: "This matches an existing report {distance}m away — adding your support (now supported by {corroborations} citizens).",
    step_route_title: "Determining priority level and assigning department",
    step_route_running_desc: "Evaluating safety risk and assigning the correct maintenance team...",
    step_route_completed_desc: "Assigned to {assigned_department} with a priority score of {severity_score}/100",
    step_draft_title: "Writing confirmation message",
    step_draft_running_desc: "Drafting helpful confirmation message with next steps for your records...",
    step_draft_completed_desc: "Confirmation update created in {language}",
    step_escalate_title: "Sending for official review",
    step_escalate_running_desc: "Forwarding report details to senior municipal staff...",
    step_escalate_completed_desc: "Referred to ward supervisor: {reason}",
    step_fallback_title: "Using standard backup system",
    step_fallback_desc: "Processing continues using backup system to avoid delays.",
    step_validate_title: "Verifying report details",
    step_validate_running_desc: "Verifying if the photo shows a real civic problem and matches your description...",
    step_validate_completed_desc: "Verification complete: {status_text}",
    step_default_title: "Processing: {name}",
    step_default_running_desc: "Analyzing criteria...",
    step_default_completed_desc: "Successfully evaluated.",
    retryBusyNotice: "The AI service is busy — retrying (attempt {attempt})...",
    duplicateDetectedNotice: "Duplicate Request Detected. Linked Directly.",
    filterNeedsReview: "Needs Review",
    statTotalOpen: "Total Open",
    statResolved: "Resolved",
    statNeedsReview: "Needs Review",
    statTopDept: "Top Department",
    statHotspot: "Civic Hotspot",
    noHotspots: "No active hotspots detected",
    hotspotAlert: "{count} reports near {location}",
    trackYourReportTab: "Track Your Report",
    fileReportTab: "File a Report",
    trackPlaceholder: "Enter Report ID (e.g., rep_xxxxxxxxx)",
    trackButton: "Track Status",
    trackStatusHeading: "Track Citizen Report Status",
    trackNoIdError: "Please enter a valid Report ID first.",
    trackNotFoundError: "Report ID not found. Please verify the ID and try again.",
    trackCorroborations: "Corroborated by {count} citizens",
    trackEstResolution: "Typically resolved in {days} days for {department} department.",
    trackBtnBack: "Back to Reporting",
    trackBtnTrackThis: "Track this report",
    trackCopySuccess: "Report ID copied!",
    trackBtnCopy: "Copy ID",
    trackStageReported: "Reported",
    trackStageAcknowledged: "Acknowledged",
    trackStageInProgress: "In Progress",
    trackStageResolved: "Resolved",
    photoQualityLabel: "Photo Quality Check",
    photoQualityGood: "Photo looks clear ✓",
    photoQualityWarning: "This photo looks {reason} — a clearer photo helps us assess the issue faster. Retake or continue anyway?",
    retakeButton: "Retake Photo",
    continueAnywayButton: "Continue with this photo",
    photoQualityChecking: "Analyzing photo quality...",
    photoBlurryReason: "blurry",
    photoDarkReason: "too dark",
    photoLowResReason: "low-resolution"
  },
  hi: {
    appName: "सिविकसाइट एआई",
    appTagline: "स्वायत्त मल्टी-एजेंट नागरिक निवारण इंजन",
    resetSeeds: "डेटा रीसेट करें",
    geminiActive: "एआई निवारण: सक्रिय",
    triageStation: "निवारण केंद्र",
    launchReport: "नागरिक रिपोर्ट दर्ज करें",
    welcomeTitle: "पहली बार आए हैं?",
    welcomeText: "इस फॉर्म के नीचे दिए गए सैंडबॉक्स डेमो नमूनों में से किसी पर भी क्लिक करें और वास्तविक समय में एआई एजेंट द्वारा की जाने वाली प्रक्रिया को देखें!",
    step1Label: "चरण 1: वास्तविक नागरिक समस्या का फोटो अपलोड करें",
    removePhoto: "फोटो हटाएं",
    realVisionActive: "रियल विज़न एपीआई सक्रिय",
    demoActiveBadge: "🧪 सैंपल मोड (डेमो)",
    demoActiveText: "लाइव कैमरा विश्लेषक को बायपास करता है और पूर्व-कैश किए गए नमूना विशेषताएँ लौटाता है।",
    switchToRealPhoto: "वास्तविक फोटो अपलोड पर जाएं",
    dragDropText: "फोटो अपलोड करने के लिए खींचें और छोड़ें या क्लिक करें",
    geminiFlashText: "वास्तविक समय के दृश्य मूल्यांकन के लिए जेमिनी 3.5 का उपयोग करता है",
    chooseFile: "फाइल चुनें",
    step2Label: "चरण 2: मानचित्र पर सटीक स्थान पिन करें",
    coordinatesActive: "स्थान पिन किया गया",
    mapUnavailableHeader: "मानचित्र पिनिंग अनुपलब्ध",
    mapUnavailableText: "इस पूर्वावलोकन में गूगल मैप्स एपीआई कुंजी गायब होने के कारण मानचित्र पिनिंग ऑफ़लाइन है। प्राकृतिक भाषा जियोकोडिंग के लिए कृपया नीचे अपना स्थान विवरण निर्दिष्ट करें।",
    relocate: "पुनः खोजें",
    pinnedAddress: "पिन किया गया पता",
    fetchingAddress: "पिन किए गए पते के विवरण प्राप्त किए जा रहे हैं...",
    attachLocation: "रिपोर्ट में इस पिन किए गए सटीक स्थान को संलग्न करें",
    step3Label: "चरण 3: लैंडमार्क / स्थान विवरण",
    step3Placeholder: "जैसे: शिवाजी चौक के पास, एफसी रोड, या बस डिपो के सामने",
    step4Label: "चरण 4: नागरिक की संचार भाषा",
    submitButton: "शिकायत सबमिट करें",
    orChoosePreset: "या सैंडबॉक्स डेमो नमूना चुनें",
    sandboxSamplesTitle: "🧪 सैंडबॉक्स डेमो नमूने",
    sandboxSamplesText: "अनुवाद, डुप्लिकेट, या मानव समीक्षा कतारों जैसे व्यवहारों का परीक्षण करने के लिए जेमिनी विज़न को बायपास करता है।",
    guideHeader: "यह नागरिक पोर्टल कैसे काम करता है",
    guideWelcome: "आपका स्वागत है! यह बुद्धिमान नागरिक पोर्टल नागरिक रिपोर्टों को संसाधित करने, समस्याओं की पहचान करने और स्वचालित रूप से संबंधित स्थानीय प्राधिकरण को सचेत करने के लिए उन्नत एआई का उपयोग करता है।",
    guideStep1Title: "अपनी रिपोर्ट दर्ज करें",
    guideStep1Desc: "समस्या का वर्णन करें और फोटो अपलोड करें। आप आस-पास के लैंडमार्क और क्षेत्र के नामों का सहजता से उपयोग कर सकते हैं (जैसे, \"शिवाजी चौक के पास\" या \"शिवाजी पार्क खेल के मैदान के सामने\")।",
    guideStep2Title: "स्मार्ट एआई सत्यापन",
    guideStep2Desc: "हमारा एआई स्वचालित रूप से फोटो का विश्लेषण करता है, आपके लैंडमार्क विवरण को भौगोलिक निर्देशांक में परिवर्तित करता है, और डुप्लिकेट के लिए आस-पास की सक्रिय रिपोर्टों को स्कैन करता है।",
    guideStep3Title: "त्वरित रूटिंग और स्थानीय भाषा अपडेट",
    guideStep3Desc: "सत्यापित होने के बाद, रिपोर्ट तुरंत विभाग को सौंप दी जाती है, और आपकी चुनी हुई भाषा में एक विनम्र अपडेट तैयार किया जाता है।",
    guideFooterLandmarks: "📍 पूरे भारत में लैंडमार्क के लिए अनुकूलित जियोकोडिंग",
    guideFooterSupport: "🇮🇳 अखिल भारतीय समर्थन",
    triageCompleted: "निवारण प्रक्रिया पूर्ण हुई",
    triageCompletedDesc: "आपकी रिपोर्ट सफलतापूर्वक सत्यापित, वर्गीकृत और नगर निगम को भेज दी गई है।",
    assignedUnit: "सौंपा गया विभाग",
    generalWardOffice: "सामान्य वार्ड कार्यालय",
    severityScore: "गंभीरता स्कोर",
    classification: "वर्गीकरण",
    issueCategory: "समस्या की श्रेणी",
    other: "अन्य",
    officialCitizenComm: "आधिकारिक नागरिक संचार",
    fileAnotherReport: "एक और नागरिक रिपोर्ट दर्ज करें",
    reportsRegistry: "रिपोर्ट्स रजिस्ट्री ({count})",
    filterAll: "सभी",
    filterActive: "सक्रिय",
    filterResolved: "समाधान",
    noReportsFoundTitle: "चयन से मेल खाने वाली कोई रिपोर्ट नहीं मिली",
    noReportsFoundText: "इस रजिस्टर को भरने के लिए एक नमूना चुनें और रिपोर्ट सबमिट करें।",
    originalDesc: "मूल विवरण:",
    detailedTriage: "विस्तृत निवारण विश्लेषण",
    submittedAt: "सबमिट किया गया: {time}",
    markResolved: "समाधान चिह्नित करें",
    fallbackActiveHeader: "इंटेलिजेंट फॉलबैक सक्रिय (एआई कोटा सीमा समाप्त)",
    fallbackActiveText: "सार्वजनिक जेमिनी एपीआई अपनी मुफ्त सीमा तक पहुंच गया है। बिना किसी देरी के आपकी रिपोर्ट को सफलतापूर्वक संसाधित करने के लिए नागरिक पोर्टल अपने अंतर्निहित स्थानीय इंजन पर चला गया है।",
    originalCapture: "मूल फोटो",
    citizenRequestProfile: "नागरिक शिकायत प्रोफ़ाइल",
    locationDesc: "स्थान का विवरण:",
    languageLabel: "भाषा:",
    triageResolution: "निवारण स्थिति",
    issueClassification: "समस्या का वर्गीकरण",
    geocodedMatch: "भौगोलिक स्थान मिलान",
    pendingEvaluation: "मूल्यांकन लंबित",
    duplicateDetectedTitle: "डुप्लिकेट समस्या पाई गई",
    duplicateDetectedText: "इस समस्या को रिपोर्ट {duplicateOf} के डुप्लिकेट के रूप में चिह्नित किया गया है जो 150 मीटर के भीतर है। बैकलॉग को रोकने के लिए नया निर्माण छोड़ दिया गया।",
    communityConsensus: "सामुदायिक सहमति",
    corroborationSingular: "1 नागरिक द्वारा समर्थित",
    corroborationPlural: "{count} नागरिकों द्वारा समर्थित",
    escalatedToHumanTitle: "मानव समीक्षा के लिए प्रेषित",
    escalatedReason: "कारण:",
    escalatedQueueBadge: "कतार: नगरपालिका निवारण वृद्धि कतार",
    severityGrade: "गंभीरता ग्रेड",
    assignedDepartment: "सौंपा गया विभाग",
    notAssigned: "सौंपा नहीं गया",
    citizenProgressNotification: "नागरिक प्रगति अधिसूचना ({language})",
    developerTools: "डेवलपर टूल्स",
    hideTechnicalLogs: "तकनीकी एआई लॉग छुपाएं",
    showTechnicalLogs: "तकनीकी एआई लॉग दिखाएं",
    operationsCount: "{count} ऑपरेशन्स",
    operationsExecuted: "{count} ऑपरेशन्स निष्पादित",
    devLogsHeader: "स्वायत्त मल्टी-एजेंट निवारण निष्पादन लॉग",
    inputsParameters: "इनपुट / पैरामीटर",
    resultOutput: "परिणाम / आउटपुट",
    agentReasoningHeader: "एजेंट तर्क और निष्कर्ष (एकजुट सारांश)",
    whyAssessment: "यह मूल्यांकन क्यों?",
    footerText: "सिविकसाइट एआई • जेमिनी 3.5 स्वायत्त फ़ंक्शन कॉलिंग क्षमता के साथ निर्मित।",
    footerPort: "फुल-स्टैक नोड.जेएस इंजन (पोर्ट 3000 इनग्रेस लागू)",
    toastPhotoError: "कृपया एक वास्तविक फोटो अपलोड करें या नीचे दिए गए डेमो सैंपल प्रेसेट में से कोई चुनें।",
    toastResetConfirm: "क्या आप वाकई रिपोर्ट डेटाबेस को रीसेट करना चाहते हैं?",
    toastFallbackWarning: "एआई सिस्टम अस्थायी रूप से व्यस्त है। स्थानीय फॉलबैक निवारण प्रक्रिया शुरू की जा रही है...",
    toastTimeout: "निष्क्रियता के कारण निवारण अनुरोध का समय समाप्त हो गया। कृपया पुनः प्रयास करें।",
    toastReachFailed: "सर्वर से संपर्क करने में विफल। कृपया पुनः प्रयास करें।",
    toastSessionFailed: "निवारण सत्र विफल रहा।",
    loadingProgressTitle: "स्वायत्त मल्टी-एजेंट निवारण प्रणाली वास्तविक समय में मूल्यांकन, जीआईएस जियोकोडिंग और डुप्लिकेट जांच कर रही है:",
    acquiringCoordinates: "वर्तमान निर्देशांक प्राप्त किए जा रहे हैं...",
    processingLiveSignals: "लाइव सिग्नलों का प्रसंस्करण जारी है...",
    municipalTriageCenter: "नगरपालिका निवारण केंद्र",
    step_init_title: "सुरक्षित नगरपालिका पोर्टल कनेक्शन स्थापित किया जा रहा है",
    step_init_running_desc: "सुरक्षित पोर्टल स्थिति को आरंभ करना और टेम्पलेट लोड करना...",
    step_init_completed_desc: "प्रणाली ऑनलाइन है। सुरक्षित निवारण केंद्र तैयार है।",
    step_analyze_title: "रिपोर्ट फोटो का विश्लेषण किया जा रहा है",
    step_analyze_running_desc: "समस्या श्रेणी और गंभीरता का आकलन करने के लिए फोटो को स्कैन किया जा रहा है...",
    step_analyze_completed_desc: "आपके फोटो का विश्लेषण किया जा रहा है... एक {issue_type} पाया गया ({confidence}% आत्मविश्वास)",
    step_geocode_title: "रिपोर्ट स्थान का समाधान किया जा रहा है",
    step_geocode_running_desc: "पिन निर्देशांकों के लिए शहर के मानचित्रों और लैंडमार्क संदर्भों की खोज की जा रही है...",
    step_geocode_completed_desc: "{formatted_address} पर सटीक स्थान का पता लगाया गया",
    step_duplicate_title: "डुप्लिकेट रिपोर्टों की जांच की जा रही है",
    step_duplicate_running_desc: "जांच की जा रही है कि क्या इस समस्या की रिपोर्ट पहले ही आस-पास की गई है...",
    step_duplicate_completed_no_dup: "कोई डुप्लिकेट रिपोर्ट नहीं मिली। यह एक नई समस्या है।",
    step_duplicate_completed_dup: "यह {distance} मीटर दूर एक मौजूदा रिपोर्ट से मेल खाता है — आपका समर्थन जोड़ा जा रहा है (अब {corroborations} नागरिक)।",
    step_route_title: "प्राथमिकता स्तर निर्धारित करना और विभाग आवंटित करना",
    step_route_running_desc: "सुरक्षा जोखिम का मूल्यांकन करना और सही रखरखाव टीम आवंटित करना...",
    step_route_completed_desc: "{assigned_department} को {severity_score}/100 के प्राथमिकता स्कोर के साथ आवंटित किया गया",
    step_draft_title: "पुष्टि संदेश लिखा जा रहा है",
    step_draft_running_desc: "आपके रिकॉर्ड के लिए अगले कदमों के साथ सहायक पुष्टि संदेश लिखा जा रहा है...",
    step_draft_completed_desc: "पुष्टि अपडेट सफलतापूर्वक {language} में तैयार किया गया",
    step_escalate_title: "आधिकारिक समीक्षा के लिए भेजा जा रहा है",
    step_escalate_running_desc: "वरिष्ठ नगरपालिका अधिकारियों को रिपोर्ट विवरण प्रेषित किया जा रहा है...",
    step_escalate_completed_desc: "वार्ड पर्यवेक्षक को संदर्भित: {reason}",
    step_fallback_title: "मानक बैकअप प्रणाली का उपयोग",
    step_fallback_desc: "देरी से बचने के लिए बैकअप प्रणाली का उपयोग करके प्रसंस्करण जारी है।",
    step_validate_title: "रिपोर्ट विवरण का सत्यापन",
    step_validate_running_desc: "सत्यापित किया जा रहा है कि क्या फोटो एक वास्तविक नागरिक समस्या को दर्शाता है और आपके विवरण से मेल खाता है...",
    step_validate_completed_desc: "सत्यापन पूरा हुआ: {status_text}",
    step_default_title: "प्रक्रिया जारी है: {name}",
    step_default_running_desc: "मापदंडों का विश्लेषण किया जा रहा है...",
    step_default_completed_desc: "सफलतापूर्वक मूल्यांकन किया गया।",
    retryBusyNotice: "एआई सेवा व्यस्त है — पुनः प्रयास (प्रयास {attempt})...",
    duplicateDetectedNotice: "डुप्लिकेट शिकायत पाई गई। सीधे लिंक किया गया।",
    filterNeedsReview: "समीक्षा की आवश्यकता",
    statTotalOpen: "कुल सक्रिय",
    statResolved: "निवारित",
    statNeedsReview: "समीक्षा आवश्यक",
    statTopDept: "शीर्ष विभाग",
    statHotspot: "नागरिक हॉटस्पॉट",
    noHotspots: "कोई सक्रिय हॉटस्पॉट नहीं मिला",
    hotspotAlert: "{location} के पास {count} रिपोर्ट",
    trackYourReportTab: "अपनी रिपोर्ट ट्रैक करें",
    fileReportTab: "रिपोर्ट दर्ज करें",
    trackPlaceholder: "रिपोर्ट आईडी दर्ज करें (उदा. rep_xxxxxxxxx)",
    trackButton: "स्थिति ट्रैक करें",
    trackStatusHeading: "नागरिक रिपोर्ट की स्थिति ट्रैक करें",
    trackNoIdError: "कृपया पहले एक वैध रिपोर्ट आईडी दर्ज करें।",
    trackNotFoundError: "रिपोर्ट आईडी नहीं मिली। कृपया आईडी जांचें और पुन: प्रयास करें।",
    trackCorroborations: "{count} नागरिकों द्वारा समर्थित",
    trackEstResolution: "इस {department} विभाग के लिए आमतौर पर {days} दिनों में समाधान होता है।",
    trackBtnBack: "रिपोर्ट दर्ज करने पर लौटें",
    trackBtnTrackThis: "इस रिपोर्ट को ट्रैक करें",
    trackCopySuccess: "रिपोर्ट आईडी कॉपी हो गई!",
    trackBtnCopy: "आईडी कॉपी करें",
    trackStageReported: "रिपोर्ट दर्ज",
    trackStageAcknowledged: "स्वीकृत",
    trackStageInProgress: "कार्य जारी",
    trackStageResolved: "समाधान संपन्न",
    photoQualityLabel: "फ़ोटो गुणवत्ता जांच",
    photoQualityGood: "फ़ोटो स्पष्ट दिख रही है ✓",
    photoQualityWarning: "यह फ़ोटो {reason} लग रही है — स्पष्ट फ़ोटो होने से हमें समस्या का तेज़ी से मूल्यांकन करने में मदद मिलती है। क्या आप फ़ोटो दोबारा लेंगे या इसी के साथ आगे बढ़ेंगे?",
    retakeButton: "फ़ोटो दोबारा लें",
    continueAnywayButton: "इसी फ़ोटो के साथ आगे बढ़ें",
    photoQualityChecking: "फ़ोटो की गुणवत्ता का विश्लेषण किया जा रहा है...",
    photoBlurryReason: "धुंधली",
    photoDarkReason: "बहुत अंधेरी",
    photoLowResReason: "कम रिज़ॉल्यूशन वाली"
  },
  mr: {
    appName: "सिविकसाइट एआय",
    appTagline: "स्वायत्त मल्टी-एजंट नागरिक निवारण इंजिन",
    resetSeeds: "डेटा रीसेट करा",
    geminiActive: "एआय निवारण: सक्रिय",
    triageStation: "निवारण केंद्र",
    launchReport: "नागरी तक्रार नोंदवा",
    welcomeTitle: "पहिल्यांदा भेट दिली आहे?",
    welcomeText: "या फॉर्मच्या खाली दिलेल्या सँडबॉक्स डेमो नमुन्यांपैकी कोणत्याही एकावर क्लिक करा आणि एआय एजंटद्वारे होणारी रिअल-टाइम प्रक्रिया पहा!",
    step1Label: "पायरी 1: वास्तविक नागरी समस्येचा फोटो अपलोड करा",
    removePhoto: "फोटो काढा",
    realVisionActive: "रिअल व्हिजन एपीआई सक्रिय",
    demoActiveBadge: "🧪 सँपल मोड (डेमो)",
    demoActiveText: "लाइव्ह कॅमेरा विश्लेषक बायपास करतो आणि पूर्व-कॅश केलेले नमुना तपशील देतो.",
    switchToRealPhoto: "वास्तविक फोटो अपलोडवर जा",
    dragDropText: "फोटो अपलोड करण्यासाठी ड्रॅग आणि ड्रॉप करा किंवा क्लिक करा",
    geminiFlashText: "रिअल-टाइम व्हिज्युअल मूल्यांकनासाठी जेमिनी 3.5 चा वापर करतो",
    chooseFile: "फाईल निवडा",
    step2Label: "पायरी 2: नकाशावर अचूक स्थान पिन करा",
    coordinatesActive: "स्थान पिन केले",
    mapUnavailableHeader: "नकाशा पिनिंग अनुपलब्ध",
    mapUnavailableText: "या पूर्वावलोकनात गुगल मॅप्स एपीआई की नसल्यामुळे नकाशा पिनिंग ऑफलाइन आहे. कृपया जिओकोडिंगसाठी खाली आपले स्थान वर्णन प्रविष्ट करा.",
    relocate: "पुन्हा शोधा",
    pinnedAddress: "पिन केलेला पत्ता",
    fetchingAddress: "पिन केलेल्या पत्त्याचे तपशील मिळवत आहे...",
    attachLocation: "या पिन केलेल्या अचूक स्थानाला तक्रारीशी जोडा",
    step3Label: "पायरी 3: लँडमार्क / स्थान वर्णन",
    step3Placeholder: "उदा. शिवाजी चौकाजवळ, एफसी रोड, किंवा बस डेपोसमोर",
    step4Label: "पायरी 4: नागरिकाची संवाद भाषा",
    submitButton: "तक्रार सबमिट करा",
    orChoosePreset: "किंवा सँडबॉक्स डेमो नमुना निवडा",
    sandboxSamplesTitle: "🧪 सँडबॉक्स डेमो नमुने",
    sandboxSamplesText: "भाषांतर, डुप्लिकेट किंवा मानवी पुनरावलोकन रांगेसारख्या एजंट वर्तनाची चाचणी घेण्यासाठी जेमिनी व्हिजन बायपास करतो.",
    guideHeader: "हे नागरी पोर्टल कसे काम करते",
    guideWelcome: "स्वागत आहे! हे बुद्धिमान नागरी पोर्टल नागरिक तक्रारींवर प्रक्रिया करण्यासाठी, समस्या ओळखण्यासाठी आणि संबंधित स्थानिक प्राधिकरणाला स्वयंचलितपणे सूचित करण्यासाठी प्रगत एआय चा वापर करते.",
    guideStep1Title: "तुमची तक्रार नोंदवा",
    guideStep1Desc: "समस्येचे वर्णन करा आणि फोटो अपलोड करा. आपण जवळील लँडमार्क आणि परिसराची नावे सहजपणे वापरू शकता (उदा. \"शिवाजी चौकाजवळ\" किंवा \"शिवाजी पार्क क्रीडांगणासमोर\").",
    guideStep2Title: "स्मार्ट एआय पडताळणी",
    guideStep2Desc: "आमचा एआय स्वयंचलितपणे फोटोचे विश्लेषण करतो, आपल्या लँडमार्क वर्णनाला भौगोलिक अक्षांश-रेखांश मध्ये रूपांतरित करतो आणि डुप्लिकेटसाठी जवळपासच्या सक्रिय तक्रारी स्कॅन करतो.",
    guideStep3Title: "त्वरित मार्गक्रमण आणि स्थानिक भाषा अपडेट्स",
    guideStep3Desc: "पडताळणी झाल्यानंतर, तक्रार त्वरित संबंधित भारतीय विभागाकडे (उदा. पीडब्ल्यूडी, घनकचरा व्यवस्थापन, इ.) वर्ग केली जाते आणि आपल्या निवडलेल्या भाषेत एक विनम्र अपडेट मसुदा तयार केला जातो.",
    guideFooterLandmarks: "📍 संपूर्ण भारतात लँडमार्कसाठी अनुकूलित जिओकोडिंग",
    guideFooterSupport: "🇮🇳 अखिल भारतीय समर्थन",
    triageCompleted: "निवारण प्रक्रिया पूर्ण झाली",
    triageCompletedDesc: "तुमची तक्रार यशस्वीरीत्या पडताळणी, वर्गीकृत आणि महानगरपालिकेकडे पाठवली गेली आहे.",
    assignedUnit: "नियुक्त विभाग",
    generalWardOffice: "सामान्य वॉर्ड कार्यालय",
    severityScore: "तीव्रता गुण",
    classification: "वर्गीकरण",
    issueCategory: "समस्येचा प्रवर्ग",
    other: "इतर",
    officialCitizenComm: "अधिकृत नागरिक संवाद",
    fileAnotherReport: "आणखी एक नागरिक तक्रार नोंदवा",
    reportsRegistry: "तक्रार नोंदणी ({count})",
    filterAll: "सर्व",
    filterActive: "सक्रिय",
    filterResolved: "निवारण झालेले",
    noReportsFoundTitle: "निवडीशी जुळणारी कोणतीही तक्रार आढळली नाही",
    noReportsFoundText: "नोंदणीमध्ये तपशील भरण्यासाठी एखादा नमुना निवडून तक्रार सबमिट करा.",
    originalDesc: "मूळ वर्णन:",
    detailedTriage: "तपशीलवार निवारण विश्लेषण",
    submittedAt: "सबमिट केले: {time}",
    markResolved: "निवारण झाले म्हणून चिन्हांकित करा",
    fallbackActiveHeader: "इंटेलिजेंट फॉलबॅक सक्रिय (एआय मर्यादा संपली)",
    fallbackActiveText: "सार्वजनिक जेमिनी एपीआय विनाव्यत्यय मर्यादेवर पोहोचला आहे. कोणतीही दिरंगाई न करता तुमच्या तक्रारीवर यशस्वीरित्या प्रक्रिया करण्यासाठी नागरी पोर्टल स्वयंचलितपणे स्थानिक इंजिनवर वर्ग झाले आहे.",
    originalCapture: "मूळ फोटो",
    citizenRequestProfile: "नागरिक तक्रार प्रोफाइल",
    locationDesc: "स्थान वर्णन:",
    languageLabel: "भाषा:",
    triageResolution: "निवारण स्थिती",
    issueClassification: "समस्येचे वर्गीकरण",
    geocodedMatch: "भौगोलिक स्थान जुळणी",
    pendingEvaluation: "मूल्यांकन प्रलंबित",
    duplicateDetectedTitle: "डुप्लिकेट समस्या आढळली",
    duplicateDetectedText: "ही समस्या १५० मीटरच्या आत असलेल्या तक्रार {duplicateOf} ची डुप्लिकेट म्हणून चिन्हांकित केली आहे. नवीन निर्मिती टाळण्यात आली.",
    communityConsensus: "सामुदायिक सहमती",
    corroborationSingular: "1 नागरिकाने समर्थन दिले",
    corroborationPlural: "{count} नागरिकांनी समर्थन दिले",
    escalatedToHumanTitle: "मानवी पुनरावलोकनासाठी वर्ग केले",
    escalatedReason: "कारण:",
    escalatedQueueBadge: "रांग: महानगरपालिका निवारण वाढ रांग",
    severityGrade: "तीव्रता श्रेणी",
    assignedDepartment: "नियुक्त विभाग",
    notAssigned: "सोपवले नाही",
    citizenProgressNotification: "नागरिक प्रगती सूचना ({language})",
    developerTools: "डेव्हलपर टूल्स",
    hideTechnicalLogs: "तांत्रिक एआय लॉग लपवा",
    showTechnicalLogs: "तांत्रिक एआय लॉग दाखवा",
    operationsCount: "{count} ऑपरेशन्स",
    operationsExecuted: "{count} ऑपरेशन्स पूर्ण",
    devLogsHeader: "स्वायत्त मल्टी-एजंट निवारण अंमलबजावणी लॉग",
    inputsParameters: "इनपुट / पॅरामीटर्स",
    resultOutput: "निकाल / आउटपुट",
    agentReasoningHeader: "एजंट युक्तिवाद आणि निष्कर्ष (एकत्रित सारांश)",
    whyAssessment: "हे मूल्यांकन का?",
    footerText: "सिविकसाईट एआय • गुगल जेमिनी ३.५ द्वारे संचलित",
    footerPort: "सिस्टम स्थिती: ऑनलाइन आणि सुरक्षित",
    toastPhotoError: "कृपया एक वास्तविक फोटो अपलोड करा किंवा खाली दिलेल्या डेमो सॅम्पल नमुन्यांपैकी एक निवडा.",
    toastResetConfirm: "तुम्हाला खरोखरच डेटाबेस रीसेट करायचा आहे का?",
    toastFallbackWarning: "एआय सिस्टीम तात्पुरती व्यस्त आहे. स्थानिक फॉलबॅक निवारण प्रक्रिया सुरू केली जात आहे...",
    toastTimeout: "निष्क्रियतेमुळे निवारण विनंतीची वेळ संपली. कृपया पुन्हा प्रयत्न करा.",
    toastReachFailed: "सर्व्हरशी संपर्क साधण्यात अपयशी. कृपया पुन्हा प्रयत्न करा.",
    toastSessionFailed: "निवारण सत्र अपयशी ठरले.",
    loadingProgressTitle: "आमची स्वयंचलित प्रणाली आपल्या तक्रारीची पडताळणी करत आहे, अक्षांश-रेखांश निश्चित करत आहे आणि डुप्लिकेट तपासत आहे:",
    acquiringCoordinates: "सध्याचे अक्षांश-रेखांश शोधत आहे...",
    processingLiveSignals: "जवळपासच्या तक्रारी तपासल्या जात आहेत...",
    municipalTriageCenter: "महानगरपालिका निवारण केंद्र",

    // Agent Steps translations
    step_init_title: "सुरक्षित नगरपालिका पोर्टल कनेक्शन स्थापित केले जात आहे",
    step_init_running_desc: "सुरक्षित पोर्टल स्थिती प्रारंभ करणे आणि टेम्पलेट्स लोड करणे...",
    step_init_completed_desc: "प्रणाली ऑनलाइन आहे. सुरक्षित निवारण केंद्र तयार आहे.",
    step_analyze_title: "तक्रार फोटोचे विश्लेषण केले जात आहे",
    step_analyze_running_desc: "समस्या प्रवर्ग आणि तीव्रतेचे मूल्यांकन करण्यासाठी फोटो स्कॅन केला जात आहे...",
    step_analyze_completed_desc: "तुमच्या फोटोचे विश्लेषण केले जात आहे... एक {issue_type} आढळला ({confidence}% अचूकता)",
    step_geocode_title: "तक्रार स्थानाचे निवारण केले जात आहे",
    step_geocode_running_desc: "पिन अक्षांश-रेखांश मिळवण्यासाठी शहराचे नकाशे आणि लँडमार्क संदर्भ शोधत आहे...",
    step_geocode_completed_desc: "{formatted_address} वर अचूक स्थान निश्चित केले",
    step_duplicate_title: "सक्रिय डुप्लिकेट तक्रारींची तपासणी केली जात आहे",
    step_duplicate_running_desc: "ओव्हरलॅपिंग स्थानांसाठी नगरपालिका तक्रार डेटाबेसची चौकशी केली जात आहे...",
    step_duplicate_completed_no_dup: "या भागात कोणतीही डुप्लिकेट तक्रार आढळली नाही. अद्वितीय असल्याचे पडताळले.",
    step_duplicate_completed_dup: "हे {distance} मीटर दूर असलेल्या विद्यमान तक्रारीशी जुळते — तुमचे समर्थन जोडले जात आहे (आता {corroborations} नागरिक).",
    step_route_title: "प्राधान्यक्रम आणि विभाग मार्गक्रमणाचे मूल्यांकन केले जात आहे",
    step_route_running_desc: "योग्य फील्ड team पाठवण्यासाठी सार्वजनिक सुरक्षा जोखीम घटकाचे मूल्यांकन केले जात आहे...",
    step_route_completed_desc: "{assigned_department} कडे {severity_score}/100 च्या प्राधान्य गुणांसह पाठवले जात आहे",
    step_draft_title: "नागरिक प्रगती सूचनेचा मसुदा तयार केला जात आहे",
    step_draft_running_desc: "आपल्या रेकॉर्डसाठी पुढील चरणांसह उपयुक्त पुष्टीकरण संदेश लिहिला जात आहे...",
    step_draft_completed_desc: "अधिकृत पुष्टीकरण अपडेट {language} मध्ये यशस्वीरित्या तयार केले गेले",
    step_escalate_title: "नगरपालिका पुनरावलोकनासाठी चिन्हांकित केले जात आहे",
    step_escalate_running_desc: "वरिष्ठ अभियांत्रिकी अधिकाऱ्यांकडे तक्रारीचे तपशील पाठवले जात आहेत...",
    step_escalate_completed_desc: "वॉर्ड पर्यवेक्षकाकडे वर्ग केले: {reason}",
    step_fallback_title: "स्थानिक नागरी तर्क सक्रिय केले जात आहे",
    step_fallback_desc: "विलंब टाळण्यासाठी स्थानिक डेटाबेस नियमांचा वापर करून प्रक्रिया सुरू आहे.",
    step_validate_title: "तक्रारीची सत्यता आणि सुसंगतता तपासली जात आहे",
    step_validate_running_desc: "प्रतिमा खरी नागरी समस्या दर्शवते की नाही आणि आपल्या वर्णनाशी जुळते का याची खात्री केली जात आहे...",
    step_validate_completed_desc: "पडताळणी पूर्ण झाली: {status_text}",
    step_default_title: "प्रक्रिया सुरू आहे: {name}",
    step_default_running_desc: "निकषांचे विश्लेषण केले जात आहे...",
    step_default_completed_desc: "यशस्वीरित्या मूल्यांकन केले.",
    retryBusyNotice: "एआय सेवा व्यस्त आहे — पुन्हा प्रयत्न (प्रयत्न {attempt})...",
    duplicateDetectedNotice: "डुप्लिकेट तक्रार आढळली. थेट लिंक केली.",
    filterNeedsReview: "पुनरावलोकनाची गरज",
    statTotalOpen: "एकूण सक्रिय",
    statResolved: "निवारण झालेले",
    statNeedsReview: "पुनरावलोकन",
    statTopDept: "प्रमुख विभाग",
    statHotspot: "नागरी हॉटस्पॉट",
    noHotspots: "कोणतेही हॉटस्पॉट आढळले नाहीत",
    hotspotAlert: "{location} जवळ {count} तक्रारी",
    trackYourReportTab: "तुमची तक्रार ट्रॅक करा",
    fileReportTab: "तक्रार नोंदवा",
    trackPlaceholder: "तक्रार आयडी प्रविष्ट करा (उदा. rep_xxxxxxxxx)",
    trackButton: "स्थिती ट्रॅक करा",
    trackStatusHeading: "नागरी तक्रारीची स्थिती ट्रॅक करा",
    trackNoIdError: "कृपया आधी एक वैध तक्रार आयडी प्रविष्ट करा.",
    trackNotFoundError: "तक्रार आयडी आढळला नाही. कृपया आयडी तपासा आणि पुन्हा प्रयत्न करा.",
    trackCorroborations: "{count} नागरिकांद्वारे समर्थित",
    trackEstResolution: "या {department} विभागासाठी साधारणपणे {days} दिवसात निवारण होते.",
    trackBtnBack: "तक्रार नोंदणीकडे परत",
    trackBtnTrackThis: "या तक्रारीचा मागोवा घ्या",
    trackCopySuccess: "तक्रार आयडी कॉपी झाला!",
    trackBtnCopy: "आयडी कॉपी करा",
    trackStageReported: "तक्रार नोंदवली",
    trackStageAcknowledged: "दखल घेतली",
    trackStageInProgress: "काम सुरू",
    trackStageResolved: "निवारण झाले",
    photoQualityLabel: "फोटो गुणवत्ता तपासणी",
    photoQualityGood: "फोटो स्पष्ट दिसत आहे ✓",
    photoQualityWarning: "हा फोटो {reason} दिसत आहे — स्पष्ट फोटो असल्यास आम्हाला समस्येचे जलद मूल्यांकन करण्यास मदत होते. आपण फोटो पुन्हा घेणार आहात की याच फोटोसह पुढे जाणार?",
    retakeButton: "फोटो पुन्हा घ्या",
    continueAnywayButton: "याच फोटोसह पुढे जा",
    photoQualityChecking: "फोटो गुणवत्तेचे विश्लेषण केले जात आहे...",
    photoBlurryReason: "अस्पष्ट (धुंधळा)",
    photoDarkReason: "खूप अंधार असलेला",
    photoLowResReason: "कमी रिझोल्यूशन असलेला"
  }
};

export const issueTypeTranslations: Record<string, Record<string, string>> = {
  en: {
    pothole: "Pothole",
    graffiti: "Graffiti",
    trash: "Overflowing Trash",
    streetlight: "Broken Streetlight",
    water_leak: "Water Pipe Leak",
    manhole: "Open Manhole",
    other: "Other Concern"
  },
  hi: {
    pothole: "सड़क का गड्ढा",
    graffiti: "दीवार पर चित्रकारी",
    trash: "कचरे का ढेर",
    streetlight: "खराब स्ट्रीटलाइट",
    water_leak: "पानी का रिसाव",
    manhole: "खुला मैनहोल",
    other: "अन्य समस्या"
  },
  mr: {
    pothole: "रस्त्यावरील खड्डा",
    graffiti: "भिंतीवरील चित्र",
    trash: "कचऱ्याचा ढीग",
    streetlight: "बंद पथदिवा",
    water_leak: "पाणी गळती",
    manhole: "उघडे मॅनहोल",
    other: "इतर समस्या"
  }
};

export const departmentTranslations: Record<string, Record<string, string>> = {
  en: {
    "Public Works Department (PWD)": "Public Works Department (PWD)",
    "Water Supply & Sewerage Department": "Water Supply & Sewerage Department",
    "Solid Waste Management": "Solid Waste Management",
    "Street Lighting Department": "Street Lighting Department",
    "Municipal Corporation - Storm Water Drainage": "Municipal Corporation - Storm Water Drainage",
    "Municipal Corporation - Estate Department": "Municipal Corporation - Estate Department",
    "General Ward Office": "General Ward Office"
  },
  hi: {
    "Public Works Department (PWD)": "लोक निर्माण विभाग (पीडब्ल्यूडी)",
    "Water Supply & Sewerage Department": "जल आपूर्ति और जल निकासी विभाग",
    "Solid Waste Management": "ठोस कचरा प्रबंधन विभाग",
    "Street Lighting Department": "स्ट्रीट लाइटिंग विभाग",
    "Municipal Corporation - Storm Water Drainage": "नगर निगम - तूफानी जल निकासी विभाग",
    "Municipal Corporation - Estate Department": "नगर निगम - संपदा विभाग",
    "General Ward Office": "सामान्य वार्ड कार्यालय"
  },
  mr: {
    "Public Works Department (PWD)": "सार्वजनिक बांधकाम विभाग (पीडब्ल्यूडी)",
    "Water Supply & Sewerage Department": "पाणी पुरवठा आणि मलनिसारण विभाग",
    "Solid Waste Management": "घनकचरा व्यवस्थापन विभाग",
    "Street Lighting Department": "पथदिवा विभाग",
    "Municipal Corporation - Storm Water Drainage": "महानगरपालिका - पर्जन्य जल वहन विभाग",
    "Municipal Corporation - Estate Department": "महानगरपालिका - इस्टेट विभाग",
    "General Ward Office": "सामान्य वॉर्ड कार्यालय"
  }
};

export const statusTranslations: Record<string, Record<string, string>> = {
  en: {
    pending: "Pending",
    triaged: "Reported",
    reported: "Reported",
    acknowledged: "Acknowledged",
    "in progress": "In Progress",
    inprogress: "In Progress",
    duplicate: "Duplicate",
    escalated: "Pending Human Review",
    resolved: "Resolved"
  },
  hi: {
    pending: "लंबित",
    triaged: "रिपोर्ट किया गया",
    reported: "रिपोर्ट किया गया",
    acknowledged: "स्वीकृत",
    "in progress": "काम प्रगति पर है",
    inprogress: "काम प्रगति पर है",
    duplicate: "डुप्लिकेट",
    escalated: "लंबित मानव समीक्षा",
    resolved: "समाधान"
  },
  mr: {
    pending: "प्रलंबित",
    triaged: "तक्रार नोंदवली",
    reported: "तक्रार नोंदवली",
    acknowledged: "स्वीकृत",
    "in progress": "काम प्रगतीपथावर",
    inprogress: "काम प्रगतीपथावर",
    duplicate: "डुप्लिकेट",
    escalated: "लंबित मानवी पुनरावलोकन",
    resolved: "निवारण झालेले"
  }
};

export function t(key: keyof UIStrings, lang: string, variables?: Record<string, string | number>): string {
  const dict = translations[lang] || translations["en"];
  let text = dict[key] || translations["en"][key] || "";
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{${k}}`, "g"), String(v));
    });
  }
  return text;
}

export function tIssueType(type: string, lang: string): string {
  const normType = (type || "other").toLowerCase();
  const dict = issueTypeTranslations[lang] || issueTypeTranslations["en"];
  return dict[normType] || dict["other"] || type;
}

export function tDepartment(dept: string, lang: string): string {
  const dict = departmentTranslations[lang] || departmentTranslations["en"];
  return dict[dept] || dept;
}

export function tStatus(status: string, lang: string): string {
  const normStatus = (status || "pending").toLowerCase();
  const dict = statusTranslations[lang] || statusTranslations["en"];
  return dict[normStatus] || status;
}

export const presetTranslations: Record<string, Record<string, { label: string; description: string; badge: string }>> = {
  en: {
    pothole_preset: {
      label: "Pothole on FC Road, Pune",
      description: "Deep pothole causing cars and two-wheelers to swerve on a busy road.",
      badge: "Novel/Standard"
    },
    graffiti_preset: {
      label: "Open Manhole, Dadar, Mumbai",
      description: "Open manhole on the footpath, highly dangerous for kids and senior citizens.",
      badge: "Marathi (मराठी)"
    },
    trash_preset: {
      label: "Overflowing Bin, Karol Bagh, Delhi",
      description: "Overflowing municipal waste container with scattered litter blocking foot traffic.",
      badge: "Hindi (हिन्दी)"
    },
    streetlight_preset: {
      label: "Broken Light, Jayanagar, Bangalore",
      description: "Municipal streetlight is completely dark for three days, creating a safety hazard.",
      badge: "Kannada (कन्नड़)"
    },
    water_preset: {
      label: "Water Pipe Leak, Gariahat, Kolkata",
      description: "Water leaking heavily from the pipeline joints, flooding the road.",
      badge: "Bengali (বাংলা)"
    },
    conflict_preset: {
      label: "Conflict Signature",
      description: "Image shows a water leak, but description says potholes.",
      badge: "Human Escalation"
    },
    blurry_preset: {
      label: "Low Confidence",
      description: "Blurry unfocused photo, cannot identify any civic issue clearly.",
      badge: "Low Confidence"
    }
  },
  hi: {
    pothole_preset: {
      label: "एफसी रोड, पुणे पर सड़क का गड्ढा",
      description: "व्यस्त सड़क पर कारों और दोपहिया वाहनों को दुर्घटनाग्रस्त करने वाला गहरा गड्ढा।",
      badge: "नया/मानक"
    },
    graffiti_preset: {
      label: "खुला मैनहोल, दादर, मुंबई",
      description: "फुटपाथ पर खुला मैनहोल, बच्चों और वरिष्ठ नागरिकों के लिए अत्यधिक खतरनाक।",
      badge: "मराठी (मराठी)"
    },
    trash_preset: {
      label: "कचरे का ढेर, करोल बाग, दिल्ली",
      description: "पैदल चलने वालों का रास्ता रोकने वाला और बिखरे हुए कचरे से भरा नगर निगम का डिब्बा।",
      badge: "हिन्दी (हिन्दी)"
    },
    streetlight_preset: {
      label: "टूटी स्ट्रीटलाइट, जयनगर, बैंगलोर",
      description: "नगर निगम की स्ट्रीटलाइट तीन दिनों से पूरी तरह बंद है, जिससे सुरक्षा का खतरा पैदा हो गया है।",
      badge: "कन्नड़ (कन्नड़)"
    },
    water_preset: {
      label: "पानी की पाइपलाइन रिसाव, गरियाहाट, कोलकाता",
      description: "पाइपलाइन के जोड़ों से भारी पानी का रिसाव हो रहा है, जिससे सड़क पर पानी भर गया है।",
      badge: "बंगाली (বাংলা)"
    },
    conflict_preset: {
      label: "विवाद संकेत (Conflict Signature)",
      description: "फोटो में पानी का रिसाव दिख रहा है, लेकिन विवरण में गड्ढे बताए गए हैं।",
      badge: "मानव समीक्षा"
    },
    blurry_preset: {
      label: "कम विश्वसनीयता",
      description: "धुंधला अनफोकस्ड फोटो, किसी भी नागरिक समस्या को स्पष्ट रूप से नहीं पहचाना जा सकता।",
      badge: "कम विश्वसनीयता"
    }
  },
  mr: {
    pothole_preset: {
      label: "एफसी रोड, पुणे वरील खड्डा",
      description: "व्यस्त रस्त्यावर कार आणि दुचाकी वाहने घसरण्यास कारणीभूत ठरणारा खोल खड्डा.",
      badge: "नवीन/मानक"
    },
    graffiti_preset: {
      label: "उघडे मॅनहोल, दादर, मुंबई",
      description: "फुटपाथवरील उघडे मॅनहोल, लहान मुले आणि ज्येष्ठ नागरिकांसाठी अत्यंत धोकादायक.",
      badge: "मराठी (मराठी)"
    },
    trash_preset: {
      label: "कचऱ्याचा ढीग, करोल बाग, दिल्ली",
      description: "रस्ता अडवणारा आणि कचरा विखुरलेला महानगरपालिकेचा कचरा कुंडी.",
      badge: "हिंदी (हिन्दी)"
    },
    streetlight_preset: {
      label: "बंद पथदिवा, जयनगर, बंगलोर",
      description: "महानगरपालिकेचा पथदिवा तीन दिवसांपासून पूर्णपणे बंद आहे, ज्यामुळे सुरक्षेचा धोका निर्माण झाला आहे.",
      badge: "कन्नड (कन्नड)"
    },
    water_preset: {
      label: "पाणी वाहिनी गळती, गरियाहाट, कोलकाता",
      description: "पाइपलाईनच्या सांध्यातून मोठ्या प्रमाणात पाणी गळती होत आहे, ज्यामुळे रस्ता पाण्याने भरला आहे.",
      badge: "बंगाली (বাংলা)"
    },
    conflict_preset: {
      label: "विसंगती स्वाक्षरी (Conflict Signature)",
      description: "फोटो पाणी गळती दाखवतो, पण वर्णनात खड्डे लिहिले आहेत.",
      badge: "मानव पुनरावलोकन"
    },
    blurry_preset: {
      label: "कमी विश्वासार्हता",
      description: "अस्पष्ट अनफोकस्ड फोटो, कोणतीही नागरी समस्या स्पष्टपणे ओळखता येत नाही.",
      badge: "कमी विश्वासार्हता"
    }
  }
};

export function tPresetLabel(id: string, lang: string, fallback: string): string {
  const dict = presetTranslations[lang] || presetTranslations["en"];
  return dict[id]?.label || fallback;
}

export function tPresetDesc(id: string, lang: string, fallback: string): string {
  const dict = presetTranslations[lang] || presetTranslations["en"];
  return dict[id]?.description || fallback;
}

export function tPresetBadge(id: string, lang: string, fallback: string): string {
  const dict = presetTranslations[lang] || presetTranslations["en"];
  return dict[id]?.badge || fallback;
}

