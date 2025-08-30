
export interface NameResult {
  name: string;
  meaning?: string;
  origin?: string;
  gender?: string;
}

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
