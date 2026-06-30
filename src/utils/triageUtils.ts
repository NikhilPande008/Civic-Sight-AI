export interface CategoryKeywords {
  category: string;
  keywords: { word: string; weight: number }[];
  defaultCues: string[];
}

export const civicCategories: CategoryKeywords[] = [
  {
    category: "pothole",
    keywords: [
      { word: "pothole", weight: 5 },
      { word: "potholes", weight: 5 },
      { word: "crater", weight: 4 },
      { word: "road hole", weight: 4 },
      { word: "broken road", weight: 3 },
      { word: "asphalt", weight: 2 },
      { word: "tarmac", weight: 2 },
      { word: "pit", weight: 2 },
      { word: "trench", weight: 2 },
      { word: "गड्ढा", weight: 5 },
      { word: "गड्ढे", weight: 5 },
      { word: "खड्डा", weight: 5 },
      { word: "खड्डे", weight: 5 }
    ],
    defaultCues: ["surface defect", "traffic obstruction", "hazardous road hole"]
  },
  {
    category: "trash",
    keywords: [
      { word: "garbage", weight: 5 },
      { word: "trash", weight: 5 },
      { word: "litter", weight: 4 },
      { word: "waste", weight: 4 },
      { word: "dump", weight: 4 },
      { word: "rubbish", weight: 3 },
      { word: "debris", weight: 3 },
      { word: "overflowing", weight: 3 },
      { word: "bin", weight: 2 },
      { word: "dustbin", weight: 2 },
      { word: "कचरा", weight: 5 },
      { word: "कचराकुंडी", weight: 5 },
      { word: "घाण", weight: 4 }
    ],
    defaultCues: ["illegal dumping", "unpleasant odor", "scattered trash bags"]
  },
  {
    category: "streetlight",
    keywords: [
      { word: "streetlight", weight: 5 },
      { word: "street light", weight: 5 },
      { word: "light", weight: 3 },
      { word: "dark", weight: 3 },
      { word: "bulb", weight: 3 },
      { word: "lamp", weight: 3 },
      { word: "electricity", weight: 2 },
      { word: "blackout", weight: 4 },
      { word: "darkness", weight: 3 },
      { word: "wiring", weight: 2 },
      { word: "पथदिवा", weight: 5 },
      { word: "दिवा", weight: 4 },
      { word: "लाईट", weight: 4 }
    ],
    defaultCues: ["non-functional streetlight", "reduced safety at night", "dark sidewalk"]
  },
  {
    category: "water_leak",
    keywords: [
      { word: "water", weight: 3 },
      { word: "leak", weight: 5 },
      { word: "leakage", weight: 5 },
      { word: "burst", weight: 4 },
      { word: "pipe", weight: 4 },
      { word: "pipeline", weight: 4 },
      { word: "flood", weight: 3 },
      { word: "drain", weight: 3 },
      { word: "sewer", weight: 3 },
      { word: "spill", weight: 3 },
      { word: "overflow", weight: 3 },
      { word: "पाणी", weight: 5 },
      { word: "गळती", weight: 5 }
    ],
    defaultCues: ["water wastage", "flooded lane", "broken pipeline drainage"]
  },
  {
    category: "graffiti",
    keywords: [
      { word: "graffiti", weight: 5 },
      { word: "vandalism", weight: 4 },
      { word: "paint", weight: 3 },
      { word: "spray", weight: 3 },
      { word: "wall", weight: 2 },
      { word: "defacement", weight: 4 },
      { word: "scribble", weight: 3 },
      { word: "भित्तिचित्र", weight: 5 },
      { word: "विद्रुपीकरण", weight: 5 }
    ],
    defaultCues: ["unauthorized street art", "spray painted defacement"]
  }
];

// Helper to determine asset-specific dynamic duplication radius (in meters)
export function getDuplicationRadius(issueType: string): number {
  const normalized = (issueType || "").toLowerCase().trim();
  switch (normalized) {
    case "pothole":
      return 20; // Needs exact lane precision to avoid merging separate road holes
    case "streetlight":
      return 30; // Individual lamp post spacing
    case "graffiti":
      return 15; // Distinct properties or tag locations
    case "trash":
      return 50; // Trash piles cover corner zones/blocks
    case "water_leak":
      return 100; // Flooded blocks/leak pipeline zones
    default:
      return 40; // Default fallback
  }
}

// TF-IDF-inspired weighted semantic text classification for autonomous local triage
export function classifyTextHeuristics(text: string): { category: string; confidence: number; cues: string[] } {
  const normalized = text.toLowerCase();
  let bestCategory = "other";
  let maxScore = 0;
  let bestCues: string[] = ["unspecified defect", "reported by resident"];

  for (const cat of civicCategories) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (normalized.includes(kw.word)) {
        score += kw.weight;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat.category;
      bestCues = cat.defaultCues;
    }
  }

  let confidence = 0.5;
  if (maxScore > 0) {
    confidence = Math.min(0.95, 0.6 + (maxScore / 15) * 0.35);
  }

  return {
    category: bestCategory,
    confidence: parseFloat(confidence.toFixed(2)),
    cues: bestCues
  };
}

// Autonomous routing with sub-categorization scoring & routing rules
export async function handleScoreAndRoute(
  issue_type: string, 
  severity_cues: string[] = [], 
  sub_category: string | null = null
): Promise<{ severity_score: number; assigned_department: string; routing_justification: string }> {
  const normType = (issue_type || "").toLowerCase().trim();
  const normSub = (sub_category || "").toLowerCase().trim();

  let assigned_department = "Public Works Department (PWD)";
  let severity_score = 5;
  let routing_justification = "Routed to Public Works Department (PWD) by default";

  if (normType.includes("pothole") || normType.includes("road") || normType.includes("damage")) {
    assigned_department = "Public Works Department (PWD)";
    severity_score = 7;
    routing_justification = "Routed to Public Works (PWD) because: category = pothole/road damage (Infrastructure rule)";
  } else if (normType.includes("water") || normType.includes("leak") || normType.includes("sewer") || normType.includes("drain")) {
    assigned_department = "Water Supply & Sewerage Department";
    severity_score = 8;
    routing_justification = "Routed to Water Supply & Sewerage Department because: category = water leak/drainage (Utility rule)";
  } else if (normType.includes("trash") || normType.includes("garbage") || normType.includes("solid") || normType.includes("waste")) {
    assigned_department = "Solid Waste Management";
    severity_score = 4;
    routing_justification = "Routed to Solid Waste Management because: category = trash/garbage (Sanitation rule)";
  } else if (normType.includes("streetlight") || normType.includes("light") || normType.includes("lamp")) {
    assigned_department = "Street Lighting Department";
    severity_score = 5;
    routing_justification = "Routed to Street Lighting Department because: category = streetlight/lamp (Electrical rule)";
  } else if (normType.includes("manhole") || normType.includes("drainage") || normType.includes("flood")) {
    assigned_department = "Municipal Corporation - Storm Water Drainage";
    severity_score = 9;
    routing_justification = "Routed to Storm Water Drainage because: category = manhole/drainage (Safety rule)";
  } else if (normType.includes("graffiti") || normType.includes("vandalism") || normType.includes("estate")) {
    assigned_department = "Municipal Corporation - Estate Department";
    severity_score = 3;
    routing_justification = "Routed to Estate Department because: category = graffiti/vandalism (Beautification rule)";
  } else if (normType === "other" && normSub) {
    if (normSub === "stray_animal") {
      assigned_department = "Municipal Animal Husbandry & Veterinary Department";
      severity_score = 6;
      routing_justification = "Routed to Veterinary Department because: category = other -> sub_category = stray_animal (Animal welfare/public hazard rule)";
    } else if (normSub === "park_maintenance") {
      assigned_department = "Parks and Gardens Department";
      severity_score = 4;
      routing_justification = "Routed to Parks and Gardens Department because: category = other -> sub_category = park_maintenance (Public spaces rule)";
    } else if (normSub === "unpruned_tree") {
      assigned_department = "Municipal Tree Authority & Garden Department";
      severity_score = 7;
      routing_justification = "Routed to Tree Authority because: category = other -> sub_category = unpruned_tree (Hazard mitigation rule)";
    } else if (normSub === "abandoned_vehicle") {
      assigned_department = "Traffic Police & RTO Department";
      severity_score = 5;
      routing_justification = "Routed to Traffic & RTO because: category = other -> sub_category = abandoned_vehicle (Encroachment rule)";
    } else if (normSub === "encroachment") {
      assigned_department = "Anti-Encroachment Department";
      severity_score = 6;
      routing_justification = "Routed to Anti-Encroachment because: category = other -> sub_category = encroachment (Public transit/road-space rule)";
    } else if (normSub === "noise_complaint") {
      assigned_department = "Environmental Protection & Noise Control Cell";
      severity_score = 5;
      routing_justification = "Routed to Environmental Protection because: category = other -> sub_category = noise_complaint (Acoustic nuisance rule)";
    }
  }

  // Double-tier severity cue evaluation
  if (severity_cues && severity_cues.length > 0) {
    // 1. Multiplicity check
    if (severity_cues.length >= 3) {
      severity_score = Math.min(10, severity_score + 1);
    } else if (severity_cues.length === 1) {
      severity_score = Math.max(1, severity_score - 1);
    }

    // 2. Critical keywords escalation
    const criticalCues = ["hazard", "danger", "burst", "obstruction", "blackout", "flooded", "unsafe", "गळती"];
    const hasCritical = severity_cues.some(cue => 
      criticalCues.some(crit => cue.toLowerCase().includes(crit))
    );
    if (hasCritical) {
      severity_score = Math.min(10, severity_score + 1);
      routing_justification += " [Score Escalated due to severe environmental/infrastructure risk indicators]";
    }
  }

  return {
    severity_score,
    assigned_department,
    routing_justification
  };
}
