
export interface NameResult {
  name: string;
  meaning?: string;
  origin?: string;
  gender?: string;
}

export const stripCodeFences = (text: string): string => {
  if (!text) return text;
  const trimmed = text.trim();
  const fenceRegex = /^\s*```(?:json|javascript|js|ts|txt)?\s*\r?\n([\s\S]*?)\r?\n```\s*$/i;
  const match = trimmed.match(fenceRegex);
  if (match) return match[1].trim();
  // Also handle inline fenced blocks that may not exactly match above
  return trimmed.replace(/^```(?:[^\n]*)?\n?/, '').replace(/```$/, '').trim();
};

export const tryParseJson = <T = unknown>(text: string): T | null => {
  try {
    const cleaned = stripCodeFences(text);
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
};

export const parseNamesFromText = (text: string): NameResult[] => {
  const names: NameResult[] = [];
  
  // Remove emoji and clean up the text
  const cleanText = text.replace(/👶|✨/g, '').trim();
  
  // Split by numbered items (1., 2., 3., etc.)
  const nameEntries = cleanText.split(/\d+\.\s+/).filter(entry => entry.trim());
  
  for (const entry of nameEntries) {
    // Skip header lines and recommendation notes
    if (entry.includes('Suggested Baby Name') || entry.includes('Recommendation Note')) {
      continue;
    }
    
    // Extract name (usually in **bold** format)
    const nameMatch = entry.match(/\*\*([^*]+)\*\*/);
    if (!nameMatch) continue;
    
    const name = nameMatch[1].trim();
    
    // Extract meaning (text after — or - and before parentheses)
    const meaningMatch = entry.match(/[—-]\s*["']([^"']+)["']|[—-]\s*([^(]+)/);
    const meaning = meaningMatch ? (meaningMatch[1] || meaningMatch[2])?.trim() : undefined;
    
    // Extract language from parentheses
    const languageMatch = entry.match(/Language:\s*([^,)]+)/i);
    const origin = languageMatch ? languageMatch[1].trim() : undefined;
    
    // Extract gender from context or assume from the request
    const genderMatch = entry.match(/Gender:\s*([^,)]+)/i);
    let gender = genderMatch ? genderMatch[1].trim() : undefined;
    
    // If no explicit gender, try to infer from context
    if (!gender && (entry.toLowerCase().includes('boy') || entry.toLowerCase().includes('male'))) {
      gender = 'Boy';
    } else if (!gender && (entry.toLowerCase().includes('girl') || entry.toLowerCase().includes('female'))) {
      gender = 'Girl';
    }
    
    names.push({
      name,
      meaning,
      origin,
      gender
    });
  }
  
  return names;
};
