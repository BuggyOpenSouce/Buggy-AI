// project/src/utils/api.ts
import { AI_PROVIDERS, SITE_URL, SITE_NAME, SYSTEM_PROMPT } from '../config';
import type { Message, UserProfile, AISettings, DailyJournalEntry, JournalLogItem } from '../types';

let currentProviderIndex = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 30000; // 30 saniye

export function getCurrentProvider() {
  return {
    index: currentProviderIndex,
    name: `Yapay Zeka ${currentProviderIndex + 1}`
  };
}

export async function setCurrentProvider(index: number) {
  if (index >= 0 && index < AI_PROVIDERS.length) {
    currentProviderIndex = index;
  } else {
    console.warn(`Geçersiz sağlayıcı dizini ayarlanmaya çalışıldı: ${index}. 0'a sıfırlanıyor.`);
    currentProviderIndex = 0;
  }
}

function formatJournalForPrompt(journal: DailyJournalEntry[], maxDays: number = 2, maxLogsPerDay: number = 3): string {
  if (!journal || journal.length === 0) return "";

  let formattedJournal = "";
  const recentDays = journal.slice(-maxDays).reverse(); // En son günlerden başla

  for (const dailyEntry of recentDays) {
    formattedJournal += `\nTarih: ${dailyEntry.date}\n`;
    const recentLogs = dailyEntry.logs.slice(-maxLogsPerDay);
    for (const log of recentLogs) {
      const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const rolePrefix = log.type === 'user' ? "Kullanıcı:" : "Asistan:";
      // İçeriği kısaltarak prompt'u çok uzatmaktan kaçın
      const shortContent = log.content.length > 150 ? log.content.substring(0, 147) + "..." : log.content;
      formattedJournal += `- (${logTime}) ${rolePrefix} ${shortContent}\n`;
    }
  }
  return formattedJournal.trim();
}

export async function makeAPIRequest(
  messages: Message[],
  userProfile?: UserProfile | null,
  aiSettings?: AISettings | null,
  journal?: DailyJournalEntry[] | null
) {
  let attempts = 0;
  const maxAttempts = AI_PROVIDERS.length * MAX_RETRIES;

  const localAISettings = aiSettings || JSON.parse(localStorage.getItem('aiSettings') || '{}');
  const maxTokens = localAISettings.maxTokens || 2048;
  const temperature = localAISettings.temperature || 0.7;
  const importantPoints = localAISettings.importantPoints || [];
  const discussedTopicsFromSettings = localAISettings.discussedTopics || [];

  let systemPromptContent = SYSTEM_PROMPT;

  // Günlük içeriğini prompt'a ekle
  const recentJournalEntriesString = journal ? formatJournalForPrompt(journal) : "";
  if (recentJournalEntriesString) {
    systemPromptContent = systemPromptContent
        .replace('{{#if recentJournalEntries}}', '')
        .replace('{{recentJournalEntries}}', recentJournalEntriesString)
        .replace('{{/if}}', '');
  } else {
     systemPromptContent = systemPromptContent
        .replace(/\{\{#if recentJournalEntries\}\}[\s\S]*?\{\{\/if\}\}/g, ''); // Placeholder'ı ve koşulunu kaldır
  }

  if (userProfile && userProfile.nickname && userProfile.nickname !== 'Guest') {
    let interestsStringWithStatus = '';
    if (userProfile.interests && userProfile.interests.length > 0) {
      const discussedTopicsMap = new Map(
        discussedTopicsFromSettings.map(dt => [dt.topic.toLowerCase(), dt.discussed])
      );
      interestsStringWithStatus = userProfile.interests.map(interest => {
        const isDiscussed = discussedTopicsMap.get(interest.toLowerCase());
        const status = isDiscussed ? ' (bu konu hakkında yakın zamanda konuşuldu)' : ' (bu konu hakkında henüz konuşulmadı)';
        return `${interest}${status}`;
      }).join(', ');
    }

    systemPromptContent = systemPromptContent
      .replace('{{#if userProfile}}', '')
      .replace('{{userProfile.nickname}}', userProfile.nickname)
      .replace('{{#if userProfile.interests_string_with_status}}', interestsStringWithStatus ? '' : '')
      .replace('{{userProfile.interests_string_with_status}}', interestsStringWithStatus)
      .replace(/\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g, '') 
      .replace(/\{\{\/if\}\}/g, '');
  } else {
    const elseMatch = SYSTEM_PROMPT.match(/\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/);
    let baseElseContent = elseMatch ? elseMatch[1].trim() : "Merhaba! Ben BuggyAI. Seninle tanışmak isterim. Bana biraz kendinden bahseder misin?";
    
    // Temel Markdown talimatlarını "else" bloğuna da ekleyelim.
    // Bu talimatlar ana prompt'tan kaldırılıp sadece buraya eklenebilir veya her iki yerde de tutulabilir.
    // Şimdilik, eğer userProfile yoksa, Markdown talimatlarının eklendiğinden emin olalım.
    const markdownInstruction = "Lütfen cevaplarında metin formatlaması için Markdown sözdizimini kullan. Kalın metin için **metin**, italik için *metin*, üstü çizili için ~~metin~~ ve altı çizili için <u>metin</u> kullanabilirsin. Matematiksel ifadeler için LaTeX sözdizimini satır içinde $ifade$ veya blok olarak $$ifade$$ şeklinde kullan.";
    if (!baseElseContent.includes(markdownInstruction.substring(0,30))) { // Basit bir kontrol
        baseElseContent += `\n\n${markdownInstruction}`;
    }

    systemPromptContent = systemPromptContent.replace(/\{\{#if userProfile\}\}[\s\S]*?(\{\{else\}\}[\s\S]*?)?\{\{\/if\}\}/g, baseElseContent);
    // Kalan placeholder'ları temizle
    systemPromptContent = systemPromptContent.replace(/\{\{userProfile\.nickname\}\}/g, 'Kullanıcı');
    systemPromptContent = systemPromptContent.replace(/\{\{#if userProfile\.interests_string_with_status\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }
  
  systemPromptContent = (importantPoints.length > 0
    ? `${systemPromptContent}\n\nÖnemli Noktalar:\n${importantPoints.map((point: string) => `- ${point}`).join('\n')}`
    : systemPromptContent
  ).trim();

  while (attempts < maxAttempts) {
    try {
      const provider = AI_PROVIDERS[currentProviderIndex];
      if (!provider) {
        console.error("Geçersiz sağlayıcı dizini, 0'a sıfırlanıyor");
        await setCurrentProvider(0);
        attempts++;
        continue;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const formattedMessages = messages.map(msg => {
        if (msg.images && msg.images.length > 0) {
          return {
            role: msg.role,
            content: [
              { type: "text", text: msg.content },
              ...msg.images.map(imageUrl => ({
                type: "image_url",
                image_url: { url: imageUrl }
              }))
            ]
          };
        }
        return { role: msg.role, content: msg.content };
      });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${provider.key}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: "system", content: systemPromptContent },
            ...formattedMessages
          ],
          temperature: temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Hatası (${response.status}), sağlayıcı ${provider.id}:`, errorBody);
        throw new Error(`API isteği ${response.status} durumuyla başarısız oldu`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content && data.choices?.[0]?.message?.content !== "") {
        console.error('API\'den geçersiz yanıt formatı:', data);
        throw new Error('API\'den geçersiz yanıt formatı');
      }
      
      return data;

    } catch (error) {
      console.error(`Deneme ${attempts + 1}/${maxAttempts}: API isteği hatası, sağlayıcı ${AI_PROVIDERS[currentProviderIndex]?.id || 'bilinmiyor'}.`, error);
      await setCurrentProvider((currentProviderIndex + 1) % AI_PROVIDERS.length);
      attempts++;
      
      if (attempts >= maxAttempts) {
        console.error('Tüm API sağlayıcıları ve yeniden denemeler tükendi.');
        throw new Error('Birden fazla denemeden sonra tüm sağlayıcılar başarısız oldu.');
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (Math.floor(attempts / AI_PROVIDERS.length) + 1) ));
    }
  }
  throw new Error('Denemelerden sonra tüm API sağlayıcıları tükendi.');
}