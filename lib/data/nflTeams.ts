import type { Team } from "@/lib/types";

/**
 * All 32 NFL teams, hardcoded for now (there is no `Teams` tab).
 *
 * `controlledBy` is the L_CAREERS `USER` value for the three human coaches.
 * If team control ever changes, either edit here or introduce a `Teams` tab
 * and load it through `lib/data/sheets.ts` like everything else.
 */
export const NFL_TEAMS: Team[] = [
  // ---- AFC East ----
  { id: "BUF", city: "Buffalo", name: "Bills", abbreviation: "BUF", conference: "AFC", division: "East", primaryColor: "#00338D", secondaryColor: "#C60C30" },
  { id: "MIA", city: "Miami", name: "Dolphins", abbreviation: "MIA", conference: "AFC", division: "East", primaryColor: "#008E97", secondaryColor: "#FC4C02" },
  { id: "NE", city: "New England", name: "Patriots", abbreviation: "NE", conference: "AFC", division: "East", primaryColor: "#002244", secondaryColor: "#C60C30" },
  { id: "NYJ", city: "New York", name: "Jets", abbreviation: "NYJ", conference: "AFC", division: "East", primaryColor: "#125740", secondaryColor: "#FFFFFF" },

  // ---- AFC North ----
  { id: "BAL", city: "Baltimore", name: "Ravens", abbreviation: "BAL", conference: "AFC", division: "North", primaryColor: "#241773", secondaryColor: "#9E7C0C" },
  { id: "CIN", city: "Cincinnati", name: "Bengals", abbreviation: "CIN", conference: "AFC", division: "North", primaryColor: "#FB4F14", secondaryColor: "#000000" },
  { id: "CLE", city: "Cleveland", name: "Browns", abbreviation: "CLE", conference: "AFC", division: "North", primaryColor: "#311D00", secondaryColor: "#FF3C00" },
  { id: "PIT", city: "Pittsburgh", name: "Steelers", abbreviation: "PIT", conference: "AFC", division: "North", primaryColor: "#101820", secondaryColor: "#FFB612" },

  // ---- AFC South ----
  { id: "HOU", city: "Houston", name: "Texans", abbreviation: "HOU", conference: "AFC", division: "South", primaryColor: "#03202F", secondaryColor: "#A71930" },
  { id: "IND", city: "Indianapolis", name: "Colts", abbreviation: "IND", conference: "AFC", division: "South", primaryColor: "#002C5F", secondaryColor: "#A2AAAD" },
  { id: "JAX", city: "Jacksonville", name: "Jaguars", abbreviation: "JAX", conference: "AFC", division: "South", primaryColor: "#101820", secondaryColor: "#D7A22A" },
  { id: "TEN", city: "Tennessee", name: "Titans", abbreviation: "TEN", conference: "AFC", division: "South", primaryColor: "#0C2340", secondaryColor: "#4B92DB" },

  // ---- AFC West ----
  { id: "DEN", city: "Denver", name: "Broncos", abbreviation: "DEN", conference: "AFC", division: "West", primaryColor: "#FB4F14", secondaryColor: "#002244" },
  { id: "KC", city: "Kansas City", name: "Chiefs", abbreviation: "KC", conference: "AFC", division: "West", primaryColor: "#E31837", secondaryColor: "#FFB81C" },
  { id: "LV", city: "Las Vegas", name: "Raiders", abbreviation: "LV", conference: "AFC", division: "West", primaryColor: "#000000", secondaryColor: "#A5ACAF" },
  { id: "LAC", city: "Los Angeles", name: "Chargers", abbreviation: "LAC", conference: "AFC", division: "West", primaryColor: "#0080C6", secondaryColor: "#FFC20E" },

  // ---- NFC East ----
  { id: "DAL", city: "Dallas", name: "Cowboys", abbreviation: "DAL", conference: "NFC", division: "East", primaryColor: "#003594", secondaryColor: "#869397", controlledBy: "LUKE" },
  { id: "NYG", city: "New York", name: "Giants", abbreviation: "NYG", conference: "NFC", division: "East", primaryColor: "#0B2265", secondaryColor: "#A71930" },
  { id: "PHI", city: "Philadelphia", name: "Eagles", abbreviation: "PHI", conference: "NFC", division: "East", primaryColor: "#004C54", secondaryColor: "#A5ACAF" },
  { id: "WAS", city: "Washington", name: "Commanders", abbreviation: "WAS", conference: "NFC", division: "East", primaryColor: "#5A1414", secondaryColor: "#FFB612" },

  // ---- NFC North ----
  { id: "CHI", city: "Chicago", name: "Bears", abbreviation: "CHI", conference: "NFC", division: "North", primaryColor: "#0B162A", secondaryColor: "#C83803" },
  { id: "DET", city: "Detroit", name: "Lions", abbreviation: "DET", conference: "NFC", division: "North", primaryColor: "#0076B6", secondaryColor: "#B0B7BC", controlledBy: "RYAN" },
  { id: "GB", city: "Green Bay", name: "Packers", abbreviation: "GB", conference: "NFC", division: "North", primaryColor: "#203731", secondaryColor: "#FFB612", controlledBy: "NATHAN" },
  { id: "MIN", city: "Minnesota", name: "Vikings", abbreviation: "MIN", conference: "NFC", division: "North", primaryColor: "#4F2683", secondaryColor: "#FFC62F" },

  // ---- NFC South ----
  { id: "ATL", city: "Atlanta", name: "Falcons", abbreviation: "ATL", conference: "NFC", division: "South", primaryColor: "#A71930", secondaryColor: "#000000" },
  { id: "CAR", city: "Carolina", name: "Panthers", abbreviation: "CAR", conference: "NFC", division: "South", primaryColor: "#0085CA", secondaryColor: "#101820" },
  { id: "NO", city: "New Orleans", name: "Saints", abbreviation: "NO", conference: "NFC", division: "South", primaryColor: "#D3BC8D", secondaryColor: "#101820" },
  { id: "TB", city: "Tampa Bay", name: "Buccaneers", abbreviation: "TB", conference: "NFC", division: "South", primaryColor: "#D50A0A", secondaryColor: "#34302B" },

  // ---- NFC West ----
  { id: "ARI", city: "Arizona", name: "Cardinals", abbreviation: "ARI", conference: "NFC", division: "West", primaryColor: "#97233F", secondaryColor: "#000000" },
  { id: "LAR", city: "Los Angeles", name: "Rams", abbreviation: "LAR", conference: "NFC", division: "West", primaryColor: "#003594", secondaryColor: "#FFA300" },
  { id: "SF", city: "San Francisco", name: "49ers", abbreviation: "SF", conference: "NFC", division: "West", primaryColor: "#AA0000", secondaryColor: "#B3995D" },
  { id: "SEA", city: "Seattle", name: "Seahawks", abbreviation: "SEA", conference: "NFC", division: "West", primaryColor: "#002244", secondaryColor: "#69BE28" },
];

export const CONTROLLED_TEAMS = NFL_TEAMS.filter((t) => t.controlledBy);
