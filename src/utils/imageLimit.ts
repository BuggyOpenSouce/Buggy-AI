const DAILY_LIMIT = 10;
const STORAGE_KEY = 'imageGenerationLimit';

export async function getImageGenerationLimit(): Promise<number> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();
    
    const stored = localStorage.getItem(STORAGE_KEY);
    const limits = stored ? JSON.parse(stored) : {};
    
    if (!limits[ip] || isNewDay(limits[ip].lastReset)) {
      limits[ip] = {
        count: 0,
        lastReset: Date.now(),
        ipAddress: ip
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limits));
    }
    
    return DAILY_LIMIT - limits[ip].count;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return 0;
  }
}

export async function incrementImageCount(): Promise<boolean> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();
    
    const stored = localStorage.getItem(STORAGE_KEY);
    const limits = stored ? JSON.parse(stored) : {};
    
    if (!limits[ip] || isNewDay(limits[ip].lastReset)) {
      limits[ip] = {
        count: 0,
        lastReset: Date.now(),
        ipAddress: ip
      };
    }
    
    if (limits[ip].count >= DAILY_LIMIT) {
      return false;
    }
    
    limits[ip].count++;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limits));
    return true;
  } catch (error) {
    console.error('Error incrementing image count:', error);
    return false;
  }
}

function isNewDay(timestamp: number): boolean {
  const last = new Date(timestamp);
  const now = new Date();
  return last.getDate() !== now.getDate() ||
         last.getMonth() !== now.getMonth() ||
         last.getFullYear() !== now.getFullYear();
}