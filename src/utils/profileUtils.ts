// project/src/utils/profileUtils.ts
import type { UserProfile } from '../types';

export function updateProfileFromMessage(
  message: string,
  currentProfile: UserProfile | null
): Partial<UserProfile> | null {
  const content = message.toLowerCase();
  let updates: Partial<UserProfile> = {};
  let hasUpdates = false;

  // Nickname detection
  if (!currentProfile?.nickname) {
    const namePatterns = [
      /(?:ben|benim|adım|ismim)\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+(?:\s+[a-zA-ZçğıöşüÇĞİÖŞÜ]+)?)/i
    ];
    for (const pattern of namePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const detectedName = match[1].trim();
        if (detectedName.length > 1 && detectedName.length < 50) {
          updates.nickname = detectedName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          hasUpdates = true;
          break;
        }
      }
    }
  }

  // Interest detection
  const activitySuffixMap: Record<string, string> = {
    "yapmayı": "yapmak", "etmeyi": "etmek", "okumayı": "okumak",
    "izlemeyi": "izlemek", "dinlemeyi": "dinlemek", "oynamayı": "oynamak",
    "gezmeyi": "gezmek", "yüzmeyi": "yüzmek", "koşmayı": "koşmak",
    "çalmayı": "çalmak", "çözmeyi": "çözmek", "geliştirmeyi": "geliştirmek",
    "yazmayı": "yazmak", "çizmeyi": "çizmek", "araştırmayı": "araştırmak"
    // Add more activity suffixes and their infinitive forms if needed
  };
  const activitySuffixesForRegex = Object.keys(activitySuffixMap).join('|');

  // Patterns are designed to capture the object/phrase of interest.
  // Group 1 is typically the target phrase.
  const interestPatterns = [
    // Verb first: "severim [X]", "ilgi duyuyorum [Y]"
    /(?:severim|seviyorum|hoşlanıyorum|bayılıyorum|ilgi duyuyorum|ilgilenirim|meraklıyım)\s+(.+?)(?:\.|,|!|\?|;|ama|fakat|çünkü|ve|ancak|ya da|$)/gi,
    // Specific phrasing: "hobim [X]", "ilgim var [Y]"
    /(?:hobim|hobilerim|ilgim var)\s+(.+?)(?:\.|,|!|\?|;|ama|fakat|çünkü|ve|ancak|ya da|$)/gi,
    // "ilgimi çekiyor [X]"
    /(?:ilgimi çekiyor|ilgileniyorum)\s+(.+?)(?:\.|,|!|\?|;|ama|fakat|çünkü|ve|ancak|ya da|$)/gi,
    // "en sevdiğim şey [X]"
    /(?:en sevdiğim|favori)\s+(?:şey|aktivite|konu|film|müzik|kitap|oyun|spor|yemek|yer|alan|uğraş)\s+(.+?)(?:\.|,|!|\?|;|ama|fakat|çünkü|ve|ancak|ya da|$)/gi,
    // "[X yapmayı/etmeyi/...] severim": Captures "X" and the activity verb separately
    /(.+?)\s+(?:yapmayı|etmeyi|okumayı|izlemeyi|dinlemeyi|oynamayı|gezmeyi|yüzmeyi|koşmayı|çalmayı|çözmeyi|geliştirmeyi|yazmayı|çizmeyi|araştırmayı)\s+(?:severim|seviyorum|hoşlanıyorum)/gi,
    // "ben [X yapmaya] meraklısıyım" (captures "X yapmaya")
    /ben\s+(.+?)\s+(?:meraklısıyım|tutkunuyum|hayranıyım)(?:\.|,|!|\?|;|ama|fakat|çünkü|ve|ancak|ya da|$)/gi,
    // "hobilerim arasında [X] var"
    /(?:hobilerim arasında|ilgi alanlarım arasında)\s+(.+?)(?:\.|vardır|bulunur|$)/gi
  ];

  const currentInterestsList = currentProfile?.interests || [];
  const currentInterestsSet = new Set(currentInterestsList.map(i => i.toLowerCase()));
  let newlyExtractedInterests: string[] = [];

  for (const pattern of interestPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let phrase = (match[1] || match[2] || match[3] || match[4] || match[5]).trim().toLowerCase();

      // Remove trailing conjunctions or punctuation that might have been captured by (.+?)
      phrase = phrase.replace(/(?:\s*(?:ama|fakat|çünkü|ve|ancak|ya da|ile|gibi))*\s*[.!?;]*$/, "").trim();
      
      // For patterns like "(.+?) (çözmeyi) (severim)", match[1] is the noun, match[2] (from pattern) is the activity.
      // The current regex structure (match[1] etc.) assumes the primary interest is in the first significant capture group.
      // If pattern 5 matched: "Matematik çözmeyi severim" -> `match[1]` is "matematik" (because `(.+?)` is greedy before the activity list)
      // Let's refine this specific pattern to capture the noun and the activity separately if possible, or process `phrase`.

      if (!phrase) continue;

      // Split by common delimiters for multiple interests BEFORE further cleaning
      const subPhrases = phrase.split(/,?\s*(?:ve|veya|ile|ya da|gibi|ayrıca|hem de)\s*|,/);

      for (let p of subPhrases) {
        p = p.trim();
        if (!p) continue;

        let cleanedInterest = p;

        // Handle phrases like "X yapmayı", "Y okumayı" to form "X yapmak", "Y okumak" or just "X", "Y"
        // Check if the phrase ends with one of the activity suffixes
        const activityEndingMatch = cleanedInterest.match(new RegExp(`^(.*?)(\\s+(?:${activitySuffixesForRegex}))$`));

        if (activityEndingMatch) {
          const baseNoun = activityEndingMatch[1].trim(); // e.g., "matematik" from "matematik çözmeyi"
          const suffix = activityEndingMatch[2].trim();   // e.g., "çözmeyi"
          if (activitySuffixMap[suffix] && baseNoun) {
            // Option 1: Form "Matematik Çözmek"
            cleanedInterest = `${baseNoun} ${activitySuffixMap[suffix]}`;
            // Option 2: Just take the base noun "Matematik" (can be added as a separate step if needed)
            // For now, let's prefer "Matematik Çözmek" for "Matematik çözmeyi"
          } else if (baseNoun) {
            // If suffix not in map, just use the base noun part
            cleanedInterest = baseNoun;
          }
        }
        
        // Remove common filler words. Be careful not to remove parts of multi-word interests.
        // This is a simple approach, might need a more sophisticated NLP technique for perfect accuracy.
        cleanedInterest = cleanedInterest
          .replace(/\b(çok|biraz|fazla|gibi|şeyler|konular|aktiviteler|şey)\b/g, '') // Remove very generic fillers
          .replace(/\s+/g, ' ') // Normalize multiple spaces
          .trim();

        // Final checks after all cleaning
        if (cleanedInterest.length > 2 && cleanedInterest.length < 70 && !/\d/.test(cleanedInterest)) {
          // Avoid adding if it's just a remnant suffix or very short meaningless string
          if (activitySuffixMap.hasOwnProperty(cleanedInterest) || Object.values(activitySuffixMap).includes(cleanedInterest)) {
              continue;
          }


          if (!currentInterestsSet.has(cleanedInterest.toLowerCase())) {
            if (!newlyExtractedInterests.some(nei => nei.toLowerCase() === cleanedInterest.toLowerCase())) {
              const capitalizedInterest = cleanedInterest
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              newlyExtractedInterests.push(capitalizedInterest);
              hasUpdates = true;
            }
          }
        }
      }
    }
  }
  
  if (newlyExtractedInterests.length > 0) {
    const combinedInterests = [...currentInterestsList];
    newlyExtractedInterests.forEach(newInterest => {
      // Double check to prevent duplicates if currentInterestsList was empty or changed
      if (!combinedInterests.some(ci => ci.toLowerCase() === newInterest.toLowerCase())) {
        combinedInterests.push(newInterest);
      }
    });
    updates.interests = combinedInterests;
  }

  if (hasUpdates) {
    return {
      ...updates,
      lastUpdated: Date.now(),
      isProfileComplete: !!(updates.nickname || currentProfile?.nickname) || currentProfile?.isProfileComplete,
    };
  }

  return null;
}