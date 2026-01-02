import crypto from ‘crypto’;

interface CookieFingerprint {
persistentId: string;
sessionId: string;
installationId: string;
firstSeen: Date;
lastSeen: Date;
visitCount: number;
storageSignature: string;
}

interface StorageCapabilities {
localStorage: boolean;
sessionStorage: boolean;
indexedDB: boolean;
cookies: boolean;
webSQL: boolean;
cacheAPI: boolean;
}

class CookieFingerprintService {
private readonly COOKIE_NAME = ‘aegis_fp’;
private readonly PERSISTENT_COOKIE_NAME = ‘aegis_persistent’;
private readonly INSTALLATION_ID_KEY = ‘aegis_install_id’;
private readonly INDEXEDDB_NAME = ‘aegis_fingerprint_db’;
private readonly CACHE_NAME = ‘aegis_fp_cache’;

// =========================================================================
// MULTI-LAYER PERSISTENT TRACKING
// =========================================================================

async createPersistentFingerprint(): Promise<CookieFingerprint> {
// Try to load existing fingerprint from multiple sources
const existing = await this.loadExistingFingerprint();

```
if (existing) {
  // Update visit count and last seen
  existing.visitCount++;
  existing.lastSeen = new Date();
  await this.saveFingerprint(existing);
  return existing;
}

// Create new fingerprint
const fingerprint: CookieFingerprint = {
  persistentId: this.generateUUID(),
  sessionId: this.generateSessionId(),
  installationId: this.generateUUID(),
  firstSeen: new Date(),
  lastSeen: new Date(),
  visitCount: 1,
  storageSignature: await this.generateStorageSignature()
};

await this.saveFingerprint(fingerprint);
return fingerprint;
```

}

private async loadExistingFingerprint(): Promise<CookieFingerprint | null> {
// Try multiple sources in order of reliability
const sources = [
() => this.loadFromIndexedDB(),
() => this.loadFromLocalStorage(),
() => this.loadFromCookie(),
() => this.loadFromCacheAPI(),
() => this.loadFromServiceWorker()
];

```
for (const source of sources) {
  try {
    const fp = await source();
    if (fp) return fp;
  } catch (e) {
    // Source not available, try next
  }
}

return null;
```

}

private async saveFingerprint(fp: CookieFingerprint): Promise<void> {
// Save to ALL available storage mechanisms for redundancy
const saves = [
() => this.saveToIndexedDB(fp),
() => this.saveToLocalStorage(fp),
() => this.saveToCookie(fp),
() => this.saveToCacheAPI(fp),
() => this.saveToServiceWorker(fp)
];

```
await Promise.allSettled(saves.map(save => save()));
```

}

// =========================================================================
// COOKIE STORAGE
// =========================================================================

private saveToCookie(fp: CookieFingerprint): void {
const expires = new Date();
expires.setFullYear(expires.getFullYear() + 10); // 10 year cookie

```
// Persistent ID cookie
document.cookie = `${this.PERSISTENT_COOKIE_NAME}=${fp.persistentId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;

// Session cookie with full data
const data = btoa(JSON.stringify(fp));
document.cookie = `${this.COOKIE_NAME}=${data}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
```

}

private loadFromCookie(): CookieFingerprint | null {
const cookies = document.cookie.split(’;’);

```
for (const cookie of cookies) {
  const [name, value] = cookie.trim().split('=');
  if (name === this.COOKIE_NAME) {
    try {
      return JSON.parse(atob(value));
    } catch (e) {
      return null;
    }
  }
}

return null;
```

}

// =========================================================================
// LOCAL STORAGE
// =========================================================================

private saveToLocalStorage(fp: CookieFingerprint): void {
if (!this.hasLocalStorage()) return;

```
localStorage.setItem(this.INSTALLATION_ID_KEY, JSON.stringify(fp));
```

}

private loadFromLocalStorage(): CookieFingerprint | null {
if (!this.hasLocalStorage()) return null;

```
const stored = localStorage.getItem(this.INSTALLATION_ID_KEY);
return stored ? JSON.parse(stored) : null;
```

}

// =========================================================================
// INDEXED DB (Most persistent)
// =========================================================================

private async saveToIndexedDB(fp: CookieFingerprint): Promise<void> {
return new Promise((resolve, reject) => {
const request = indexedDB.open(this.INDEXEDDB_NAME, 1);

```
  request.onerror = () => reject(request.error);
  
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(['fingerprints'], 'readwrite');
    const store = transaction.objectStore('fingerprints');
    store.put(fp, 'current');
    transaction.oncomplete = () => resolve();
  };

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains('fingerprints')) {
      db.createObjectStore('fingerprints');
    }
  };
});
```

}

private async loadFromIndexedDB(): Promise<CookieFingerprint | null> {
return new Promise((resolve, reject) => {
const request = indexedDB.open(this.INDEXEDDB_NAME, 1);

```
  request.onerror = () => reject(request.error);
  
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(['fingerprints'], 'readonly');
    const store = transaction.objectStore('fingerprints');
    const getRequest = store.get('current');
    
    getRequest.onsuccess = () => resolve(getRequest.result || null);
    getRequest.onerror = () => resolve(null);
  };

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains('fingerprints')) {
      db.createObjectStore('fingerprints');
    }
  };
});
```

}

// =========================================================================
// CACHE API (Survives incognito in some browsers)
// =========================================================================

private async saveToCacheAPI(fp: CookieFingerprint): Promise<void> {
if (!(‘caches’ in window)) return;

```
const cache = await caches.open(this.CACHE_NAME);
const response = new Response(JSON.stringify(fp));
await cache.put('/fingerprint', response);
```

}

private async loadFromCacheAPI(): Promise<CookieFingerprint | null> {
if (!(‘caches’ in window)) return null;

```
try {
  const cache = await caches.open(this.CACHE_NAME);
  const response = await cache.match('/fingerprint');
  if (response) {
    const data = await response.json();
    return data;
  }
} catch (e) {}

return null;
```

}

// =========================================================================
// SERVICE WORKER STORAGE
// =========================================================================

private async saveToServiceWorker(fp: CookieFingerprint): Promise<void> {
if (!(‘serviceWorker’ in navigator)) return;

```
try {
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: 'SAVE_FINGERPRINT',
    data: fp
  });
} catch (e) {}
```

}

private async loadFromServiceWorker(): Promise<CookieFingerprint | null> {
if (!(‘serviceWorker’ in navigator)) return null;

```
return new Promise((resolve) => {
  const channel = new MessageChannel();
  
  channel.port1.onmessage = (event) => {
    if (event.data.type === 'FINGERPRINT_DATA') {
      resolve(event.data.fingerprint);
    } else {
      resolve(null);
    }
  };

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage(
      { type: 'LOAD_FINGERPRINT' },
      [channel.port2]
    );
  });

  // Timeout after 1 second
  setTimeout(() => resolve(null), 1000);
});
```

}

// =========================================================================
// STORAGE CAPABILITY DETECTION
// =========================================================================

detectStorageCapabilities(): StorageCapabilities {
return {
localStorage: this.hasLocalStorage(),
sessionStorage: this.hasSessionStorage(),
indexedDB: this.hasIndexedDB(),
cookies: this.hasCookies(),
webSQL: this.hasWebSQL(),
cacheAPI: this.hasCacheAPI()
};
}

private hasLocalStorage(): boolean {
try {
const test = ‘**storage_test**’;
localStorage.setItem(test, test);
localStorage.removeItem(test);
return true;
} catch (e) {
return false;
}
}

private hasSessionStorage(): boolean {
try {
const test = ‘**storage_test**’;
sessionStorage.setItem(test, test);
sessionStorage.removeItem(test);
return true;
} catch (e) {
return false;
}
}

private hasIndexedDB(): boolean {
return ‘indexedDB’ in window;
}

private hasCookies(): boolean {
return navigator.cookieEnabled;
}

private hasWebSQL(): boolean {
return ‘openDatabase’ in window;
}

private hasCacheAPI(): boolean {
return ‘caches’ in window;
}

// =========================================================================
// STORAGE SIGNATURE (Unique per browser/device)
// =========================================================================

private async generateStorageSignature(): Promise<string> {
const capabilities = this.detectStorageCapabilities();

```
// Test storage quotas
let localStorageSize = 0;
let sessionStorageSize = 0;

if (capabilities.localStorage) {
  try {
    let i = 0;
    while (i < 10000) {
      localStorage.setItem(`test_${i}`, 'x'.repeat(1000));
      i++;
    }
  } catch (e) {
    localStorageSize = i;
    // Clean up
    for (let j = 0; j < i; j++) {
      localStorage.removeItem(`test_${j}`);
    }
  }
}

// Storage quota API
let quota = 0;
let usage = 0;
if ('storage' in navigator && 'estimate' in navigator.storage) {
  try {
    const estimate = await navigator.storage.estimate();
    quota = estimate.quota || 0;
    usage = estimate.usage || 0;
  } catch (e) {}
}

const signature = {
  capabilities,
  localStorageSize,
  quota,
  usage,
  available: quota - usage
};

return crypto.createHash('sha256')
  .update(JSON.stringify(signature))
  .digest('hex')
  .substring(0, 16);
```

}

// =========================================================================
// HELPER METHODS
// =========================================================================

private generateUUID(): string {
return ‘xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx’.replace(/[xy]/g, (c) => {
const r = Math.random() * 16 | 0;
const v = c === ‘x’ ? r : (r & 0x3 | 0x8);
return v.toString(16);
});
}

private generateSessionId(): string {
return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// =========================================================================
// EVERCOOKIE TECHNIQUE (Nuclear option)
// =========================================================================

async createEvercookie(value: string): Promise<void> {
// Save to every possible storage location
const encodedValue = btoa(value);

```
// 1. Standard HTTP Cookie
document.cookie = `ec_standard=${encodedValue}; max-age=31536000; path=/`;

// 2. LocalStorage
if (this.hasLocalStorage()) {
  localStorage.setItem('ec_ls', encodedValue);
}

// 3. SessionStorage
if (this.hasSessionStorage()) {
  sessionStorage.setItem('ec_ss', encodedValue);
}

// 4. IndexedDB
try {
  await this.saveToIndexedDB({ 
    persistentId: value,
    sessionId: '',
    installationId: '',
    firstSeen: new Date(),
    lastSeen: new Date(),
    visitCount: 1,
    storageSignature: ''
  });
} catch (e) {}

// 5. Cache API
if ('caches' in window) {
  const cache = await caches.open('evercookie');
  await cache.put('/ec', new Response(encodedValue));
}

// 6. Web SQL (deprecated but still works in some browsers)
if (this.hasWebSQL()) {
  try {
    const db = (window as any).openDatabase('evercookie', '1.0', 'Evercookie', 1024 * 1024);
    db.transaction((tx: any) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS cache (id INTEGER PRIMARY KEY, value TEXT)');
      tx.executeSql('INSERT OR REPLACE INTO cache (id, value) VALUES (1, ?)', [encodedValue]);
    });
  } catch (e) {}
}

// 7. PNG image cache (stores data in image)
this.createPNGCache(encodedValue);

// 8. ETags (requires server cooperation)
// 9. HTTP Strict Transport Security (requires server cooperation)
```

}

private createPNGCache(value: string): void {
const canvas = document.createElement(‘canvas’);
canvas.width = 200;
canvas.height = 1;
const ctx = canvas.getContext(‘2d’);

```
if (ctx) {
  const imageData = ctx.createImageData(200, 1);
  const bytes = new TextEncoder().encode(value);
  
  for (let i = 0; i < bytes.length && i < 200; i++) {
    imageData.data[i * 4] = bytes[i];
    imageData.data[i * 4 + 1] = bytes[i];
    imageData.data[i * 4 + 2] = bytes[i];
    imageData.data[i * 4 + 3] = 255;
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Store in cache
  if ('caches' in window) {
    caches.open('png_cache').then(cache => {
      canvas.toBlob(blob => {
        if (blob) {
          cache.put('/fingerprint.png', new Response(blob));
        }
      });
    });
  }
}
```

}
}

export default CookieFingerprintService;
export type { CookieFingerprint, StorageCapabilities };