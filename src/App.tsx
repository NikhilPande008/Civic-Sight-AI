import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import {
  AlertTriangle,
  MapPin,
  Trash2,
  Camera,
  CheckCircle,
  Languages,
  ShieldAlert,
  Wrench,
  Filter,
  Lightbulb,
  Droplet,
  Sparkles,
  RefreshCw,
  FileText,
  ExternalLink,
  AlertOctagon,
  Info,
  List,
  PlusCircle,
  CheckCircle2,
  Image as ImageIcon,
  Activity,
  ArrowRight,
  Shield,
  Users,
  Hourglass,
  Loader2,
  Check,
  Search,
  ThumbsUp,
  GitMerge,
  ChevronDown,
  Copy,
  ArrowLeft
} from "lucide-react";
import {
  t as tOrig,
  tIssueType as tIssueTypeOrig,
  tDepartment as tDepartmentOrig,
  tStatus as tStatusOrig,
  tPresetLabel as tPresetLabelOrig,
  tPresetDesc as tPresetDescOrig,
  tPresetBadge as tPresetBadgeOrig,
  issueTypeTranslations
} from "./translations";

// Types for the UI
interface ReportLog {
  timestamp: string;
  toolName: string;
  arguments: any;
  result: any;
}

interface Report {
  id: string;
  rawLocation: string;
  imageUrl: string;
  language: string;
  createdAt: string;
  status: "pending" | "triaged" | "duplicate" | "escalated" | "resolved";
  issueType?: string;
  severityCues?: string[];
  confidence?: number;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  severityScore?: number;
  assignedDepartment?: string;
  citizenUpdate?: string;
  duplicateOf?: string;
  escalationReason?: string;
  agentSummary?: string;
  corroborationCount?: number;
  logs: ReportLog[];
}

// Preset configurations for easy testing
const PRESETS = [
  {
    id: "pothole_preset",
    label: "Pothole on FC Road, Pune",
    icon: Wrench,
    rawLocation: "Near Shivaji Chowk, FC Road, Pune, Maharashtra",
    language: "en",
    description: "Deep pothole causing cars and two-wheelers to swerve on a busy road.",
    badge: "Novel/Standard"
  },
  {
    id: "graffiti_preset",
    label: "Open Manhole, Dadar, Mumbai",
    icon: ShieldAlert,
    rawLocation: "Opposite Shivaji Park playground, Dadar West, Mumbai",
    language: "mr",
    description: "Open manhole on the footpath, highly dangerous for kids and senior citizens.",
    badge: "Marathi (मराठी)"
  },
  {
    id: "trash_preset",
    label: "Overflowing Bin, Karol Bagh, Delhi",
    icon: Trash2,
    rawLocation: "Karol Bagh Market, near the main bus stop, New Delhi",
    language: "hi",
    description: "Overflowing municipal waste container with scattered litter blocking foot traffic.",
    badge: "Hindi (हिन्दी)"
  },
  {
    id: "streetlight_preset",
    label: "Broken Light, Jayanagar, Bangalore",
    icon: Lightbulb,
    rawLocation: "4th T Block, near Jayanagar Post Office, Bangalore, Karnataka",
    language: "kn",
    description: "Municipal streetlight is completely dark for three days, creating a safety hazard.",
    badge: "Kannada (ಕನ್ನಡ)"
  },
  {
    id: "water_preset",
    label: "Water Pipe Leak, Gariahat, Kolkata",
    icon: Droplet,
    rawLocation: "Gariahat Road, opposite local sweet shop, Kolkata, West Bengal",
    language: "bn",
    description: "Water leaking heavily from the pipeline joints, flooding the road.",
    badge: "Bengali (বাংলা)"
  },
  {
    id: "conflict_preset",
    label: "Conflict Signature",
    icon: ShieldAlert,
    rawLocation: "Deep road potholes on MG Road, Mumbai",
    // Uses water_preset image to trigger a mismatch/conflict
    imagePresetOverride: "water_preset",
    language: "en",
    description: "Image shows a water leak, but description says potholes.",
    badge: "Human Escalation"
  },
  {
    id: "blurry_preset",
    label: "Low Confidence",
    icon: AlertOctagon,
    rawLocation: "Plot 14, Sector 15, Vashi, Navi Mumbai",
    language: "en",
    description: "Blurry unfocused photo, cannot clearly identify any civic issue.",
    badge: "Low Confidence"
  }
];

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  process.env.MAPS_API_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY !== "undefined" && API_KEY !== "";

class MapErrorBoundary extends React.Component<any, any> {
  props: any;
  state: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn("MapErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 text-center space-y-2">
          <p className="text-xs text-slate-500">Interactive Map load suspended. Triage functionality remains fully active.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function App() {
  const [uiLanguage, setUiLanguage] = useState<string>("en");

  // Suppress and handle Google Maps billing errors gracefully
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = function (...args: any[]) {
      const msg = args.map(arg => String(arg)).join(" ");
      if (
        msg.includes("You must enable Billing on the Google Cloud Project") ||
        msg.includes("billing/enable") ||
        msg.includes("Geocoding Service")
      ) {
        originalWarn.apply(console, [
          "[Suppressed Google Maps Billing Warning]: Interactive map reverse-geocoding requires billing to be enabled. Falling back to coordinates-based display."
        ]);
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = function (...args: any[]) {
      const msg = args.map(arg => String(arg)).join(" ");
      if (
        msg.includes("You must enable Billing on the Google Cloud Project") ||
        msg.includes("billing/enable") ||
        msg.includes("Geocoding Service")
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const t = (key: any, _lang?: string, options?: any) => tOrig(key, uiLanguage, options);
  const tIssueType = (issue: string, _lang?: string) => tIssueTypeOrig(issue, uiLanguage);
  const tDepartment = (dept: string, _lang?: string) => tDepartmentOrig(dept, uiLanguage);
  const tStatus = (status: string, _lang?: string) => tStatusOrig(status, uiLanguage);
  const tPresetLabel = (id: string, _lang?: string, fallback?: string) => tPresetLabelOrig(id, uiLanguage, fallback || "");
  const tPresetDesc = (id: string, _lang?: string, fallback?: string) => tPresetDescOrig(id, uiLanguage, fallback || "");
  const tPresetBadge = (id: string, _lang?: string, fallback?: string) => tPresetBadgeOrig(id, uiLanguage, fallback || "");

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [liveSteps, setLiveSteps] = useState<any[]>([]);
  const [completedReport, setCompletedReport] = useState<Report | null>(null);
  const [tempReportId, setTempReportId] = useState<string>("");
  const [showTechLogs, setShowTechLogs] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: "error" | "warning" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "warning" | "success" = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => prev?.message === message ? null : prev);
    }, 6000);
  };

  // Function to render steps with rich metadata and descriptions in plain, friendly, and professional language without emojis.
  const renderStepDescription = (step: any) => {
    const isCompleted = step.status === "completed";
    const { name, args, result } = step;

    switch (name) {
      case "init_agent":
        return {
          icon: "init",
          title: t("step_init_title", uiLanguage),
          desc: isCompleted ? t("step_init_completed_desc", uiLanguage) : t("step_init_running_desc", uiLanguage)
        };
      case "analyze_image":
        return {
          icon: "analyze",
          title: t("step_analyze_title", uiLanguage),
          desc: isCompleted 
            ? t("step_analyze_completed_desc", uiLanguage, {
                issue_type: tIssueType(result?.issue_type || "other", uiLanguage),
                confidence: Math.round((result?.confidence || 0.94) * 100)
              })
            : t("step_analyze_running_desc", uiLanguage)
        };
      case "validate_report":
        return {
          icon: "validate",
          title: t("step_validate_title", uiLanguage),
          desc: isCompleted
            ? (result?.reason || t("step_validate_completed_desc", uiLanguage, { status_text: result?.status || "complete" }))
            : t("step_validate_running_desc", uiLanguage)
        };
      case "geocode_location":
        return {
          icon: "geocode",
          title: t("step_geocode_title", uiLanguage),
          desc: isCompleted
            ? t("step_geocode_completed_desc", uiLanguage, {
                formatted_address: result?.formatted_address || "Pune"
              })
            : t("step_geocode_running_desc", uiLanguage)
        };
      case "find_duplicate_reports":
        const dupCount = result?.duplicates?.length || 0;
        return {
          icon: "duplicate",
          title: t("step_duplicate_title", uiLanguage),
          desc: isCompleted
            ? dupCount > 0 
              ? t("step_duplicate_completed_dup", uiLanguage, {
                  distance: result.duplicates[0].distance_meters ? Math.round(result.duplicates[0].distance_meters) : 38
                })
              : t("step_duplicate_completed_no_dup", uiLanguage)
            : t("step_duplicate_running_desc", uiLanguage)
        };
      case "score_and_route": {
        const analyzeStep = liveSteps.find(s => s.name === "analyze_image");
        const confidenceVal = analyzeStep?.result?.confidence ?? 0.94;
        const confidencePct = Math.round(confidenceVal * 100);
        const dept = tDepartment(result?.assigned_department || "Public Works Department (PWD)", uiLanguage);
        return {
          icon: "route",
          title: t("step_route_title", uiLanguage),
          desc: isCompleted
            ? uiLanguage === "hi"
              ? `उच्च आत्मविश्वास (${confidencePct}%) — ${dept} को स्वचालित रूप से रूट किया जा रहा है।`
              : uiLanguage === "mr"
                ? `उच्च आत्मविश्वास (${confidencePct}%) — ${dept} कडे स्वयंचलितपणे पाठवले जात आहे.`
                : `High confidence (${confidencePct}%) — routing automatically to ${dept}.`
            : t("step_route_running_desc", uiLanguage)
        };
      }
      case "draft_citizen_update":
        let langName = "English";
        if (args?.language === "hi") langName = "हिन्दी";
        else if (args?.language === "mr") langName = "मराठी";
        else if (args?.language === "ta") langName = "தமிழ்";
        else if (args?.language === "te") langName = "తెలుగు";
        else if (args?.language === "bn") langName = "বাংলা";
        else if (args?.language === "kn") langName = "ಕನ್ನಡ";
        else if (args?.language === "gu") langName = "ગુજરાતી";

        return {
          icon: "draft",
          title: t("step_draft_title", uiLanguage),
          desc: isCompleted
            ? t("step_draft_completed_desc", uiLanguage, { language: langName })
            : t("step_draft_running_desc", uiLanguage)
        };
      case "escalate_to_human": {
        const analyzeStep = liveSteps.find(s => s.name === "analyze_image");
        const confidenceVal = analyzeStep?.result?.confidence ?? 0.42;
        const confidencePct = Math.round(confidenceVal * 100);
        return {
          icon: "escalate",
          title: t("step_escalate_title", uiLanguage),
          desc: isCompleted
            ? uiLanguage === "hi"
              ? `कम आत्मविश्वास (${confidencePct}%) — इसे मानवीय समीक्षा की आवश्यकता है। स्वचालित मार्ग के बजाय प्रेषित किया जा रहा है।`
              : uiLanguage === "mr"
                ? `कमी आत्मविश्वास (${confidencePct}%) — यासाठी मानवी पुनरावलोकनाची आवश्यकता आहे. स्वयंचलित मार्गाऐवजी वर्ग केले जात आहे.`
                : `Confidence too low (${confidencePct}%) — this needs human review. Escalating instead of auto-routing.`
            : t("step_escalate_running_desc", uiLanguage)
        };
      }
      case "local_fallback":
        return {
          icon: "fallback",
          title: t("step_fallback_title", uiLanguage),
          desc: t("step_fallback_desc", uiLanguage)
        };
      default:
        return {
          icon: "default",
          title: t("step_default_title", uiLanguage, { name }),
          desc: isCompleted ? t("step_default_completed_desc", uiLanguage) : t("step_default_running_desc", uiLanguage)
        };
    }
  };

  const getStepIcon = (iconName: string, status: string | boolean) => {
    const isMuted = status === "not_started";
    const colorClass = isMuted ? "text-slate-300" : "text-[#002045]";
    
    switch (iconName) {
      case "init":
        return <Shield className={`h-4 w-4 ${colorClass}`} />;
      case "validate":
        return <CheckCircle className={`h-4 w-4 ${colorClass}`} />;
      case "analyze":
        return <Camera className={`h-4 w-4 ${colorClass}`} />;
      case "geocode":
        return <MapPin className={`h-4 w-4 ${colorClass}`} />;
      case "duplicate":
        return <FileText className={`h-4 w-4 ${colorClass}`} />;
      case "route":
        return <Wrench className={`h-4 w-4 ${colorClass}`} />;
      case "draft":
        return <Languages className={`h-4 w-4 ${colorClass}`} />;
      case "escalate":
        return <AlertTriangle className={`h-4 w-4 ${isMuted ? "text-slate-300" : "text-amber-500 animate-pulse"}`} />;
      case "fallback":
        return <RefreshCw className={`h-4 w-4 ${isMuted ? "text-slate-300" : "text-amber-500 animate-spin"}`} />;
      default:
        return <Info className={`h-4 w-4 ${colorClass}`} />;
    }
  };
  
  // Form States
  const [rawLocation, setRawLocation] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [language, setLanguage] = useState<string>(uiLanguage || "en");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [useCustomImage, setUseCustomImage] = useState<boolean>(true);
  const [validationFailure, setValidationFailure] = useState<{ reason: string; image: string } | null>(null);
  
  // Google Maps & Pinning States
  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [pinnedAddress, setPinnedAddress] = useState<string>("");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 19.0178, lng: 72.8478 }); // default Dadar, Mumbai
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [usePinnedLocation, setUsePinnedLocation] = useState<boolean>(true);

  const reverseGeocode = (latitude: number, longitude: number) => {
    if (typeof window === "undefined" || !window.google || !window.google.maps) {
      setPinnedAddress(`Pinned Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      return;
    }
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setPinnedAddress(results[0].formatted_address);
        } else {
          setPinnedAddress(`Pinned Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
      });
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      setPinnedAddress(`Pinned Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };

  const handleMapInteraction = (coords: { lat: number; lng: number }) => {
    setPinPosition(coords);
    setUsePinnedLocation(true);
    setSelectedPresetId(""); // Clear selected preset so it is custom
    reverseGeocode(coords.lat, coords.lng);
  };
  
  // Google Maps Dashboard States
  const [dashboardMapCenter, setDashboardMapCenter] = useState<{ lat: number; lng: number }>({ lat: 19.0178, lng: 72.8478 });
  const [dashboardMapZoom, setDashboardMapZoom] = useState<number>(12);
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);

  // Filter and status metrics
  const [activeTab, setActiveTab] = useState<"all" | "active" | "resolved" | "escalated">("all");
  const [appViewMode, setAppViewMode] = useState<"citizen" | "municipal">("citizen");
  const [municipalDeptFilter, setMunicipalDeptFilter] = useState<string>("all");
  const [municipalSortMode, setMunicipalSortMode] = useState<"date" | "priority">("priority");

  // Citizen search and filter states
  const [citizenSearchText, setCitizenSearchText] = useState<string>("");
  const [citizenCategoryFilter, setCitizenCategoryFilter] = useState<string>("all");
  const [citizenSeverityFilter, setCitizenSeverityFilter] = useState<string>("all");

  // Municipal advanced filters states
  const [municipalSearchText, setMunicipalSearchText] = useState<string>("");
  const [municipalAreaFilter, setMunicipalAreaFilter] = useState<string>("");
  const [municipalCategoryFilter, setMunicipalCategoryFilter] = useState<string>("all");
  const [municipalSeverityFilter, setMunicipalSeverityFilter] = useState<string>("all");
  const [municipalStatusFilter, setMunicipalStatusFilter] = useState<string>("all");

  // Merging state
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);
  const [targetMergeId, setTargetMergeId] = useState<string>("");

  // Citizen tab and tracking states
  const [citizenTab, setCitizenTab] = useState<"report" | "browse">("report");
  const [citizenSubView, setCitizenSubView] = useState<"submit" | "track">("submit");
  const [searchTrackId, setSearchTrackId] = useState<string>("");
  const [trackedReportState, setTrackedReportState] = useState<Report | null>(null);
  const trackedReport = useMemo(() => {
    if (!trackedReportState) return null;
    return reports.find(r => r.id === trackedReportState.id) || trackedReportState;
  }, [trackedReportState, reports]);
  const setTrackedReport = (val: Report | null) => {
    setTrackedReportState(val);
  };
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState<boolean>(false);

  // Photo quality check states
  const [photoQualityStatus, setPhotoQualityStatus] = useState<"good" | "poor" | "checking" | null>(null);
  const [photoQualityReasons, setPhotoQualityReasons] = useState<string[]>([]);
  const [ignoreQualityWarning, setIgnoreQualityWarning] = useState<boolean>(false);

  // Sync report submission language with UI language selection
  useEffect(() => {
    if (uiLanguage === "en" || uiLanguage === "hi" || uiLanguage === "mr") {
      setLanguage(uiLanguage);
    }
  }, [uiLanguage]);

  useEffect(() => {
    fetchReports();

    // Attempt Geolocation on mount
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPinPosition(coords);
          setMapCenter(coords);
          setMapZoom(15);
          setIsLocating(false);
          
          // Wait slightly for Google Maps API to load if needed
          setTimeout(() => {
            reverseGeocode(coords.lat, coords.lng);
          }, 1000);
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
          const fallback = { lat: 19.0178, lng: 72.8478 }; // Dadar, Mumbai
          setPinPosition(fallback);
          setMapCenter(fallback);
          setMapZoom(12);
          setIsLocating(false);
          setTimeout(() => {
            reverseGeocode(fallback.lat, fallback.lng);
          }, 1000);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const fallback = { lat: 19.0178, lng: 72.8478 }; // Dadar, Mumbai
      setPinPosition(fallback);
      setMapCenter(fallback);
      setMapZoom(12);
      setTimeout(() => {
        reverseGeocode(fallback.lat, fallback.lng);
      }, 1000);
    }
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data);
      if (data.length > 0 && !selectedReportId) {
        setSelectedReportId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleTrackReport = async (reportIdToTrack?: string) => {
    const id = reportIdToTrack !== undefined ? reportIdToTrack : searchTrackId;
    if (!id || !id.trim()) {
      setTrackError(t("trackNoIdError", uiLanguage));
      setTrackedReport(null);
      return;
    }
    
    setIsTrackingLoading(true);
    setTrackError(null);
    try {
      const res = await fetch(`/api/reports/${id.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setTrackedReport(data);
        setSearchTrackId(id.trim());
      } else {
        setTrackError(t("trackNotFoundError", uiLanguage));
        setTrackedReport(null);
      }
    } catch (err) {
      console.error("Error tracking report:", err);
      setTrackError(t("toastReachFailed", uiLanguage));
      setTrackedReport(null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  useEffect(() => {
    const handleRefreshOnFocus = async () => {
      // 1. Refresh general reports list
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Error refreshing reports list:", err);
      }

      // 2. Refresh active tracked report (if any)
      if (trackedReport?.id) {
        try {
          const res = await fetch(`/api/reports/${trackedReport.id}`);
          if (res.ok) {
            const data = await res.json();
            setTrackedReport(data);
          }
        } catch (err) {
          console.error("Error refreshing tracked report on focus:", err);
        }
      }
    };
    
    window.addEventListener("focus", handleRefreshOnFocus);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleRefreshOnFocus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleRefreshOnFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [trackedReport?.id]);

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm(uiLanguage === "mr" ? "तुम्हाला ही तक्रार खरोखर हटवायची आहे का?" : uiLanguage === "hi" ? "क्या आप वास्तव में इस शिकायत को हटाना चाहते हैं?" : "Are you sure you want to delete this report?")) return;
    
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast(
          uiLanguage === "mr" ? "तक्रार यशस्वीरित्या हटवली गेली!" : uiLanguage === "hi" ? "शिकायत सफलतापूर्वक हटा दी गई!" : "Report deleted successfully!",
          "success"
        );
        // Clear references
        if (completedReport?.id === reportId) {
          setCompletedReport(null);
        }
        if (trackedReport?.id === reportId) {
          setTrackedReport(null);
        }
        if (selectedReportId === reportId) {
          setSelectedReportId("");
        }
        setSearchTrackId("");
        // Re-fetch reports
        await fetchReports();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to delete report", "error");
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      showToast("Error deleting report", "error");
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setUseCustomImage(false);
    setUsePinnedLocation(false);
    setPhotoQualityStatus(null);
    setPhotoQualityReasons([]);
    setIgnoreQualityWarning(false);
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setRawLocation(preset.rawLocation);
      setLanguage(preset.language);
    }
  };

  const analyzeImageQuality = (base64Str: string) => {
    setPhotoQualityStatus("checking");
    setPhotoQualityReasons([]);
    setIgnoreQualityWarning(false);

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 64;
      canvas.height = 64;
      if (!ctx) {
        setPhotoQualityStatus("good");
        return;
      }
      ctx.drawImage(img, 0, 0, 64, 64);
      const imgData = ctx.getImageData(0, 0, 64, 64);
      const data = imgData.data;

      // Brightness Calculation (0.299R + 0.587G + 0.114B)
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
      }
      const avgBrightness = totalBrightness / (data.length / 4);

      // Sharpness/Edge Intensity via vertical & horizontal pixel differences
      let totalDiff = 0;
      let diffCount = 0;
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 63; x++) {
          const idx1 = (y * 64 + x) * 4;
          const idx2 = (y * 64 + (x + 1)) * 4;
          const b1 = 0.299 * data[idx1] + 0.587 * data[idx1+1] + 0.114 * data[idx1+2];
          const b2 = 0.299 * data[idx2] + 0.587 * data[idx2+1] + 0.114 * data[idx2+2];
          totalDiff += Math.abs(b1 - b2);
          diffCount++;
        }
      }
      const avgEdgeIntensity = totalDiff / diffCount;

      const isLowRes = img.naturalWidth < 400 || img.naturalHeight < 400;
      const isTooDark = avgBrightness < 45;
      const isBlurry = avgEdgeIntensity < 7.5;

      const reasons: string[] = [];
      if (isBlurry) reasons.push("blurry");
      if (isTooDark) reasons.push("too_dark");
      if (isLowRes) reasons.push("low_res");

      if (reasons.length > 0) {
        setPhotoQualityStatus("poor");
        setPhotoQualityReasons(reasons);
      } else {
        setPhotoQualityStatus("good");
        setPhotoQualityReasons([]);
      }
    };
    img.onerror = () => {
      setPhotoQualityStatus(null);
    };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setCustomImage(base64Str);
        setUseCustomImage(true);
        analyzeImageQuality(base64Str);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    const isImageProvided = useCustomImage && !!customImage;
    const isLocationProvided = hasValidKey
      ? (usePinnedLocation ? !!pinPosition : !!rawLocation.trim())
      : !!rawLocation.trim();

    if (!isImageProvided) {
      showToast(
        uiLanguage === "mr" 
          ? "तक्रार सबमिट करण्यासाठी कृपया आपला स्वतःचा फोटो अपलोड करा." 
          : uiLanguage === "hi" 
            ? "शिकायत सबमिट करने के लिए कृपया अपनी फोटो अपलोड करें।" 
            : "Please change the image manually by uploading a real photo before submitting.",
        "warning"
      );
      return;
    }

    if (!isLocationProvided) {
      if (hasValidKey) {
        showToast("Please pin the exact location on the map.", "warning");
      } else {
        showToast("Please provide a landmark/location description as map pinning is offline.", "warning");
      }
      return;
    }

    // Ask if they are sure of the location if it was not updated (matches preset location)
    const preset = selectedPresetId ? PRESETS.find(p => p.id === selectedPresetId) : null;
    if (preset && rawLocation.trim() === preset.rawLocation.trim() && !pinPosition) {
      const confirmLoc = window.confirm(
        uiLanguage === "mr" 
          ? "आपण स्थान बदललेले नाही. आपण या स्थानाची खात्री बाळगता का?" 
          : uiLanguage === "hi" 
            ? "आपने स्थान अपडेट नहीं किया है। क्या आप इस स्थान के बारे में सुनिश्चित हैं?" 
            : "You have not updated the location. Are you sure of this location?"
      );
      if (!confirmLoc) return;
    }

    setLoading(true);
    setCompletedReport(null);
    setTempReportId("PMC-" + Math.floor(1000 + Math.random() * 9000));
    setLiveSteps([]); // clear previous steps
    
    // Determine image input
    const imageToSend = customImage;

    // Determine location inputs
    const lat = usePinnedLocation && pinPosition ? pinPosition.lat : undefined;
    const lng = usePinnedLocation && pinPosition ? pinPosition.lng : undefined;
    const pAddress = usePinnedLocation && pinPosition ? pinnedAddress : undefined;

    try {
      // Use Fetch with ReadableStream for SSE streaming
      const response = await fetch("/api/reports/triage?stream=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawLocation,
          image: imageToSend,
          language,
          lat,
          lng,
          pinnedAddress: pAddress
        })
      });

      if (!response.ok) {
        throw new Error("Triage request failed.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No stream reader available.");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let lastEventTime = Date.now();

      const timeoutCheckInterval = setInterval(() => {
        if (Date.now() - lastEventTime > 30000) {
          clearInterval(timeoutCheckInterval);
          console.warn("SSE stream timed out (no events received for 30 seconds)");
          try {
            reader.cancel();
          } catch (e) {}
          setLoading(false);
          showToast("Triage request timed out due to inactivity. Please retry.", "error");
        }
      }, 1000);

      try {
        while (true) {
          const { done, value } = await reader.read();
          lastEventTime = Date.now(); // update on any stream activity
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Maintain partial line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const dataStr = trimmed.slice(6).trim();
              if (!dataStr) continue;

              const event = JSON.parse(dataStr);
              if (event.error) {
                showToast(event.error, "error");
                setLoading(false);
                return;
              }

              if (event.type === "fallback_start") {
                showToast("AI system is temporarily saturated. Initiating intelligent local fallback triage...", "warning");
                setLiveSteps(prev => {
                  const stepName = "local_fallback";
                  if (prev.some(s => s.name === stepName)) return prev;
                  return [...prev, {
                    name: stepName,
                    status: "completed",
                    args: { reason: event.reason || "Primary model limited" },
                    result: { status: "Active" }
                  }];
                });
              } else if (event.type === "tool_start") {
                setLiveSteps(prev => {
                  const name = event.name;
                  const args = event.args;
                  if (prev.some(s => s.name === name)) {
                    return prev.map(s => s.name === name ? { ...s, status: "running", args } : s);
                  }
                  return [...prev, { name, status: "running", args, result: null }];
                });
              } else if (event.type === "tool_end") {
                setLiveSteps(prev => {
                  const name = event.name;
                  const args = event.args;
                  const result = event.result;
                  if (prev.some(s => s.name === name)) {
                    return prev.map(s => s.name === name ? { ...s, status: "completed", args, result } : s);
                  }
                  return [...prev, { name, status: "completed", args, result }];
                });
              } else if (event.type === "retrying") {
                setLiveSteps(prev => {
                  return prev.map(s => {
                    if (s.status === "running") {
                      return { ...s, retrying: true, retryAttempt: event.attempt, retryReason: event.reason };
                    }
                    return s;
                  });
                });
              } else if (event.type === "done") {
                const finalReport = event.report;
                setReports(prev => [finalReport, ...prev]);
                setSelectedReportId(finalReport.id);
                setCompletedReport(finalReport);
                
                // Reset file input back to custom image mode
                setCustomImage(null);
                setUseCustomImage(true);
                setSelectedPresetId("");
                setPhotoQualityStatus(null);
                setPhotoQualityReasons([]);
                setIgnoreQualityWarning(false);
              }
            } catch (jsonErr) {
              console.error("Failed to parse event line:", line, jsonErr);
            }
          }
        }
      } finally {
        clearInterval(timeoutCheckInterval);
      }
    } catch (err: any) {
      console.warn("SSE Streaming failed, executing standard fallback...", err);
      try {
        const response = await fetch("/api/reports/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawLocation,
            image: imageToSend,
            language,
            lat,
            lng,
            pinnedAddress: pAddress
          })
        });

        const result = await response.json();
        if (result.success) {
          setReports(prev => [result.report, ...prev]);
          setSelectedReportId(result.report.id);
          setCompletedReport(result.report);
          setCustomImage(null);
          setUseCustomImage(true);
          setSelectedPresetId("");
          setPhotoQualityStatus(null);
          setPhotoQualityReasons([]);
          setIgnoreQualityWarning(false);
        } else {
          showToast(result.error || "Triage session failed.", "error");
        }
      } catch (fallbackErr) {
        console.error("Streaming Fallback failed:", fallbackErr);
        showToast("Failed to reach server. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => r.id === id ? data.report : r));
        showToast(`Report status updated to ${newStatus}`, "success");
      } else {
        showToast(data.error || "Failed to update status", "error");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Network error. Failed to update status.", "error");
    }
  };

  const handleResolveReport = async (id: string) => {
    await handleUpdateStatus(id, "Resolved");
  };

  const handleResetDB = async () => {
    if (!window.confirm("Are you sure you want to reset the reports database to default seeds?")) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/reports/reset", { method: "POST" });
      const data = await res.json();
      setReports(data.reports);
      if (data.reports.length > 0) {
        setSelectedReportId(data.reports[0].id);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setIsResetting(false);
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  useEffect(() => {
    if (selectedReport && selectedReport.latitude && selectedReport.longitude) {
      setDashboardMapCenter({ lat: selectedReport.latitude, lng: selectedReport.longitude });
      setDashboardMapZoom(14);
      setOpenInfoWindowId(selectedReport.id);
    }
  }, [selectedReportId, reports]);

  // Citizen search and filter logic
  const citizenFilteredReports = reports.filter(r => {
    // Only show active (unresolved) and non-duplicate reports to corroborate
    if (r.status === "resolved" || r.status === "duplicate") return false;

    // 1. Category Filter
    if (citizenCategoryFilter !== "all" && r.issueType !== citizenCategoryFilter) return false;

    // 2. Severity Filter
    if (citizenSeverityFilter !== "all") {
      const score = r.severityScore || 5;
      if (citizenSeverityFilter === "high" && score < 7) return false;
      if (citizenSeverityFilter === "medium" && (score < 4 || score >= 7)) return false;
      if (citizenSeverityFilter === "low" && score >= 4) return false;
    }

    // 3. Search text (matches address, description, rawLocation, id)
    if (citizenSearchText.trim() !== "") {
      const search = citizenSearchText.toLowerCase();
      const matchId = r.id.toLowerCase().includes(search);
      const matchAddress = (r.formattedAddress || "").toLowerCase().includes(search);
      const matchRaw = r.rawLocation.toLowerCase().includes(search);
      const matchSummary = (r.agentSummary || "").toLowerCase().includes(search);
      const matchUpdate = (r.citizenUpdate || "").toLowerCase().includes(search);
      const matchCategory = tIssueType(r.issueType || "other", uiLanguage).toLowerCase().includes(search);

      if (!matchId && !matchAddress && !matchRaw && !matchSummary && !matchUpdate && !matchCategory) {
        return false;
      }
    }

    return true;
  });

  const handleCorroborateReport = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}/corroborate`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => r.id === id ? data.report : r));
        showToast(
          uiLanguage === "mr" 
            ? "तक्रारीचे समर्थन यशस्वीरित्या नोंदवले गेले!" 
            : uiLanguage === "hi" 
              ? "शिकायत का समर्थन सफलतापूर्वक दर्ज किया गया!" 
              : "Report corroborated successfully!",
          "success"
        );
      } else {
        showToast(data.error || "Failed to corroborate report", "error");
      }
    } catch (err) {
      console.error("Error corroborating:", err);
      showToast("Network error. Failed to corroborate.", "error");
    }
  };

  const handleMergeReports = async (sourceId: string, targetId: string) => {
    if (!targetId) {
      showToast("Please select a target report to merge into", "warning");
      return;
    }
    try {
      const res = await fetch(`/api/reports/${sourceId}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetReportId: targetId })
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => {
          if (r.id === sourceId) return data.report;
          if (r.id === targetId) return data.targetReport;
          return r;
        }));
        showToast("Reports successfully merged & duplicate linked!", "success");
        setIsMergeModalOpen(false);
        setTargetMergeId("");
      } else {
        showToast(data.error || "Failed to merge reports", "error");
      }
    } catch (err) {
      console.error("Error merging:", err);
      showToast("Network error. Failed to merge reports.", "error");
    }
  };

  // Filtered reports list
  const filteredReports = reports.filter(r => {
    if (activeTab === "active") return r.status !== "resolved";
    if (activeTab === "resolved") return r.status === "resolved";
    if (activeTab === "escalated") return r.status === "escalated";
    return true;
  });

  const hotspot = useMemo(() => {
    const activeReports = reports.filter(
      r => r.status !== "resolved" && r.status !== "duplicate" && r.latitude != null && r.longitude != null
    );
    if (activeReports.length < 2) return null;

    const clusters = new globalThis.Map<string, Report[]>();
    for (const report of activeReports) {
      const key = `${report.latitude!.toFixed(3)},${report.longitude!.toFixed(3)}`;
      const group = clusters.get(key) || [];
      group.push(report);
      clusters.set(key, group);
    }

    let best: { count: number; location: string; lat: number; lng: number } | null = null;
    for (const group of clusters.values()) {
      if (group.length >= 2 && (!best || group.length > best.count)) {
        const first = group[0];
        best = {
          count: group.length,
          location: first.formattedAddress || first.rawLocation || "this area",
          lat: first.latitude!,
          lng: first.longitude!
        };
      }
    }
    return best;
  }, [reports]);

  // Preset image thumbnails mappings
  const getPresetImageThumbnail = (id: string) => {
    switch (id) {
      case "pothole_preset":
        return "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=400&auto=format&fit=crop&q=80"; // Pothole
      case "graffiti_preset":
        return "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80"; // Graffiti
      case "trash_preset":
        return "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&auto=format&fit=crop&q=80"; // Overflowing Trash
      case "streetlight_preset":
        return "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?w=400&auto=format&fit=crop&q=80"; // Streetlight
      case "water_preset":
        return "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=400&auto=format&fit=crop&q=80"; // Water leak
      case "blurry_preset":
        return "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&auto=format&fit=crop&q=80"; // Blurry/Abstract gradient
      default:
        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80"; // Generic city
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "reported":
      case "triaged":
        return "bg-teal-50 text-teal-700 border-teal-200/60";
      case "acknowledged":
        return "bg-sky-50 text-sky-700 border-sky-200/60";
      case "in progress":
      case "inprogress":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "duplicate":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "escalated":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  const renderCitizenTimeline = (status: string) => {
    const stages = ["Reported", "Acknowledged", "In Progress", "Resolved"];
    
    // Normalize current status index
    let currentIndex = stages.findIndex(s => s.toLowerCase() === status.toLowerCase());
    if (currentIndex === -1) {
      if (status.toLowerCase() === "triaged" || status.toLowerCase() === "pending") {
        currentIndex = 0; // Reported
      } else if (status.toLowerCase() === "inprogress" || status.toLowerCase() === "in progress") {
        currentIndex = 2; // In Progress
      }
    }

    const isSpecial = status.toLowerCase() === "duplicate" || status.toLowerCase() === "escalated";

    return (
      <div className="border border-slate-200/60 bg-slate-50/40 p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          <Activity className="h-3.5 w-3.5 text-slate-500 animate-pulse" />
          <span>Report Lifecycle Stage</span>
        </div>

        {isSpecial ? (
          <div className="flex items-center gap-2 p-2 bg-amber-50/50 rounded-lg border border-amber-200/50 text-xs font-semibold text-amber-850">
            <Info className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              {status.toLowerCase() === "duplicate" 
                ? "This report has been identified as a duplicate and linked to an active issue."
                : "This report triggered an automated confidence gate and is currently in the Human Escalation Queue."}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 items-center relative pt-2">
            {stages.map((stage, idx) => {
              const isCompleted = idx <= currentIndex;
              const isActive = idx === currentIndex;
              
              return (
                <div key={stage} className="flex flex-col items-center text-center relative z-1 gap-1">
                  {/* Visual Circle Indicator */}
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-slate-900 border-slate-900 text-white shadow-md scale-110"
                        : isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[9px] font-bold tracking-tight ${
                      isActive
                        ? "text-slate-900 font-extrabold"
                        : isCompleted
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}

            {/* Background Connector Bar */}
            <div className="absolute top-[20px] left-[12%] right-[12%] h-0.5 bg-slate-150 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${currentIndex >= 0 ? (currentIndex / (stages.length - 1)) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const getIssueTypeBadgeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case "pothole":
        return "bg-zinc-100 text-zinc-800";
      case "graffiti":
        return "bg-indigo-50 text-indigo-700";
      case "trash":
        return "bg-yellow-50 text-yellow-800";
      case "streetlight":
        return "bg-orange-50 text-orange-800";
      case "water_leak":
        return "bg-sky-50 text-sky-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const renderMunicipalDashboard = () => {
    // Dynamic list of unique departments
    const departments = Array.from(new Set(reports.map(r => r.assignedDepartment).filter(Boolean))) as string[];
    
    // Filter reports by department
    const deptReports = municipalDeptFilter === "all" 
      ? reports 
      : reports.filter(r => r.assignedDepartment === municipalDeptFilter);

    // Active (unresolved) queue filtered by our advanced search/filter engine
    let queueReports = deptReports.filter(r => {
      // 1. Status Filter
      if (municipalStatusFilter !== "all") {
        if (municipalStatusFilter === "Needs Review") {
          if (r.status !== "escalated") return false;
        } else if (municipalStatusFilter === "Reported") {
          if (r.status !== "reported" && r.status !== "triaged" && r.status !== "pending") return false;
        } else if (municipalStatusFilter === "In Progress") {
          if (r.status !== "in progress" && r.status !== "inprogress") return false;
        } else {
          if (r.status?.toLowerCase() !== municipalStatusFilter.toLowerCase()) return false;
        }
      } else {
        // Default: hide duplicate reports to avoid clutter unless requested explicitly
        if (r.status === "duplicate") return false;
      }

      // 2. Category Filter
      if (municipalCategoryFilter !== "all" && r.issueType !== municipalCategoryFilter) return false;

      // 3. Severity Filter
      if (municipalSeverityFilter !== "all") {
        const score = r.severityScore || 5;
        if (municipalSeverityFilter === "high" && score < 7) return false;
        if (municipalSeverityFilter === "medium" && (score < 4 || score >= 7)) return false;
        if (municipalSeverityFilter === "low" && score >= 4) return false;
      }

      // 4. Area / location text filter (searches address/locality)
      if (municipalAreaFilter.trim() !== "") {
        const area = municipalAreaFilter.toLowerCase();
        const matchAddress = (r.formattedAddress || "").toLowerCase().includes(area);
        const matchRaw = r.rawLocation.toLowerCase().includes(area);
        if (!matchAddress && !matchRaw) return false;
      }

      // 5. Free-text Search (matches ID, address, rawLocation, description, summary, update, category)
      if (municipalSearchText.trim() !== "") {
        const search = municipalSearchText.toLowerCase();
        const matchId = r.id.toLowerCase().includes(search);
        const matchAddress = (r.formattedAddress || "").toLowerCase().includes(search);
        const matchRaw = r.rawLocation.toLowerCase().includes(search);
        const matchSummary = (r.agentSummary || "").toLowerCase().includes(search);
        const matchUpdate = (r.citizenUpdate || "").toLowerCase().includes(search);
        const matchCategory = tIssueType(r.issueType || "other", uiLanguage).toLowerCase().includes(search);

        if (!matchId && !matchAddress && !matchRaw && !matchSummary && !matchUpdate && !matchCategory) {
          return false;
        }
      }

      return true;
    });

    // Sort according to mode (where more citizens reporting/corroborating raises visibility priority)
    if (municipalSortMode === "priority") {
      queueReports = [...queueReports].sort((a, b) => {
        const priorityA = (a.severityScore || 5) + (a.corroborationCount || 1) * 1.5;
        const priorityB = (b.severityScore || 5) + (b.corroborationCount || 1) * 1.5;
        return priorityB - priorityA;
      });
    } else {
      queueReports = [...queueReports].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // Compute metrics
    const totalQueueCount = reports.filter(r => r.status !== "resolved" && r.status !== "duplicate").length;
    const awaitingAckCount = reports.filter(r => r.status?.toLowerCase() === "reported" || r.status?.toLowerCase() === "triaged").length;
    const inProgressCount = reports.filter(r => r.status?.toLowerCase() === "in progress" || r.status?.toLowerCase() === "inprogress" || r.status?.toLowerCase() === "acknowledged").length;
    const resolvedCount = reports.filter(r => r.status?.toLowerCase() === "resolved").length;

    // Selected report inside municipal view (defaults to first report in queue if none selected or if selected is not found)
    const activeReport = reports.find(r => r.id === selectedReportId) || queueReports[0];

    return (
      <div className="space-y-6 animate-fade-in" id="municipal_dashboard">
        {/* KPI metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0B2545] text-white p-4 rounded-2xl border border-[#133054] shadow-xs">
            <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-wider block mb-1">Incoming Queue Size</span>
            <p className="text-3xl font-black font-mono leading-none">{totalQueueCount}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
            <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block mb-1">Awaiting Acknowledgment</span>
            <p className="text-3xl font-black font-mono text-amber-950 leading-none">{awaitingAckCount}</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
            <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider block mb-1">Crews Active In Field</span>
            <p className="text-3xl font-black font-mono text-indigo-950 leading-none">{inProgressCount}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider block mb-1">Resolved (Durable Sync)</span>
            <p className="text-3xl font-black font-mono text-emerald-950 leading-none">{resolvedCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Department Filter & Reports Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Department Selection Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                <Filter className="h-4.5 w-4.5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-800">Filter Department</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setMunicipalDeptFilter("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer border ${
                    municipalDeptFilter === "all"
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Departments ({reports.filter(r => r.status !== "duplicate").length})
                </button>
                {departments.map(dept => {
                  const deptCount = reports.filter(r => r.assignedDepartment === dept && r.status !== "duplicate").length;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setMunicipalDeptFilter(dept)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer border ${
                        municipalDeptFilter === dept
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tDepartment(dept, uiLanguage)} ({deptCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Queue Search & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                <Search className="h-4.5 w-4.5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-800">Search & Filter Dispatch Queue</h3>
              </div>
              
              <div className="space-y-3">
                {/* Free Text Search */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Free-Text Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={municipalSearchText}
                      onChange={(e) => setMunicipalSearchText(e.target.value)}
                      placeholder="Search ID, keyword, description..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Area / Location Text Match */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Area / Locality Match
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={municipalAreaFilter}
                      onChange={(e) => setMunicipalAreaFilter(e.target.value)}
                      placeholder="e.g. Shivajinagar, Karol Bagh..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={municipalCategoryFilter}
                      onChange={(e) => setMunicipalCategoryFilter(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white text-slate-700 font-medium"
                    >
                      <option value="all">All Issues</option>
                      {Object.entries(issueTypeTranslations[uiLanguage] || issueTypeTranslations.en).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  {/* Severity Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Severity
                    </label>
                    <select
                      value={municipalSeverityFilter}
                      onChange={(e) => setMunicipalSeverityFilter(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white text-slate-700 font-medium"
                    >
                      <option value="all">All</option>
                      <option value="high">High (7+)</option>
                      <option value="medium">Med (4-6)</option>
                      <option value="low">Low (1-3)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={municipalStatusFilter}
                      onChange={(e) => setMunicipalStatusFilter(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white text-slate-700 font-medium"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Reported">Reported</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Needs Review">Needs Review</option>
                      <option value="duplicate">Duplicates</option>
                    </select>
                  </div>
                </div>

                {/* Reset Filters button */}
                {(municipalSearchText || municipalAreaFilter || municipalCategoryFilter !== "all" || municipalSeverityFilter !== "all" || municipalStatusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setMunicipalSearchText("");
                      setMunicipalAreaFilter("");
                      setMunicipalCategoryFilter("all");
                      setMunicipalSeverityFilter("all");
                      setMunicipalStatusFilter("all");
                    }}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl transition cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Queue Ordering Heuristics (Consensus Priority Influenced Sorting) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-slate-500" />
                  Queue Ordering Heuristics
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {municipalSortMode === "priority" ? "Consensus Priority" : "Date Filed"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMunicipalSortMode("priority")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer border flex items-center justify-center gap-1 ${
                    municipalSortMode === "priority"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Consensus Priority</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMunicipalSortMode("date")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer border flex items-center justify-center gap-1 ${
                    municipalSortMode === "date"
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Date Filed</span>
                </button>
              </div>
              {municipalSortMode === "priority" && (
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  💡 <b>Consensus Sorting:</b> Automatically weights severity & corroboration counts to bubble community-consensus issues to the top of staff queues.
                </p>
              )}
            </div>

            {/* Reports Queue List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <List className="h-4.5 w-4.5 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-800">Staff Dispatch Queue</h3>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {queueReports.length} Queued
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {queueReports.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Info className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold">No active reports in this department.</p>
                  </div>
                ) : (
                  queueReports.map(report => {
                    const isSelected = activeReport?.id === report.id;
                    return (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReportId(report.id)}
                        className={`p-4 transition cursor-pointer text-left ${
                          isSelected ? "bg-slate-50 border-l-4 border-slate-900" : "hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
                            {report.id.toUpperCase()}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(report.status)}`}>
                            {tStatus(report.status, uiLanguage).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                          {report.formattedAddress || report.rawLocation}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${getIssueTypeBadgeClass(report.issueType || "")}`}>
                            {tIssueType(report.issueType || "other", uiLanguage)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Active Dispatch Actions & Logs (7 cols) */}
          <div className="lg:col-span-7">
            {activeReport ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
                
                {/* Header Dispatch Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Triage Inspection Details</span>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {activeReport.id}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Report Language: <span className="font-bold text-slate-600">{activeReport.language.toUpperCase()}</span> · Assigned: <span className="font-bold text-slate-600">{tDepartment(activeReport.assignedDepartment || "", uiLanguage)}</span>
                    </p>
                  </div>
                  <span className={`self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(activeReport.status)}`}>
                    {tStatus(activeReport.status, uiLanguage).toUpperCase()}
                  </span>
                </div>

                {/* Primary Staff Lifecycle Progress Trigger Panel */}
                <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4.5 w-4.5 text-slate-800" />
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Department Action Portal</h4>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Stage 1: Acknowledge */}
                    {(activeReport.status?.toLowerCase() === "reported" || activeReport.status?.toLowerCase() === "triaged") && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(activeReport.id, "Acknowledged")}
                        className="px-4 py-2 bg-[#0B2545] hover:bg-[#1F4068] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer border border-[#0B2545]"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-blue-200 animate-pulse" />
                        <span>Acknowledge & Dispatch Crew</span>
                      </button>
                    )}

                    {/* Stage 2: Start Progress */}
                    {activeReport.status?.toLowerCase() === "acknowledged" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(activeReport.id, "In Progress")}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Wrench className="h-3.5 w-3.5 text-amber-200" />
                        <span>Commence Field Remediation (In Progress)</span>
                      </button>
                    )}

                    {/* Stage 3: Resolve */}
                    {(activeReport.status?.toLowerCase() === "in progress" || activeReport.status?.toLowerCase() === "inprogress") && (
                      <button
                        type="button"
                        onClick={() => handleResolveReport(activeReport.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-100" />
                        <span>Finalize Repair (Mark Resolved)</span>
                      </button>
                    )}

                    {/* Special Resolution Completion Badge */}
                    {activeReport.status?.toLowerCase() === "resolved" && (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 p-3 rounded-xl w-full">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span>This civic request has been successfully repaired and resolved. Durable database is updated.</span>
                      </div>
                    )}

                    {/* Quick Link/Triage controls */}
                    {activeReport.status?.toLowerCase() !== "resolved" && activeReport.status?.toLowerCase() !== "duplicate" && (
                      <div className="w-full border-t border-slate-150 pt-4 mt-4">
                        {!isMergeModalOpen ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsMergeModalOpen(true);
                                setTargetMergeId("");
                              }}
                              className="px-3.5 py-2 bg-white hover:bg-blue-50 border border-blue-200 text-[#0B2545] text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                            >
                              <GitMerge className="h-4 w-4" />
                              <span>Merge / Mark Duplicate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(activeReport.id, "escalated")}
                              className="px-3.5 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                            >
                              <AlertOctagon className="h-4 w-4" />
                              <span>Escalate to Admin</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-3 text-left">
                            <div className="flex items-center gap-2">
                              <GitMerge className="h-4.5 w-4.5 text-[#0B2545]" />
                              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Merge & De-duplicate Incident</h5>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Identify the master active issue that this report (<b>#{activeReport.id.slice(-5).toUpperCase()}</b>) duplicates. Merging will transition this report to <b>Duplicate</b> and roll its corroboration priority into the target report.
                            </p>

                            <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Select Primary Target Report
                              </label>
                              <select
                                value={targetMergeId}
                                onChange={(e) => setTargetMergeId(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white text-slate-700"
                              >
                                <option value="">-- Choose Master Active Report --</option>
                                {reports
                                  .filter(r => r.id !== activeReport.id && r.status !== "duplicate" && r.status !== "resolved")
                                  .map(or => (
                                    <option key={or.id} value={or.id}>
                                      #{or.id.slice(-5).toUpperCase()} - {or.formattedAddress || or.rawLocation} ({tIssueType(or.issueType, uiLanguage)})
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {targetMergeId && (() => {
                              const target = reports.find(r => r.id === targetMergeId);
                              if (!target) return null;
                              return (
                                <div className="p-3 bg-white border border-blue-100 rounded-lg text-[11px] space-y-1">
                                  <p className="font-bold text-slate-800">Target Details:</p>
                                  <p className="text-slate-600">📍 {target.formattedAddress || target.rawLocation}</p>
                                  <p className="text-slate-600">🏷️ Category: <span className="font-bold">{tIssueType(target.issueType, uiLanguage)}</span></p>
                                  <p className="text-slate-600">🔥 Current Priority: <span className="font-bold text-[#0B2545]">Score {target.severityScore || 5}/10 · {target.corroborationCount || 1} support(s)</span></p>
                                </div>
                              );
                            })()}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleMergeReports(activeReport.id, targetMergeId)}
                                disabled={!targetMergeId}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 text-white ${
                                  targetMergeId
                                    ? "bg-[#0B2545] hover:bg-[#1D3557]"
                                    : "bg-slate-300 cursor-not-allowed"
                                }`}
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Confirm & Merge</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsMergeModalOpen(false);
                                  setTargetMergeId("");
                                }}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Journey Visual Timeline */}
                {renderCitizenTimeline(activeReport.status)}

                {/* Report Image and Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-5 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center min-h-[160px]">
                    <img
                      src={activeReport.imageUrl.startsWith("data:") ? activeReport.imageUrl : getPresetImageThumbnail(activeReport.imageUrl)}
                      alt="Civic Issue Incident"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover max-h-[220px]"
                    />
                  </div>

                  <div className="md:col-span-7 space-y-3.5 text-left text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Raw Location Input</span>
                      <p className="font-bold text-slate-800">"{activeReport.rawLocation}"</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Geocoded / Pinned Address</span>
                      <p className="font-semibold text-slate-700">{activeReport.formattedAddress || "Pending evaluation"}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Triage Severity Score</span>
                        <p className="text-sm font-extrabold text-slate-900">{activeReport.severityScore || "N/A"} / 10</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Confidence Score</span>
                        <p className="text-sm font-extrabold text-slate-900">{activeReport.confidence ? `${(activeReport.confidence * 100).toFixed(0)}%` : "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Community Consensus</span>
                        <div className="flex items-center gap-1 mt-0.5 text-xs font-bold text-emerald-700">
                          <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            {activeReport.status === "duplicate" 
                              ? "Linked Duplicate"
                              : activeReport.corroborationCount && activeReport.corroborationCount > 1
                                ? t("corroborationPlural", uiLanguage, { count: activeReport.corroborationCount })
                                : t("corroborationSingular", uiLanguage)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Local Citizen Communications Update Preview */}
                {activeReport.citizenUpdate && (
                  <div className="border border-slate-200 bg-slate-50/40 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span>Citizen Notification Preview</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed italic bg-white border border-slate-150 p-3 rounded-lg shadow-2xs">
                      "{activeReport.citizenUpdate}"
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center text-slate-400">
                <Info className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold">Please select a report from the dispatcher queue.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans relative" id="app_root">
      {/* Premium Notification Toast Overlay */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 flex items-start gap-3 transition-all duration-300 transform translate-x-0 animate-fade-in-right">
          <div className={`p-2 rounded-xl flex-shrink-0 font-bold text-sm ${
            notification.type === "error" ? "bg-red-50 text-red-600" :
            notification.type === "warning" ? "bg-amber-50 text-amber-600" :
            "bg-emerald-50 text-emerald-600"
          }`}>
            {notification.type === "error" ? "❌" : notification.type === "warning" ? "⚠️" : "✅"}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {notification.type === "error" ? "Triage Notice" : notification.type === "warning" ? "Notice" : "Success"}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded-lg transition text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner / Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-xs" id="app_header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{t("appName", uiLanguage)}</h1>
              <p className="text-xs text-slate-500 font-medium">{t("appTagline", uiLanguage)}</p>
            </div>
          </div>

          {/* Role-Based Audience Toggle (Desktop/Tablet only) */}
          <div className="hidden md:flex bg-slate-100 border border-slate-200 p-1 rounded-2xl max-w-xs shadow-xs w-64">
            <button
              type="button"
              onClick={() => setAppViewMode("citizen")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                appViewMode === "citizen"
                  ? "bg-white text-slate-900 shadow-md border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>🇮🇳</span>
              <span>
                {uiLanguage === "mr" ? "नागरिक" : uiLanguage === "hi" ? "नागरिक" : "Citizen"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAppViewMode("municipal")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                appViewMode === "municipal"
                  ? "bg-white text-[#0B2545] shadow-md border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>🏢</span>
              <span>
                {uiLanguage === "mr" ? "विभाग" : uiLanguage === "hi" ? "विभाग" : "Department"}
              </span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Elegant Language Selector Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUiLanguage("en")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  uiLanguage === "en"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setUiLanguage("hi")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  uiLanguage === "hi"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setUiLanguage("mr")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  uiLanguage === "mr"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                मराठी
              </button>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {t("geminiActive", uiLanguage)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Application Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24" id="app_main">


        {appViewMode === "citizen" ? (
          <>
            
            {/* Desktop Top Sub-Tabs Selector */}
            <div className="hidden md:flex gap-6 border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => setCitizenTab("report")}
                className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 cursor-pointer ${
                  citizenTab === "report"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {uiLanguage === "mr" ? "तक्रार नोंदवा" : uiLanguage === "hi" ? "समस्या दर्ज करें" : "Report an Issue"}
              </button>
              <button
                type="button"
                onClick={() => setCitizenTab("browse")}
                className={`pb-3 text-sm font-bold transition-all border-b-2 px-1 cursor-pointer ${
                  citizenTab === "browse"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {uiLanguage === "mr" ? "तपासा आणि ट्रॅक करा" : uiLanguage === "hi" ? "खोजें और ट्रैक करें" : "Browse & Track"}
              </button>
            </div>

            {citizenTab === "report" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
                {/* Left Column: Form/Loader/Completed (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    {loading || completedReport ? (
                <div className="bg-[#002045] text-white px-5 py-4 flex items-center justify-between border-b border-[#052952] shadow-xs animate-fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-[#1a365d] text-blue-100 rounded-lg shrink-0">
                      <Shield className="h-4.5 w-4.5 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-blue-200">{t("municipalTriageCenter", uiLanguage)}</h3>
                      <p className="text-xs font-bold font-mono text-white truncate">
                        {completedReport ? `Report #${completedReport.id.slice(-5).toUpperCase()} · Pune` : tempReportId ? `Report #${tempReportId} · Pune` : "Report #NEW-TEMP · Pune"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {loading ? (
                      <>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-900">
                          {t("filterActive", uiLanguage).toUpperCase()}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] bg-blue-950 text-blue-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-blue-900 font-semibold">
                        {t("filterResolved", uiLanguage).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-b border-slate-150 bg-slate-50/50 flex">
                  <button
                    type="button"
                    onClick={() => {
                      setCitizenSubView("submit");
                      setTrackError(null);
                    }}
                    className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 border-r border-slate-200 cursor-pointer ${
                      citizenSubView === "submit"
                        ? "bg-white text-slate-900 border-b-2 border-slate-900 font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <PlusCircle className="h-4 w-4 text-slate-500" />
                    <span>{t("fileReportTab", uiLanguage)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCitizenSubView("track");
                      setTrackError(null);
                    }}
                    className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      citizenSubView === "track"
                        ? "bg-white text-slate-900 border-b-2 border-slate-900 font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Search className="h-4 w-4 text-slate-500" />
                    <span>{t("trackYourReportTab", uiLanguage)}</span>
                  </button>
                </div>
              )}
                    <div className="p-6">
                      {/* 1. Loading/Progress Panel */}
                {loading && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {t("loadingProgressTitle", uiLanguage)}
                    </p>

                    {/* Steps Container */}
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 relative pl-1">
                      <AnimatePresence initial={false}>
                        {(() => {
                          const standardSteps = [
                            "init_agent",
                            "analyze_image",
                            "validate_report",
                            "geocode_location",
                            "find_duplicate_reports",
                            liveSteps.some(s => s.name === "escalate_to_human") ? "escalate_to_human" : "score_and_route",
                            "draft_citizen_update"
                          ];

                          const stepsToRender: any[] = [...liveSteps];
                          for (const stepName of standardSteps) {
                            if (!stepsToRender.some(s => s.name === stepName)) {
                              stepsToRender.push({
                                name: stepName,
                                status: "not_started",
                                args: null,
                                result: null
                              });
                            }
                          }

                          return stepsToRender.map((step, index) => {
                            const isDup = step.name === "find_duplicate_reports";
                            const isEscalation = step.name === "escalate_to_human";
                            const isCompleted = step.status === "completed";
                            const isRunning = step.status === "running";
                            const isNotStarted = step.status === "not_started";
                            const isRetrying = step.retrying;

                            const details = renderStepDescription(step);
                            const stepIcon = getStepIcon(details.icon, step.status);
                            
                            const isDuplicateFound = isDup && isCompleted && step.result?.duplicates?.length > 0;

                            // Style configurations matching the DESIGN.md spec
                            let cardBorderClass = "border-slate-200 bg-slate-50/50";
                            let cardBgClass = "bg-slate-50/30";
                            let textTitleClass = "text-slate-800 font-semibold";
                            let textDescClass = "text-slate-500 font-normal leading-[1.65]";
                            let cardShadowClass = "shadow-[0_4px_6px_-1px_rgba(26,54,93,0.03)]";

                            if (isNotStarted) {
                              cardBorderClass = "border-slate-100 opacity-60";
                              cardBgClass = "bg-slate-50/10";
                              textTitleClass = "text-slate-400 font-semibold";
                              textDescClass = "text-slate-400 font-normal leading-[1.65]";
                              cardShadowClass = "shadow-none";
                            } else if (isRunning) {
                              cardBorderClass = "border-blue-200 ring-1 ring-blue-50/50";
                              cardBgClass = "bg-white";
                              textTitleClass = "text-[#002045] font-bold";
                              textDescClass = "text-slate-600 font-normal leading-[1.65]";
                              cardShadowClass = "shadow-[0_4px_12px_rgba(26,54,93,0.06)]";
                            } else if (isCompleted) {
                              if (isDuplicateFound) {
                                cardBorderClass = "border-amber-300 ring-1 ring-amber-100/50 bg-amber-50/20";
                                cardBgClass = "bg-amber-50/15";
                                textTitleClass = "text-amber-950 font-bold";
                                textDescClass = "text-amber-800 font-normal leading-[1.65]";
                                cardShadowClass = "shadow-[0_4px_12px_rgba(245,158,11,0.05)]";
                              } else if (isEscalation) {
                                cardBorderClass = "border-amber-300 ring-1 ring-amber-100/50 bg-amber-50/20";
                                cardBgClass = "bg-amber-50/15";
                                textTitleClass = "text-amber-950 font-bold";
                                textDescClass = "text-amber-800 font-normal leading-[1.65]";
                                cardShadowClass = "shadow-[0_4px_12px_rgba(245,158,11,0.05)]";
                              } else {
                                cardBorderClass = "border-slate-200 bg-white";
                                cardBgClass = "bg-white";
                                textTitleClass = "text-slate-800 font-bold";
                                textDescClass = "text-slate-500 font-normal leading-[1.65]";
                                cardShadowClass = "shadow-[0_4px_6px_-1px_rgba(26,54,93,0.04)]";
                              }
                            }

                            return (
                              <div key={step.name} className="relative flex gap-4 min-h-[72px]">
                                {/* Timeline vertical connector line */}
                                {index < stepsToRender.length - 1 && (
                                  <div 
                                    className={`absolute top-8 bottom-[-16px] left-4 w-[2px] z-0 transition-colors duration-300 ${
                                      isCompleted ? "bg-emerald-200" : isRunning ? "bg-blue-200 animate-pulse" : "bg-slate-200"
                                    }`}
                                  />
                                )}

                                {/* Left circular status marker */}
                                <div className="relative z-10 flex-shrink-0 mt-0.5">
                                  {isCompleted ? (
                                    isEscalation || isDuplicateFound ? (
                                      <div className="h-8 w-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs ring-1 ring-amber-100">
                                        <AlertTriangle className="h-4.5 w-4.5 animate-pulse" />
                                      </div>
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                        <Check className="h-4.5 w-4.5" />
                                      </div>
                                    )
                                  ) : isRunning ? (
                                    <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs ring-2 ring-blue-100/50">
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    </div>
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                                      <Hourglass className="h-3.5 w-3.5" />
                                    </div>
                                  )}
                                </div>

                                {/* Main card step display */}
                                <motion.div
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className={`flex-1 p-4 rounded-lg border transition-all ${cardBorderClass} ${cardBgClass} ${cardShadowClass} min-h-[64px]`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span className="shrink-0 mt-0.5">{stepIcon}</span>
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`text-xs leading-tight ${textTitleClass}`}>
                                        {details.title}
                                      </h4>
                                      <p className={`text-[11px] mt-1.5 leading-[1.65] ${textDescClass}`}>
                                        {details.desc}
                                      </p>

                                      {/* Retrying Notice */}
                                      {isRetrying && isRunning && (
                                        <div className="mt-3 text-[10px] bg-amber-50/80 text-amber-850 border border-amber-200/50 p-2.5 rounded-lg flex items-center gap-1.5 font-medium animate-pulse">
                                          <Loader2 className="h-3 w-3 animate-spin shrink-0 text-amber-500" />
                                          <span>{t("retryBusyNotice", uiLanguage, { attempt: step.retryAttempt })}</span>
                                        </div>
                                      )}

                                      {/* Duplicate highlight visual emphasis */}
                                      {isDuplicateFound && (
                                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 space-y-1">
                                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                            <span>
                                              {uiLanguage === "hi" ? "डुप्लिकेट पाई गई" : uiLanguage === "mr" ? "डुप्लिकेट आढळली" : "Duplicate Detected"}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-amber-800 font-medium leading-[1.65]">
                                            {uiLanguage === "hi" 
                                              ? `डुप्लिकेट पाई गई — रिपोर्ट #${(step.result?.duplicates?.[0]?.id || "PMC-6882").slice(-5).toUpperCase()} इसी क्षेत्र को कवर करती है। इस प्रविष्टि को पूलर साक्ष्य के रूप में जोड़ा जा रहा है।`
                                              : uiLanguage === "mr"
                                                ? `डुप्लिकेट आढळली — तक्रार #${(step.result?.duplicates?.[0]?.id || "PMC-6882").slice(-5).toUpperCase()} याच क्षेत्राला कव्हर करते. ही नोंद पूरक पुरावा म्हणून जोडली जात आहे.`
                                                : `Duplicate Detected — Report #${(step.result?.duplicates?.[0]?.id || "PMC-6882").slice(-5).toUpperCase()} covers the same area. Linking this entry as supplementary evidence.`}
                                          </p>
                                        </div>
                                      )}

                                      {/* Escalation highlight visual emphasis */}
                                      {isEscalation && isCompleted && (
                                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 space-y-1">
                                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                            <span>
                                              {uiLanguage === "hi" ? "मानव समीक्षा आवश्यक" : uiLanguage === "mr" ? "मानवी पुनरावलोकन आवश्यक" : "Human Review Escalated"}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-amber-800 font-medium leading-[1.65]">
                                            {uiLanguage === "hi" 
                                              ? `अंतिम रूटिंग पूरा करने के लिए वरिष्ठ अधिकारियों द्वारा समीक्षा लंबित है।`
                                              : uiLanguage === "mr"
                                                ? `अंतिम मार्गक्रम पूर्ण करण्यासाठी वरिष्ठ अधिकाऱ्यांकडून पुनरावलोकन प्रलंबित आहे.`
                                                : `Awaiting supervisor inspection for final municipal routing decision.`}
                                          </p>
                                        </div>
                                      )}

                                      {/* Why this assessment collapsible in active triage steps */}
                                      {isCompleted && (step.name === "analyze_image" || step.name === "score_and_route") && (step.result?.severity_justification || step.result?.routing_justification || step.result?.severityJustification || step.result?.routingJustification) && (
                                        <details className="mt-3 border-t border-slate-100 pt-2.5 group cursor-pointer">
                                          <summary className="flex items-center justify-between text-[10px] font-bold text-slate-500 hover:text-slate-850 select-none list-none [&::-webkit-details-marker]:hidden">
                                            <div className="flex items-center gap-1">
                                              <Sparkles className="h-3 w-3 text-slate-400" />
                                              <span>{t("whyAssessment", uiLanguage)}</span>
                                            </div>
                                            <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180 text-slate-400 shrink-0" />
                                          </summary>
                                          <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed font-normal bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                            {step.result?.severity_justification || step.result?.routing_justification || step.result?.severityJustification || step.result?.routingJustification}
                                          </p>
                                        </details>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            );
                          });
                        })()}
                      </AnimatePresence>
                    </div>

                    {/* Progress bar */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#002045] rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.max(10, (liveSteps.filter(s => s.status === "completed").length / 7) * 100))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {(() => {
                            const completedCount = liveSteps.filter(s => s.status === "completed").length;
                            const currentStepNum = Math.min(7, completedCount + 1);
                            if (uiLanguage === "hi") {
                              return `चरण ${currentStepNum} / 7`;
                            } else if (uiLanguage === "mr") {
                              return `टप्पा ${currentStepNum} / 7`;
                            } else {
                              return `Step ${currentStepNum} of 7`;
                            }
                          })()}
                        </span>
                        <span className="text-[10px] text-blue-850 font-bold animate-pulse">{t("processingLiveSignals", uiLanguage)}</span>
                      </div>
                    </div>
                  </div>
                )}
                      {/* 2. Completed Triage Report view */}
                {!loading && completedReport && (
                  <div className="space-y-5 bg-slate-50/20 animate-fade-in">
                    <div className="text-center py-4 space-y-2">
                      <div className="h-12 w-12 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{t("triageCompleted", uiLanguage)}</h3>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                        {t("triageCompletedDesc", uiLanguage)}
                      </p>
                    </div>

                    {/* Copyable Report ID Card */}
                    <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">REPORT ID</span>
                        <span className="text-xs font-mono font-bold text-slate-800 block truncate select-all">{completedReport.id}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(completedReport.id);
                          showToast(t("trackCopySuccess", uiLanguage), "success");
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="h-3 w-3 text-slate-500" />
                        <span>{t("trackBtnCopy", uiLanguage)}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Department and Score Badge Row */}
                      {completedReport.status === "escalated" ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3.5 rounded-xl space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 animate-pulse" />
                            <span>{t("escalatedToHumanTitle", uiLanguage)}</span>
                          </div>
                          <p className="text-xs text-amber-800 leading-normal font-medium">
                            <strong className="text-amber-950">{t("escalatedReason", uiLanguage)}</strong> {completedReport.escalationReason || "Unspecified anomaly"}
                          </p>
                          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                            {t("escalatedQueueBadge", uiLanguage)}
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("assignedUnit", uiLanguage)}</span>
                            <span className="text-xs font-bold text-slate-800 block mt-1 truncate">
                              {completedReport.assignedDepartment ? tDepartment(completedReport.assignedDepartment, uiLanguage) : "Unassigned"}
                            </span>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("severityScore", uiLanguage)}</span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-sm font-extrabold text-slate-800">
                                {completedReport.severityScore || "N/A"}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">/10</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status and Issue Type */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("classification", uiLanguage)}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(completedReport.status)}`}>
                            {tStatus(completedReport.status, uiLanguage).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">{t("issueCategory", uiLanguage)}</span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${getIssueTypeBadgeClass(completedReport.issueType || "")}`}>
                            {tIssueType(completedReport.issueType || "other", uiLanguage)}
                          </span>
                        </div>
                      </div>

                      {renderCitizenTimeline(completedReport.status)}

                      {/* Citizen Message */}
                      {completedReport.citizenUpdate && (
                        <div className="bg-[#0B2545]/5 border border-[#0B2545]/10 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-[10px] font-bold text-[#0B2545] uppercase tracking-wider block">{t("officialCitizenComm", uiLanguage)}</span>
                          <p className="text-xs text-slate-700 italic leading-relaxed">
                            "{completedReport.citizenUpdate}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTrackId(completedReport.id);
                          setTrackedReport(completedReport);
                          setCitizenSubView("track");
                          setCompletedReport(null);
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>{t("trackBtnTrackThis", uiLanguage)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedReport(null);
                          setRawLocation("");
                        }}
                        className="w-full py-2.5 bg-[#0B2545] hover:bg-[#1F4068] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{t("fileAnotherReport", uiLanguage)}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(completedReport.id)}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                        <span>{uiLanguage === "mr" ? "तक्रार हटवा" : uiLanguage === "hi" ? "शिकायत हटाएं" : "Delete Report"}</span>
                      </button>
                    </div>
                  </div>
                )}
                      <form
                  onSubmit={handleSubmitTriage}
                  className={(!loading && !completedReport && citizenSubView === "submit") ? "space-y-5" : "hidden"}
                >
                  
                  {/* Welcome Quick Start Tip */}
                  <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed flex items-start gap-2.5">
                    <span className="text-base mt-0.5">💡</span>
                    <div>
                      <p className="font-bold mb-0.5">{t("welcomeTitle", uiLanguage)}</p>
                      <p className="text-blue-700">
                        {t("welcomeText", uiLanguage)}
                      </p>
                    </div>
                  </div>

                  {/* Step 1: Image input selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      {t("step1Label", uiLanguage)}
                    </label>

                    {useCustomImage && customImage ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-100 flex flex-col items-center justify-center">
                          <img src={customImage} alt="Uploaded citizen issue" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setCustomImage(null);
                                setUseCustomImage(true);
                                setSelectedPresetId("");
                                setPhotoQualityStatus(null);
                                setPhotoQualityReasons([]);
                                setIgnoreQualityWarning(false);
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
                            >
                              {t("removePhoto", uiLanguage)}
                            </button>
                          </div>
                          <span className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Sparkles className="h-3 w-3 animate-pulse" />
                            {t("realVisionActive", uiLanguage)}
                          </span>
                        </div>

                        {/* Photo Quality Guidance UI */}
                        {photoQualityStatus === "checking" && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-600 animate-pulse">
                            <Loader2 className="h-4 w-4 text-slate-500 animate-spin shrink-0" />
                            <span className="font-semibold">{t("photoQualityChecking", uiLanguage)}</span>
                          </div>
                        )}

                        {photoQualityStatus === "good" && (
                          <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                            <span className="font-bold">{t("photoQualityGood", uiLanguage)}</span>
                          </div>
                        )}

                        {photoQualityStatus === "poor" && !ignoreQualityWarning && (
                          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                                  {t("photoQualityLabel", uiLanguage)}
                                </span>
                                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                                  {(() => {
                                    const mappedReasons = photoQualityReasons.map(r => {
                                      if (r === "blurry") return t("photoBlurryReason", uiLanguage);
                                      if (r === "too_dark") return t("photoDarkReason", uiLanguage);
                                      if (r === "low_res") return t("photoLowResReason", uiLanguage);
                                      return r;
                                    }).join(", ");
                                    return t("photoQualityWarning", uiLanguage).replace("{reason}", mappedReasons);
                                  })()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomImage(null);
                                  setUseCustomImage(true);
                                  setSelectedPresetId("");
                                  setPhotoQualityStatus(null);
                                  setPhotoQualityReasons([]);
                                  setIgnoreQualityWarning(false);
                                }}
                                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg transition cursor-pointer"
                              >
                                {t("retakeButton", uiLanguage)}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIgnoreQualityWarning(true)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer"
                              >
                                {t("continueAnywayButton", uiLanguage)}
                              </button>
                            </div>
                          </div>
                        )}

                        {photoQualityStatus === "poor" && ignoreQualityWarning && (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                              <span className="font-medium text-slate-700">Proceeding with photo warnings ignored</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomImage(null);
                                setUseCustomImage(true);
                                setSelectedPresetId("");
                                setPhotoQualityStatus(null);
                                setPhotoQualityReasons([]);
                                setIgnoreQualityWarning(false);
                              }}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                            >
                              {t("retakeButton", uiLanguage)}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : !useCustomImage && selectedPresetId ? (
                      <div className="relative rounded-xl overflow-hidden border border-amber-300 h-44 bg-amber-50/30 flex flex-col items-center justify-center p-4">
                        <img 
                          src={getPresetImageThumbnail(selectedPresetId)} 
                          alt="Preset Preview" 
                          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-multiply"
                        />
                        <div className="relative z-10 text-center space-y-2">
                          <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider inline-block">
                            {t("demoActiveBadge", uiLanguage)}
                          </span>
                          <p className="text-[11px] font-medium text-amber-950 max-w-[240px] leading-tight">
                            {t("demoActiveText", uiLanguage)}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomImage(null);
                              setUseCustomImage(true);
                              setSelectedPresetId("");
                              setRawLocation("");
                            }}
                            className="bg-slate-900 hover:bg-slate-850 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
                          >
                            {t("switchToRealPhoto", uiLanguage)}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-slate-300 transition text-center bg-slate-50/50">
                        <ImageIcon className="h-7 w-7 mx-auto text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-slate-700 block mb-1">{t("dragDropText", uiLanguage)}</span>
                        <span className="text-[10px] text-slate-400 block mb-4">{t("geminiFlashText", uiLanguage)}</span>
                        <label className="inline-flex px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 rounded-lg cursor-pointer transition shadow-2xs">
                          {t("chooseFile", uiLanguage)}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Interactive Map Location Pinning */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t("step2Label", uiLanguage)}
                      </label>
                      {hasValidKey && pinPosition && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          {t("coordinatesActive", uiLanguage)}
                        </div>
                      )}
                    </div>

                    {hasValidKey ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        {/* Map container with explicit height (to prevent map height collapse - CF2) */}
                        <div className="w-full h-64 bg-slate-100 relative" id="google_map_container">
                          <MapErrorBoundary>
                            <APIProvider apiKey={API_KEY} version="weekly">
                              <Map
                                center={mapCenter}
                                zoom={mapZoom}
                                onCenterChanged={(e) => {
                                  if (e.detail.center) setMapCenter(e.detail.center);
                                }}
                                onZoomChanged={(e) => {
                                  if (e.detail.zoom) setMapZoom(e.detail.zoom);
                                }}
                                onClick={(e) => {
                                  if (e.detail.latLng) {
                                    const lat = typeof e.detail.latLng.lat === 'function' ? (e.detail.latLng as any).lat() : e.detail.latLng.lat;
                                    const lng = typeof e.detail.latLng.lng === 'function' ? (e.detail.latLng as any).lng() : e.detail.latLng.lng;
                                    handleMapInteraction({ lat, lng });
                                  }
                                }}
                                mapId="DEMO_MAP_ID"
                                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                                style={{ width: '100%', height: '100%' }}
                                gestureHandling="greedy"
                                disableDefaultUI={false}
                              >
                                {pinPosition && (
                                  <MapErrorBoundary fallback={null}>
                                    <AdvancedMarker
                                      position={pinPosition}
                                      draggable={true}
                                      onDragEnd={(e) => {
                                        const lat = e.latLng?.lat();
                                        const lng = e.latLng?.lng();
                                        if (lat !== undefined && lng !== undefined) {
                                          handleMapInteraction({ lat, lng });
                                        }
                                      }}
                                    >
                                      <div className="relative flex flex-col items-center">
                                        {/* Outer Pulsing Aura */}
                                        <div className="absolute w-8 h-8 bg-rose-500 rounded-full opacity-30 animate-ping -translate-y-6" />
                                        {/* Custom marker shape */}
                                        <div className="relative z-10 bg-rose-600 text-white p-1.5 rounded-full shadow-lg border border-white hover:scale-110 transition flex items-center justify-center -translate-y-6">
                                          <MapPin className="h-4.5 w-4.5 fill-rose-100" />
                                        </div>
                                        {/* Little Pin shadow anchor */}
                                        <div className="w-1.5 h-1.5 bg-black/40 rounded-full blur-[1px] -translate-y-5" />
                                      </div>
                                    </AdvancedMarker>
                                  </MapErrorBoundary>
                                )}
                              </Map>
                            </APIProvider>
                          </MapErrorBoundary>

                          {isLocating && (
                            <div className="absolute inset-0 bg-white/75 flex items-center justify-center backdrop-blur-xs z-10">
                              <div className="text-center space-y-2">
                                <RefreshCw className="h-6 w-6 text-slate-800 animate-spin mx-auto" />
                                <span className="text-xs font-bold text-slate-700 block">{t("acquiringCoordinates", uiLanguage)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Address / coordinate confirmation below the map */}
                        <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-col gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base text-rose-500 shrink-0 mt-0.5">📍</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("pinnedAddress", uiLanguage)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (navigator.geolocation) {
                                      setIsLocating(true);
                                      navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                          setPinPosition(coords);
                                          setMapCenter(coords);
                                          setMapZoom(15);
                                          setIsLocating(false);
                                          reverseGeocode(coords.lat, coords.lng);
                                        },
                                        () => setIsLocating(false)
                                      );
                                    }
                                  }}
                                  className="text-[10px] text-slate-600 hover:text-slate-900 font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw className="h-2.5 w-2.5" /> {t("relocate", uiLanguage)}
                                </button>
                              </div>
                              <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 break-words">
                                {pinnedAddress || t("fetchingAddress", uiLanguage)}
                              </p>
                              {pinPosition && (
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                                  Lat: {pinPosition.lat.toFixed(6)}, Lng: {pinPosition.lng.toFixed(6)}
                                </p>
                              )}
                            </div>
                          </div>

                          <label className="flex items-center gap-2 mt-1 border-t border-slate-100 pt-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={usePinnedLocation}
                              onChange={(e) => setUsePinnedLocation(e.target.checked)}
                              className="rounded border-slate-350 text-slate-900 focus:ring-slate-950 h-3.5 w-3.5"
                            />
                            <span className="text-[11px] font-bold text-slate-700">
                              {t("attachLocation", uiLanguage)}
                            </span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      /* Graceful Fallback: When no key is set or offline */
                      <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 text-center space-y-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl inline-block">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{t("mapUnavailableHeader", uiLanguage)}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                            {t("mapUnavailableText", uiLanguage)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Raw Location text */}
                  <div>
                    <label htmlFor="input_raw_location" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("step3Label", uiLanguage)}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <textarea
                        id="input_raw_location"
                        rows={2}
                        value={rawLocation}
                        onChange={(e) => {
                          setRawLocation(e.target.value);
                          setUseCustomImage(true); // switch to custom when manually edited
                          setSelectedPresetId("");
                        }}
                        placeholder={t("step3Placeholder", uiLanguage)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-sm placeholder:text-slate-400"
                        required={!usePinnedLocation || !pinPosition}
                      />
                    </div>
                  </div>

                  {/* Step 4: Language Selector */}
                  <div>
                    <label htmlFor="select_language" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("step4Label", uiLanguage)}
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <select
                        id="select_language"
                        value={language}
                        onChange={(e) => {
                          setLanguage(e.target.value);
                          setUseCustomImage(true); // switch to custom when manually edited
                          setSelectedPresetId("");
                        }}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-sm bg-white"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="mr">मराठी (Marathi)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="te">తెలుగు (Telugu)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="kn">ಕನ್ನಡ (Kannada)</option>
                        <option value="gu">ગુજરાતી (Gujarati)</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !useCustomImage ||
                      !customImage ||
                      !(hasValidKey ? (usePinnedLocation ? !!pinPosition : !!rawLocation.trim()) : !!rawLocation.trim())
                    }
                    className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-sm font-bold tracking-tight transition shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                    id="btn_submit_triage"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                    <span>{t("submitButton", uiLanguage)}</span>
                  </button>
                </form>

                {/* Track Your Report panel inside citizenTab === "report" */}
                {!loading && !completedReport && citizenSubView === "track" && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Tracking Input Header */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t("trackStatusHeading", uiLanguage)}
                      </h3>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={searchTrackId}
                            onChange={(e) => setSearchTrackId(e.target.value)}
                            placeholder={t("trackPlaceholder", uiLanguage)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none font-mono"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleTrackReport();
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTrackReport()}
                          disabled={isTrackingLoading}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                        >
                          {isTrackingLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Search className="h-3.5 w-3.5" />
                          )}
                          <span>{t("trackButton", uiLanguage)}</span>
                        </button>
                      </div>
                    </div>

                    {/* Error Alert */}
                    {trackError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <p className="font-semibold">{trackError}</p>
                      </div>
                    )}

                    {/* Tracking Results */}
                    {trackedReport ? (
                      <div className="space-y-4 border-t border-slate-100 pt-4 animate-fade-in">
                        {/* Tracked Report Info */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">REPORT STATUS</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(trackedReport.status)}`}>
                              {tStatus(trackedReport.status, uiLanguage).toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CATEGORY</span>
                              <span className={`inline-block mt-1 font-bold px-2 py-0.5 rounded-md ${getIssueTypeBadgeClass(trackedReport.issueType || "")}`}>
                                {tIssueType(trackedReport.issueType || "other", uiLanguage)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WARD UNIT</span>
                              <span className="text-slate-800 block mt-1 font-bold truncate">
                                {trackedReport.assignedDepartment ? tDepartment(trackedReport.assignedDepartment, uiLanguage) : "Unassigned"}
                              </span>
                            </div>
                          </div>

                          {/* Location and Date */}
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LOCATION</span>
                              <p className="text-slate-700 font-medium mt-0.5 leading-normal">
                                {trackedReport.formattedAddress || trackedReport.rawLocation}
                              </p>
                            </div>
                            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Filed: {new Date(trackedReport.createdAt).toLocaleDateString()}</span>
                              {trackedReport.severityScore && (
                                <span className="font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">Severity: {trackedReport.severityScore}/10</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Timeline */}
                        {renderCitizenTimeline(trackedReport.status)}

                        {/* AI-drafted Official resident notification status message */}
                        {trackedReport.citizenUpdate && (
                          <div className="bg-[#0B2545]/5 border border-[#0B2545]/10 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0B2545] uppercase tracking-wider">
                              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                              <span>OFFICIAL UPDATE</span>
                            </div>
                            <p className="text-xs text-slate-700 italic leading-relaxed font-medium bg-white p-3 rounded-lg border border-[#0B2545]/5">
                              "{trackedReport.citizenUpdate}"
                            </p>
                          </div>
                        )}

                        {/* Estimated Resolution Context */}
                        {(() => {
                          const dept = (trackedReport.assignedDepartment || "").toLowerCase();
                          let days = 5;
                          if (dept.includes("water") || dept.includes("जल")) days = 3;
                          else if (dept.includes("waste") || dept.includes("कचरा") || dept.includes("घन")) days = 2;
                          else if (dept.includes("road") || dept.includes("रस्ता") || dept.includes("यातायात") || dept.includes("pwd")) days = 4;
                          
                          const deptName = trackedReport.assignedDepartment 
                            ? tDepartment(trackedReport.assignedDepartment, uiLanguage) 
                            : "PWD";

                          return (
                            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
                              <span className="text-base mt-0.5">⏱️</span>
                              <div>
                                <p className="font-bold mb-0.5">Estimated Resolution</p>
                                <p className="text-blue-700">
                                  {t("trackEstResolution", uiLanguage, { days, department: deptName })}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Corroboration Stats & Live Corroborate Button */}
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-800">
                              {t("trackCorroborations", uiLanguage, { count: trackedReport.corroborationCount || 1 })}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/reports/${trackedReport.id}/corroborate`, {
                                  method: "POST"
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  showToast("Report corroborated successfully!", "success");
                                  handleTrackReport(trackedReport.id);
                                  fetchReports();
                                }
                              } catch (err) {
                                console.error(err);
                                showToast("Failed to corroborate", "error");
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Corroborate</span>
                          </button>
                        </div>

                        {/* Option to Delete Report for citizens */}
                        <div className="border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(trackedReport.id)}
                            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            <span>{uiLanguage === "mr" ? "तक्रार हटवा" : uiLanguage === "hi" ? "शिकायत हटाएं" : "Delete Report"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                        <Search className="h-8 w-8 text-slate-350 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-500">
                          {uiLanguage === "mr" ? "स्थिती पाहण्यासाठी वरील तक्रार आयडी प्रविष्ट करा" : uiLanguage === "hi" ? "स्थिति देखने के लिए ऊपर शिकायत आईडी दर्ज करें" : "Enter a Report ID above to view its live status"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Presets & Guide (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Horizontal Separation */}
                {!loading && !completedReport && (
                  <>
                    <div className="relative flex py-5 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        {t("orChoosePreset", uiLanguage)}
                      </span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-700">{t("sandboxSamplesTitle", uiLanguage)}</h3>
                        <p className="text-[10px] text-slate-500">
                          {t("sandboxSamplesText", uiLanguage)}
                        </p>
                      </div>

                      {/* Preset List Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PRESETS.map((preset) => {
                          const PresetIcon = preset.icon;
                          const isSelected = selectedPresetId === preset.id && !useCustomImage;
                          const localizedLabel = tPresetLabel(preset.id, uiLanguage, preset.label);
                          const localizedDesc = tPresetDesc(preset.id, uiLanguage, preset.description);
                          const localizedBadge = tPresetBadge(preset.id, uiLanguage, preset.badge);
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectPreset(preset.id)}
                              className={`flex flex-col items-start p-2.5 text-left border rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 w-full">
                                <PresetIcon className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-600' : 'text-slate-500'}`} />
                                <span className="text-xs font-bold text-slate-800 line-clamp-1">{localizedLabel}</span>
                              </div>
                              <p className="text-[9px] text-slate-500 line-clamp-1 mb-1">{localizedDesc}</p>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                                preset.badge.includes("Escalation") || preset.badge.includes("Low")
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : preset.badge.includes("Duplicate")
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}>
                                {localizedBadge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
                  {/* Citizen Onboarding & Guide */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 rounded-2xl p-5 shadow-lg space-y-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-amber-400">
                <Info className="h-5 w-5 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">{t("guideHeader", uiLanguage)}</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {t("guideWelcome", uiLanguage)}
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="flex gap-2.5 items-start">
                  <span className="flex-shrink-0 flex items-center justify-center bg-slate-700 text-amber-300 rounded-full h-5 w-5 text-[11px] font-bold">1</span>
                  <div className="text-[11px] text-slate-300 leading-normal">
                    <strong className="text-white font-semibold block">{t("guideStep1Title", uiLanguage)}</strong>
                    <span>{t("guideStep1Desc", uiLanguage)}</span>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="flex-shrink-0 flex items-center justify-center bg-slate-700 text-amber-300 rounded-full h-5 w-5 text-[11px] font-bold">2</span>
                  <div className="text-[11px] text-slate-300 leading-normal">
                    <strong className="text-white font-semibold block">{t("guideStep2Title", uiLanguage)}</strong>
                    <span>{t("guideStep2Desc", uiLanguage)}</span>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="flex-shrink-0 flex items-center justify-center bg-slate-700 text-amber-300 rounded-full h-5 w-5 text-[11px] font-bold">3</span>
                  <div className="text-[11px] text-slate-300 leading-normal">
                    <strong className="text-white font-semibold block">{t("guideStep3Title", uiLanguage)}</strong>
                    <span>{t("guideStep3Desc", uiLanguage)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex justify-between items-center text-[10px] text-slate-400">
                <span>{t("guideFooterLandmarks", uiLanguage)}</span>
                <span className="text-amber-400 font-semibold">{t("guideFooterSupport", uiLanguage)}</span>
              </div>
            </div>
          
                </div>
              </div>
            )}
            {citizenTab === "browse" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
                {/* Left Column: Search & Track (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Search and Corroborate Existing Issues (Avoid Duplicates) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05)] p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Search className="h-5 w-5 text-[#1a365d]" />
                <h3 className="text-sm font-bold text-[#1a365d]">
                  {uiLanguage === "mr" ? "तक्रार नोंदवण्यापूर्वी तपासा" : uiLanguage === "hi" ? "शिकायत दर्ज करने से पहले जांचें" : "Check Existing Issues"}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {uiLanguage === "mr" 
                  ? "तुमच्या परिसरात आधीच नोंदवलेल्या समस्या तपासा. जर समस्या आधीच नोंदवली असेल, तर नवीन तक्रार करण्याऐवजी त्याचे समर्थन करा!" 
                  : uiLanguage === "hi" 
                    ? "अपने क्षेत्र में पहले से दर्ज समस्याओं की जांच करें। यदि समस्या पहले से दर्ज है, तो नई शिकायत करने के बजाय उसका समर्थन करें!" 
                    : "Avoid creating duplicate reports. Search below and corroborate existing active reports to boost their resolution priority!"}
              </p>

              {/* Search inputs */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={citizenSearchText}
                    onChange={(e) => setCitizenSearchText(e.target.value)}
                    placeholder={uiLanguage === "mr" ? "रस्ता, परिसर किंवा समस्या शोधा..." : uiLanguage === "hi" ? "सड़क, क्षेत्र या समस्या खोजें..." : "Search street, locality, keyword..."}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {uiLanguage === "mr" ? "प्रवर्ग" : uiLanguage === "hi" ? "श्रेणी" : "Category"}
                    </label>
                    <select
                      value={citizenCategoryFilter}
                      onChange={(e) => setCitizenCategoryFilter(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white text-slate-700"
                    >
                      <option value="all">{uiLanguage === "mr" ? "सर्व प्रवर्ग" : uiLanguage === "hi" ? "सभी श्रेणियां" : "All Categories"}</option>
                      {Object.entries(issueTypeTranslations[uiLanguage] || issueTypeTranslations.en).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {uiLanguage === "mr" ? "तीव्रता" : uiLanguage === "hi" ? "गंभीरता" : "Severity"}
                    </label>
                    <select
                      value={citizenSeverityFilter}
                      onChange={(e) => setCitizenSeverityFilter(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white text-slate-700"
                    >
                      <option value="all">{uiLanguage === "mr" ? "सर्व" : uiLanguage === "hi" ? "सभी" : "All"}</option>
                      <option value="high">{uiLanguage === "mr" ? "उच्च (Grade 7+)" : uiLanguage === "hi" ? "उच्च (Grade 7+)" : "High (Grade 7+)"}</option>
                      <option value="medium">{uiLanguage === "mr" ? "मध्यम (Grade 4-6)" : uiLanguage === "hi" ? "मध्यम (Grade 4-6)" : "Medium (Grade 4-6)"}</option>
                      <option value="low">{uiLanguage === "mr" ? "कमी (Grade 1-3)" : uiLanguage === "hi" ? "कम (Grade 1-3)" : "Low (Grade 1-3)"}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-60 overflow-y-auto pt-2 border-t border-slate-100">
                {citizenFilteredReports.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-4">
                    {uiLanguage === "mr" ? "जुळणाऱ्या कोणत्याही समस्या आढळल्या नाहीत." : uiLanguage === "hi" ? "कोई मेल खाती हुई समस्या नहीं मिली।" : "No matching active issues found."}
                  </p>
                ) : (
                  citizenFilteredReports.map(rep => (
                    <div key={rep.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition text-left space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
                          #{rep.id.slice(-5).toUpperCase()}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${getStatusBadgeClass(rep.status)}`}>
                          {tStatus(rep.status, uiLanguage).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {rep.formattedAddress || rep.rawLocation}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        "{rep.rawLocation}"
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/60">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${getIssueTypeBadgeClass(rep.issueType || "")}`}>
                          {tIssueType(rep.issueType || "other", uiLanguage)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold font-mono">
                          <Users className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{rep.corroborationCount || 1}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCorroborateReport(rep.id)}
                        className="w-full mt-1.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ThumbsUp className="h-3 w-3 text-emerald-600" />
                        <span>
                          {uiLanguage === "mr" ? "या तक्रारीचे समर्थन करा" : uiLanguage === "hi" ? "इस शिकायत का समर्थन करें" : "Corroborate This Issue"}
                        </span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
                  {/* Track Your Report panel */}
                {!loading && !completedReport && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Tracking Input Header */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t("trackStatusHeading", uiLanguage)}
                      </h3>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={searchTrackId}
                            onChange={(e) => setSearchTrackId(e.target.value)}
                            placeholder={t("trackPlaceholder", uiLanguage)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none font-mono"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleTrackReport();
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTrackReport()}
                          disabled={isTrackingLoading}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                        >
                          {isTrackingLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Search className="h-3.5 w-3.5" />
                          )}
                          <span>{t("trackButton", uiLanguage)}</span>
                        </button>
                      </div>
                    </div>

                    {/* Error Alert */}
                    {trackError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <p className="font-semibold">{trackError}</p>
                      </div>
                    )}

                    {/* Tracking Results */}
                    {trackedReport ? (
                      <div className="space-y-4 border-t border-slate-100 pt-4 animate-fade-in">
                        {/* Tracked Report Info */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">REPORT STATUS</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(trackedReport.status)}`}>
                              {tStatus(trackedReport.status, uiLanguage).toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CATEGORY</span>
                              <span className={`inline-block mt-1 font-bold px-2 py-0.5 rounded-md ${getIssueTypeBadgeClass(trackedReport.issueType || "")}`}>
                                {tIssueType(trackedReport.issueType || "other", uiLanguage)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WARD UNIT</span>
                              <span className="text-slate-800 block mt-1 font-bold truncate">
                                {trackedReport.assignedDepartment ? tDepartment(trackedReport.assignedDepartment, uiLanguage) : "Unassigned"}
                              </span>
                            </div>
                          </div>

                          {/* Location and Date */}
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LOCATION</span>
                              <p className="text-slate-700 font-medium mt-0.5 leading-normal">
                                {trackedReport.formattedAddress || trackedReport.rawLocation}
                              </p>
                            </div>
                            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Filed: {new Date(trackedReport.createdAt).toLocaleDateString()}</span>
                              {trackedReport.severityScore && (
                                <span className="font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">Severity: {trackedReport.severityScore}/10</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Timeline */}
                        {renderCitizenTimeline(trackedReport.status)}

                        {/* AI-drafted Official resident notification status message */}
                        {trackedReport.citizenUpdate && (
                          <div className="bg-[#0B2545]/5 border border-[#0B2545]/10 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0B2545] uppercase tracking-wider">
                              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                              <span>OFFICIAL UPDATE</span>
                            </div>
                            <p className="text-xs text-slate-700 italic leading-relaxed font-medium bg-white p-3 rounded-lg border border-[#0B2545]/5">
                              "{trackedReport.citizenUpdate}"
                            </p>
                          </div>
                        )}

                        {/* Estimated Resolution Context */}
                        {(() => {
                          const dept = (trackedReport.assignedDepartment || "").toLowerCase();
                          let days = 5;
                          if (dept.includes("water") || dept.includes("जल")) days = 3;
                          else if (dept.includes("waste") || dept.includes("कचरा") || dept.includes("घन")) days = 2;
                          else if (dept.includes("road") || dept.includes("रस्ता") || dept.includes("यातायात") || dept.includes("pwd")) days = 4;
                          
                          const deptName = trackedReport.assignedDepartment 
                            ? tDepartment(trackedReport.assignedDepartment, uiLanguage) 
                            : "PWD";

                          return (
                            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
                              <span className="text-base mt-0.5">⏱️</span>
                              <div>
                                <p className="font-bold mb-0.5">Estimated Resolution</p>
                                <p className="text-blue-700">
                                  {t("trackEstResolution", uiLanguage, { days, department: deptName })}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Corroboration Stats & Live Corroborate Button */}
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-800">
                              {t("trackCorroborations", uiLanguage, { count: trackedReport.corroborationCount || 1 })}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/reports/${trackedReport.id}/corroborate`, {
                                  method: "POST"
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  showToast("Report corroborated successfully!", "success");
                                  handleTrackReport(trackedReport.id);
                                  fetchReports();
                                }
                              } catch (err) {
                                console.error(err);
                                showToast("Failed to corroborate", "error");
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Corroborate</span>
                          </button>
                        </div>

                        {/* Option to Delete Report for citizens */}
                        <div className="border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(trackedReport.id)}
                            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            <span>{uiLanguage === "mr" ? "तक्रार हटवा" : uiLanguage === "hi" ? "शिकायत हटाएं" : "Delete Report"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      !isTrackingLoading && (
                        <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                          <Activity className="h-8 w-8 mx-auto text-slate-300 mb-2 animate-pulse" />
                          <p className="text-xs font-semibold">Enter a Report ID above to track its live status</p>
                          <p className="text-[10px] text-slate-400 mt-1">Status changes made by municipal team reflect instantly on load</p>
                        </div>
                      )
                    )}

                    {/* Back to Portal Switcher */}
                    <button
                      type="button"
                      onClick={() => setCitizenSubView("submit")}
                      className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>{t("trackBtnBack", uiLanguage)}</span>
                    </button>
                  </div>
                )}
                </div>

                {/* Right Column: Map, List, Details (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                  {hotspot && (
                    <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-amber-950 block">{t("statHotspot", uiLanguage)}</strong>
                          <p className="text-[11px] text-amber-800 truncate">
                            {t("hotspotAlert", uiLanguage, { count: hotspot.count, location: hotspot.location })}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDashboardMapCenter({ lat: hotspot.lat, lng: hotspot.lng });
                          setDashboardMapZoom(15);
                        }}
                        className="px-3 py-1 bg-white hover:bg-amber-100/40 border border-amber-300 text-amber-950 text-[10px] font-bold rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Focus
                      </button>
                    </div>
                  )}

                  {/* Centerpiece Map Display */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-1">
                    <div className="w-full h-80 sm:h-96 relative rounded-xl overflow-hidden" id="dashboard_map_viewport">
                      {hasValidKey ? (
                        <MapErrorBoundary fallback={
                          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center p-6 text-center">
                            <p className="text-xs text-slate-500">Map rendering suspended. Standard text controls remain active.</p>
                          </div>
                        }>
                          <APIProvider apiKey={API_KEY} version="weekly">
                            <Map
                              center={dashboardMapCenter}
                              zoom={dashboardMapZoom}
                              onCenterChanged={(e) => {
                                if (e.detail.center) setDashboardMapCenter(e.detail.center);
                              }}
                              onZoomChanged={(e) => {
                                if (e.detail.zoom) setDashboardMapZoom(e.detail.zoom);
                              }}
                              mapId="DEMO_CIVIC_MAP_ID"
                              style={{ width: '100%', height: '100%' }}
                              gestureHandling="greedy"
                              disableDefaultUI={false}
                            >
                              {reports.map((report) => {
                                if (!report.latitude || !report.longitude) return null;

                                const isSelected = selectedReportId === report.id;
                                const isFilteredOut = !filteredReports.some(fr => fr.id === report.id);

                                // Status color codes
                                let pinColor = "bg-amber-500 shadow-amber-200";
                                if (report.status === "resolved") {
                                  pinColor = "bg-emerald-500 shadow-emerald-200";
                                } else if (report.status === "escalated" || (report.severityScore && report.severityScore >= 7)) {
                                  pinColor = "bg-rose-600 shadow-rose-200";
                                }

                                return (
                                  <AdvancedMarker
                                    key={`dashpin-${report.id}`}
                                    position={{ lat: report.latitude, lng: report.longitude }}
                                    onClick={() => {
                                      setSelectedReportId(report.id);
                                      setOpenInfoWindowId(report.id);
                                    }}
                                  >
                                    <div className={`relative flex flex-col items-center transition-all duration-300 ${isFilteredOut ? 'opacity-40 scale-90' : 'opacity-100 scale-100 z-10'}`}>
                                      {isSelected && (
                                        <div className="absolute w-8 h-8 bg-slate-900 rounded-full opacity-35 animate-ping -translate-y-5" />
                                      )}
                                      <div className={`relative z-10 ${pinColor} text-white p-1 rounded-full shadow-md border border-white hover:scale-115 transition-all flex items-center justify-center -translate-y-5 cursor-pointer`}>
                                        <MapPin className="h-3 w-3 fill-white/20" />
                                      </div>
                                    </div>
                                  </AdvancedMarker>
                                );
                              })}

                              {/* InfoWindow for Active Pin */}
                              {openInfoWindowId && (() => {
                                const activeReport = reports.find(r => r.id === openInfoWindowId);
                                if (!activeReport || !activeReport.latitude || !activeReport.longitude) return null;
                                return (
                                  <InfoWindow
                                    position={{ lat: activeReport.latitude, lng: activeReport.longitude }}
                                    onCloseClick={() => setOpenInfoWindowId(null)}
                                  >
                                    <div className="p-2 max-w-64 text-xs space-y-2 font-sans" id={`infowindow_${activeReport.id}`}>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[9px] font-mono font-bold text-slate-400">{activeReport.id}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getStatusBadgeClass(activeReport.status)}`}>
                                          {tStatus(activeReport.status, uiLanguage)}
                                        </span>
                                        {activeReport.issueType && (
                                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${getIssueTypeBadgeClass(activeReport.issueType)}`}>
                                            {tIssueType(activeReport.issueType, uiLanguage)}
                                          </span>
                                        )}
                                      </div>

                                      <p className="font-bold text-slate-800 line-clamp-1">{activeReport.formattedAddress || activeReport.rawLocation}</p>
                                      <p className="text-[10px] text-slate-500 line-clamp-2">"{activeReport.rawLocation}"</p>

                                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[9px] text-slate-400">
                                        <span>{new Date(activeReport.createdAt).toLocaleDateString()}</span>
                                        {activeReport.severityScore && (
                                          <span className="font-bold text-rose-600 font-mono">Grade: {activeReport.severityScore}/10</span>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => {
                                          setSelectedReportId(activeReport.id);
                                          const detailsEl = document.getElementById("div_report_details");
                                          if (detailsEl) detailsEl.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        className="w-full text-center py-1 bg-slate-900 hover:bg-slate-850 text-white text-[10px] font-bold rounded-lg transition mt-1.5 cursor-pointer"
                                      >
                                        {t("detailedTriage", uiLanguage)}
                                      </button>
                                    </div>
                                  </InfoWindow>
                                );
                              })()}
                            </Map>
                          </APIProvider>
                        </MapErrorBoundary>
                      ) : (
                        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center text-center p-6 space-y-3">
                          <MapPin className="h-10 w-10 text-slate-400 animate-bounce" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("mapUnavailableHeader", uiLanguage)}</h4>
                            <p className="text-[11px] text-slate-500 max-w-sm mt-1 leading-normal">
                              {t("mapUnavailableText", uiLanguage)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connected Reports List Panel */}
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <List className="h-5 w-5 text-slate-700" />
                        <h2 className="text-sm font-bold text-slate-800">{t("reportsRegistry", uiLanguage, { count: filteredReports.length })}</h2>
                      </div>
                      
                      {/* Tab filters */}
                      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                        <button
                          onClick={() => setActiveTab("all")}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                            activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {t("filterAll", uiLanguage)}
                        </button>
                        <button
                          onClick={() => setActiveTab("active")}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                            activeTab === "active" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {t("filterActive", uiLanguage)}
                        </button>
                        <button
                          onClick={() => setActiveTab("resolved")}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                            activeTab === "resolved" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {t("filterResolved", uiLanguage)}
                        </button>
                        <button
                          onClick={() => setActiveTab("escalated")}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                            activeTab === "escalated" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {t("filterNeedsReview", uiLanguage)}
                        </button>
                      </div>
                    </div>

                    {/* Reports List */}
                    <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                      {filteredReports.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                          <Info className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-semibold">{t("noReportsFoundTitle", uiLanguage)}</p>
                          <p className="text-xs">{t("noReportsFoundText", uiLanguage)}</p>
                        </div>
                      ) : (
                        filteredReports.map((report) => {
                          const isSelected = selectedReportId === report.id;
                          return (
                            <div
                              key={report.id}
                              onClick={() => {
                                setSelectedReportId(report.id);
                                if (report.latitude && report.longitude) {
                                  setDashboardMapCenter({ lat: report.latitude, lng: report.longitude });
                                  setDashboardMapZoom(14);
                                }
                                setOpenInfoWindowId(report.id);
                              }}
                              className={`p-4 flex gap-4 items-start cursor-pointer transition ${
                                isSelected ? "bg-slate-50/80 border-l-4 border-slate-900" : "hover:bg-slate-50/40"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                                <img
                                  src={report.imageUrl.startsWith("data:") ? report.imageUrl : getPresetImageThumbnail(report.imageUrl)}
                                  alt="Issue"
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              {/* Content text metadata */}
                              <div className="flex-grow min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                                    {report.id}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(report.status)}`}>
                                    {tStatus(report.status, uiLanguage)}
                                  </span>
                                  {report.issueType && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getIssueTypeBadgeClass(report.issueType)}`}>
                                      {tIssueType(report.issueType, uiLanguage)}
                                    </span>
                                  )}
                                  {report.severityScore && (
                                    <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded-md border border-red-100">
                                      {t("severityGrade", uiLanguage)}: {report.severityScore}/10
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                  {report.formattedAddress || report.rawLocation}
                                </p>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {t("originalDesc", uiLanguage)} "{report.rawLocation}"
                                </p>
                                
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {report.assignedDepartment && (
                                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                      <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                                      {tDepartment(report.assignedDepartment, uiLanguage)}
                                    </span>
                                  )}
                                  {report.status !== "duplicate" && (
                                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Users className="h-3 w-3 text-emerald-500" />
                                      {report.corroborationCount && report.corroborationCount > 1
                                        ? t("corroborationPlural", uiLanguage, { count: report.corroborationCount })
                                        : t("corroborationSingular", uiLanguage)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action arrow */}
                              <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                                <ArrowRight className={`h-4 w-4 text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-slate-800' : ''}`} />
                                {report.status === "resolved" && (
                                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-2" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

           {/* Selected Report Triage Detail View & Agent Logs */}
          
                  {selectedReport ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="div_report_details">
                {/* Header detail */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-slate-800">
                        {t("detailedTriage", uiLanguage)}
                      </h3>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {selectedReport.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {t("submittedAt", uiLanguage, { time: new Date(selectedReport.createdAt).toLocaleString() })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedReport.status !== "resolved" && (
                      <button
                        onClick={() => handleResolveReport(selectedReport.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200/50 transition flex items-center gap-1"
                        id={`btn_resolve_${selectedReport.id}`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t("markResolved", uiLanguage)}
                      </button>
                    )}
                  </div>
                </div>

                {/* Intelligent Fallback Banner */}
                {selectedReport.isFallbackAgent && (
                  <div className="mx-6 mt-6 p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 leading-relaxed flex items-start gap-2.5 shadow-sm">
                    <span className="text-sm mt-0.5">⚠️</span>
                    <div>
                      <p className="font-bold mb-0.5 text-amber-950">Intelligent Fallback Active (AI Quota Limit Exceeded)</p>
                      <p className="text-amber-700 font-medium">
                        The public Gemini API has reached its free tier rate limit. The citizen portal automatically switched to its built-in local autonomous heuristics engine to successfully process and register your report without delay.
                      </p>
                    </div>
                  </div>
                )}

                {/* Dashboard layout of details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 border-b border-slate-100">
                  {/* Left Column: Image and details */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-100 relative shadow-inner">
                      <img
                        src={selectedReport.imageUrl.startsWith("data:") ? selectedReport.imageUrl : getPresetImageThumbnail(selectedReport.imageUrl)}
                        alt="Triage Capture"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {t("originalCapture", uiLanguage)}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t("citizenRequestProfile", uiLanguage)}</div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">{t("locationDesc", uiLanguage)}</p>
                        <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-2 rounded-lg italic">
                          "{selectedReport.rawLocation}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 justify-between pt-1">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Languages className="h-3.5 w-3.5" /> {t("languageLabel", uiLanguage)}
                        </span>
                        <span className="text-xs font-bold uppercase text-slate-700 bg-white border border-slate-150 px-2 py-0.5 rounded-md">
                          {selectedReport.language}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Triage results */}
                  <div className="md:col-span-7 space-y-4">
                     {/* Status overview cards */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       <div className="bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("triageResolution", uiLanguage)}</span>
                         <div className="flex items-center gap-2">
                           <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(selectedReport.status)}`}>
                             {tStatus(selectedReport.status, uiLanguage)}
                           </span>
                         </div>
                       </div>

                       <div className="bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("issueClassification", uiLanguage)}</span>
                         <span className={`text-xs font-bold px-2.5 py-1 rounded-md inline-block uppercase tracking-wider ${getIssueTypeBadgeClass(selectedReport.issueType || "other")}`}>
                           {selectedReport.issueType ? tIssueType(selectedReport.issueType, uiLanguage) : t("pendingEvaluation", uiLanguage)}
                         </span>
                       </div>

                       <div className="bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl flex flex-col justify-between">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("communityConsensus", uiLanguage)}</span>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                           <Users className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                           <span className="truncate">
                             {selectedReport.status === "duplicate" 
                               ? uiLanguage === "hi" ? "डुप्लिकेट के रूप में लिंक" : uiLanguage === "mr" ? "डुप्लिकेट म्हणून लिंक" : "Linked Duplicate"
                               : selectedReport.corroborationCount && selectedReport.corroborationCount > 1
                                 ? t("corroborationPlural", uiLanguage, { count: selectedReport.corroborationCount })
                                 : t("corroborationSingular", uiLanguage)}
                           </span>
                         </div>
                       </div>
                     </div>

                    {/* Geocoding result card */}
                    <div className="border border-slate-200/60 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <span>{t("geocodedMatch", uiLanguage)}</span>
                        {selectedReport.latitude && (
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded-sm">
                            {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude?.toFixed(4)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-800">
                        <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="font-semibold line-clamp-1">{selectedReport.formattedAddress || t("pendingEvaluation", uiLanguage)}</span>
                      </div>
                    </div>

                    {/* Auto routing / scoring */}
                    {selectedReport.status === "duplicate" ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>{t("duplicateDetectedTitle", uiLanguage)}</span>
                        </div>
                        <p className="text-xs text-amber-800 leading-normal">
                          {t("duplicateDetectedText", uiLanguage, { duplicateOf: selectedReport.duplicateOf || "" })}
                        </p>
                      </div>
                    ) : selectedReport.status === "escalated" ? (
                      <div className="bg-rose-50 border border-rose-200 text-rose-950 p-3.5 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                          <ShieldAlert className="h-4 w-4 text-rose-600 animate-bounce" />
                          <span>{t("escalatedToHumanTitle", uiLanguage)}</span>
                        </div>
                        <p className="text-xs text-rose-800 leading-normal font-medium">
                          <strong className="text-rose-950">{t("escalatedReason", uiLanguage)}</strong> {selectedReport.escalationReason || "Unspecified anomaly"}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md inline-block">
                          {t("escalatedQueueBadge", uiLanguage)}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="border border-slate-200/60 p-3 rounded-xl sm:col-span-4 flex flex-col justify-center items-center text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("severityGrade", uiLanguage)}</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-slate-900">{selectedReport.severityScore || "—"}</span>
                            <span className="text-xs text-slate-400 font-medium">/ 10</span>
                          </div>
                        </div>

                        <div className="border border-slate-200/60 p-3 rounded-xl sm:col-span-8 space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("assignedDepartment", uiLanguage)}</span>
                            <p className="text-xs font-bold text-slate-800">
                              {selectedReport.assignedDepartment ? tDepartment(selectedReport.assignedDepartment, uiLanguage) : t("notAssigned", uiLanguage)}
                            </p>
                          </div>
                          {selectedReport.severityCues && selectedReport.severityCues.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {selectedReport.severityCues.map((cue, idx) => (
                                <span key={idx} className="text-[9px] bg-slate-100 border border-slate-150 text-slate-600 px-1.5 py-0.5 rounded-sm">
                                  {cue}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Explainability Layer: Why this assessment? */}
                    {(selectedReport.severityJustification || selectedReport.routingJustification) && (
                      <details className="mt-3.5 border border-slate-200/60 bg-slate-50/20 rounded-xl overflow-hidden group">
                        <summary className="flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50/50 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-slate-500" />
                            <span>{t("whyAssessment", uiLanguage)}</span>
                          </div>
                          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180 text-slate-400 shrink-0" />
                        </summary>
                        <div className="p-4 border-t border-slate-200/50 text-xs text-slate-600 space-y-3.5 bg-white">
                          {selectedReport.severityJustification && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {uiLanguage === "hi" ? "गंभीरता का औचित्य" : uiLanguage === "mr" ? "तीव्रतेचे समर्थन" : "Severity Justification"}
                              </span>
                              <p className="leading-relaxed font-medium text-slate-700">
                                {selectedReport.severityJustification}
                              </p>
                            </div>
                          )}
                          {selectedReport.routingJustification && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {uiLanguage === "hi" ? "मार्गक्रमण स्पष्टीकरण" : uiLanguage === "mr" ? "मार्गक्रमण स्पष्टीकरण" : "Routing Explanation"}
                              </span>
                              <p className="leading-relaxed font-medium text-slate-700">
                                {selectedReport.routingJustification}
                              </p>
                            </div>
                          )}
                        </div>
                      </details>
                    )}


                    {/* Citizen Corroborate Action Button */}
                    {appViewMode === "citizen" && selectedReport.status !== "resolved" && selectedReport.status !== "duplicate" && (
                      <button
                        type="button"
                        onClick={() => handleCorroborateReport(selectedReport.id)}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-4"
                      >
                        <ThumbsUp className="h-4 w-4 text-emerald-600" />
                        <span>
                          {uiLanguage === "mr" ? "या तक्रारीचे समर्थन करा (मी देखील बाधित आहे)" : uiLanguage === "hi" ? "इस शिकायत का समर्थन करें (मैं भी प्रभावित हूँ)" : "Corroborate: I'm Also Affected"}
                        </span>
                      </button>
                    )}

                    {renderCitizenTimeline(selectedReport.status)}

                    {/* Citizen message preview */}
                    {selectedReport.citizenUpdate && (
                      <div className="border border-slate-200/60 bg-slate-50/40 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                          <span>Citizen Progress Notification (en)</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic bg-white border border-slate-100 p-2.5 rounded-lg shadow-2xs">
                          "{selectedReport.citizenUpdate}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            ) : null}
                </div>
              </div>
            )}
          </>
        ) : (
          renderMunicipalDashboard()
        )}
      </main>

      {/* Footer metadata */}
      <footer className="border-t border-slate-200/60 bg-white py-8 mt-12" id="app_footer">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">
            {t("footerText", uiLanguage)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            {t("footerPort", uiLanguage)}
          </p>
        </div>
      </footer>

      {/* Sticky Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe font-sans">
        <div className="flex justify-around items-center py-2">
          {/* Tab A: Report an Issue */}
          <button
            type="button"
            onClick={() => {
              setAppViewMode("citizen");
              setCitizenTab("report");
            }}
            className={`flex flex-col items-center gap-1 py-1 cursor-pointer transition-colors ${
              appViewMode === "citizen" && citizenTab === "report"
                ? "text-slate-900 font-bold"
                : "text-slate-400 hover:text-slate-650"
            }`}
          >
            <PlusCircle className="h-5 w-5" />
            <span className="text-[10px] tracking-tight font-bold">
              {uiLanguage === "mr" ? "तक्रार नोंदवा" : uiLanguage === "hi" ? "समस्या दर्ज करें" : "Report"}
            </span>
          </button>

          {/* Tab B: Browse & Track */}
          <button
            type="button"
            onClick={() => {
              setAppViewMode("citizen");
              setCitizenTab("browse");
            }}
            className={`flex flex-col items-center gap-1 py-1 cursor-pointer transition-colors ${
              appViewMode === "citizen" && citizenTab === "browse"
                ? "text-slate-900 font-bold"
                : "text-slate-400 hover:text-slate-650"
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] tracking-tight font-bold">
              {uiLanguage === "mr" ? "तपासा व ट्रॅक" : uiLanguage === "hi" ? "खोजें व ट्रैक" : "Browse & Track"}
            </span>
          </button>

          {/* Municipal View */}
          <button
            type="button"
            onClick={() => {
              setAppViewMode("municipal");
            }}
            className={`flex flex-col items-center gap-1 py-1 cursor-pointer transition-colors ${
              appViewMode === "municipal"
                ? "text-[#0B2545] font-bold"
                : "text-slate-400 hover:text-slate-650"
            }`}
          >
            <Shield className="h-5 w-5" />
            <span className="text-[10px] tracking-tight font-bold">
              {uiLanguage === "mr" ? "विभाग" : uiLanguage === "hi" ? "विभाग" : "Department"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
