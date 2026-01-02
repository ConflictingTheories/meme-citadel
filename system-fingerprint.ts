import crypto from ‘crypto’;

interface FingerprintComponents {
ip: string;
geolocation: {
latitude: number;
longitude: number;
accuracy: number;
timezone: string;
};
rtt: number; // Round-trip time in ms
browserFingerprint: {
userAgent: string;
screenResolution: string;
timezone: string;
language: string;
platform: string;
hardwareConcurrency: number;
deviceMemory?: number;
colorDepth: number;
pixelRatio: number;
webglVendor?: string;
webglRenderer?: string;
audioContext?: string;
canvasFingerprint?: string;
};
timestamp: Date;
}

interface IdentityFingerprint {
publicId: string; // Shown to users (non-reversible)
internalHash: string; // Used for Sybil detection (stored server-side)
trustScore: number; // 0-100
metadata: {
created: Date;
lastSeen: Date;
geohash: string; // Approximate location (city-level)
rttBucket: string; // Grouped for privacy
};
flags: {
vpn: boolean;
tor: boolean;
proxy: boolean;
multipleAccounts: boolean;
};
}

class FingerprintingService {
private readonly SALT_ROUNDS = 12;
private readonly GEOHASH_PRECISION = 5; // City-level precision

// =========================================================================
// CLIENT-SIDE FINGERPRINTING (Run in browser)
// =========================================================================

async collectBrowserFingerprint(): Promise<FingerprintComponents[‘browserFingerprint’]> {
const fingerprint: FingerprintComponents[‘browserFingerprint’] = {
userAgent: navigator.userAgent,
screenResolution: `${screen.width}x${screen.height}`,
timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
language: navigator.language,
platform: navigator.platform,
hardwareConcurrency: navigator.hardwareConcurrency,
deviceMemory: (navigator as any).deviceMemory,
colorDepth: screen.colorDepth,
pixelRatio: window.devicePixelRatio
};

```
// === ENHANCED BROWSER FINGERPRINTING ===

// Screen Details (more than just resolution)
fingerprint.screenDetails = {
  availWidth: screen.availWidth,
  availHeight: screen.availHeight,
  width: screen.width,
  height: screen.height,
  colorDepth: screen.colorDepth,
  pixelDepth: screen.pixelDepth,
  orientation: screen.orientation?.type || 'unknown'
};

// Installed Fonts Detection
fingerprint.fonts = await this.detectFonts();

// Plugins Detection
fingerprint.plugins = Array.from(navigator.plugins || []).map(p => ({
  name: p.name,
  description: p.description,
  filename: p.filename
}));

// MIME Types
fingerprint.mimeTypes = Array.from(navigator.mimeTypes || []).map(m => m.type);

// Do Not Track
fingerprint.doNotTrack = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;

// Cookie Enabled
fingerprint.cookieEnabled = navigator.cookieEnabled;

// Storage Quota
if ('storage' in navigator && 'estimate' in navigator.storage) {
  try {
    const estimate = await navigator.storage.estimate();
    fingerprint.storageQuota = {
      quota: estimate.quota,
      usage: estimate.usage
    };
  } catch (e) {}
}

// Battery API
if ('getBattery' in navigator) {
  try {
    const battery = await (navigator as any).getBattery();
    fingerprint.battery = {
      charging: battery.charging,
      level: Math.round(battery.level * 100),
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    };
  } catch (e) {}
}

// Connection API
if ('connection' in navigator) {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    fingerprint.connection = {
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      saveData: conn.saveData
    };
  }
}

// Media Devices
if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    fingerprint.mediaDevices = {
      audioInputCount: devices.filter(d => d.kind === 'audioinput').length,
      audioOutputCount: devices.filter(d => d.kind === 'audiooutput').length,
      videoInputCount: devices.filter(d => d.kind === 'videoinput').length
    };
  } catch (e) {}
}

// WebRTC Local IP Leak
fingerprint.webrtcIPs = await this.getWebRTCIPs();

// Permissions
fingerprint.permissions = await this.checkPermissions();

// WebGL Fingerprinting (Enhanced)
try {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl) {
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      fingerprint.webglVendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      fingerprint.webglRenderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    
    // WebGL Parameters
    fingerprint.webglParams = {
      version: (gl as any).getParameter((gl as any).VERSION),
      shadingLanguageVersion: (gl as any).getParameter((gl as any).SHADING_LANGUAGE_VERSION),
      vendor: (gl as any).getParameter((gl as any).VENDOR),
      renderer: (gl as any).getParameter((gl as any).RENDERER),
      maxTextureSize: (gl as any).getParameter((gl as any).MAX_TEXTURE_SIZE),
      maxViewportDims: (gl as any).getParameter((gl as any).MAX_VIEWPORT_DIMS)
    };

    // WebGL Extensions
    fingerprint.webglExtensions = (gl as any).getSupportedExtensions() || [];
  }
} catch (e) {}

// Canvas Fingerprinting (Enhanced)
try {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Draw complex pattern
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('AEGIS 🛡️ Citadel', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Fingerprint', 4, 17);
    
    // Add emoji rendering (varies by OS)
    ctx.fillText('🔒🌐💻', 60, 30);
    
    fingerprint.canvasFingerprint = canvas.toDataURL();
  }
} catch (e) {}

// Audio Context Fingerprinting (Enhanced)
try {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const analyser = audioContext.createAnalyser();
  const gainNode = audioContext.createGain();
  const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
  
  gainNode.gain.value = 0;
  oscillator.connect(analyser);
  analyser.connect(scriptProcessor);
  scriptProcessor.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start(0);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  fingerprint.audioContext = Array.from(dataArray).slice(0, 30).join(',');
  
  // Audio context properties
  fingerprint.audioContextProps = {
    sampleRate: audioContext.sampleRate,
    state: audioContext.state,
    maxChannelCount: audioContext.destination.maxChannelCount,
    numberOfInputs: audioContext.destination.numberOfInputs,
    numberOfOutputs: audioContext.destination.numberOfOutputs,
    channelCount: audioContext.destination.channelCount
  };
  
  oscillator.stop();
  audioContext.close();
} catch (e) {}

// Speech Synthesis Voices
if ('speechSynthesis' in window) {
  try {
    const voices = window.speechSynthesis.getVoices();
    fingerprint.speechVoices = voices.map(v => `${v.name}:${v.lang}`);
  } catch (e) {}
}

// Keyboard Layout Detection
fingerprint.keyboard = {
  layout: (navigator as any).keyboard?.getLayoutMap ? 'detected' : 'unknown'
};

// Touch Support
fingerprint.touchSupport = {
  maxTouchPoints: navigator.maxTouchPoints || 0,
  touchEvent: 'ontouchstart' in window,
  touchPoints: (navigator as any).msMaxTouchPoints || 0
};

// Pointer Support
fingerprint.pointerSupport = {
  pointerEnabled: !!(window as any).PointerEvent,
  msPointerEnabled: !!(window as any).MSPointerEvent
};

return fingerprint;
```

}

// === HELPER METHODS ===

private async detectFonts(): Promise<string[]> {
const baseFonts = [‘monospace’, ‘sans-serif’, ‘serif’];
const testFonts = [
‘Arial’, ‘Verdana’, ‘Times New Roman’, ‘Courier New’, ‘Georgia’,
‘Palatino’, ‘Garamond’, ‘Bookman’, ‘Comic Sans MS’, ‘Trebuchet MS’,
‘Impact’, ‘Lucida Console’, ‘Tahoma’, ‘Calibri’, ‘Consolas’
];

```
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (!ctx) return [];

const text = 'mmmmmmmmmmlli';
const testSize = '72px';

const baseSizes: { [key: string]: number } = {};
baseFonts.forEach(baseFont => {
  ctx.font = `${testSize} ${baseFont}`;
  baseSizes[baseFont] = ctx.measureText(text).width;
});

const detectedFonts: string[] = [];
testFonts.forEach(testFont => {
  let detected = false;
  baseFonts.forEach(baseFont => {
    ctx.font = `${testSize} ${testFont}, ${baseFont}`;
    const size = ctx.measureText(text).width;
    if (size !== baseSizes[baseFont]) {
      detected = true;
    }
  });
  if (detected) {
    detectedFonts.push(testFont);
  }
});

return detectedFonts;
```

}

private async getWebRTCIPs(): Promise<string[]> {
return new Promise((resolve) => {
const ips: string[] = [];
const RTCPeerConnection = (window as any).RTCPeerConnection ||
(window as any).mozRTCPeerConnection ||
(window as any).webkitRTCPeerConnection;

```
  if (!RTCPeerConnection) {
    resolve(ips);
    return;
  }

  const pc = new RTCPeerConnection({ iceServers: [] });
  pc.createDataChannel('');
  
  pc.createOffer().then((offer: any) => pc.setLocalDescription(offer));
  
  pc.onicecandidate = (ice: any) => {
    if (!ice || !ice.candidate || !ice.candidate.candidate) {
      resolve(ips);
      return;
    }
    
    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
    const match = ipRegex.exec(ice.candidate.candidate);
    if (match && !ips.includes(match[1])) {
      ips.push(match[1]);
    }
  };

  setTimeout(() => resolve(ips), 1000);
});
```

}

private async checkPermissions(): Promise<{ [key: string]: string }> {
const permissions: { [key: string]: string } = {};
const permissionNames = [‘geolocation’, ‘notifications’, ‘microphone’, ‘camera’];

```
if (!navigator.permissions) return permissions;

for (const name of permissionNames) {
  try {
    const result = await navigator.permissions.query({ name: name as PermissionName });
    permissions[name] = result.state;
  } catch (e) {
    permissions[name] = 'unknown';
  }
}

return permissions;
```

}

async measureRTT(serverEndpoint: string): Promise<number> {
const measurements: number[] = [];

```
// Take 5 measurements and use median
for (let i = 0; i < 5; i++) {
  const start = performance.now();
  try {
    await fetch(serverEndpoint, { method: 'HEAD' });
    const end = performance.now();
    measurements.push(end - start);
  } catch (e) {
    // Network error
  }
  await new Promise(resolve => setTimeout(resolve, 100));
}

measurements.sort((a, b) => a - b);
return measurements[Math.floor(measurements.length / 2)] || 0;
```

}

async getGeolocation(): Promise<FingerprintComponents[‘geolocation’]> {
return new Promise((resolve, reject) => {
if (!navigator.geolocation) {
reject(new Error(‘Geolocation not supported’));
return;
}

```
  navigator.geolocation.getCurrentPosition(
    (position) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    },
    (error) => {
      // Fallback to timezone-based approximation
      resolve({
        latitude: 0,
        longitude: 0,
        accuracy: 999999,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    },
    {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000
    }
  );
});
```

}

// =========================================================================
// SERVER-SIDE PROCESSING
// =========================================================================

generatePublicId(internalHash: string): string {
// Create a shortened, non-reversible public ID
const hash = crypto.createHash(‘sha256’)
.update(internalHash)
.digest(‘hex’);

```
// Take first 16 chars and format nicely
const shortHash = hash.substring(0, 16);
return `aegis_${shortHash.substring(0, 4)}_${shortHash.substring(4, 8)}_${shortHash.substring(8, 12)}_${shortHash.substring(12, 16)}`;
```

}

private geohash(lat: number, lon: number, precision: number = 5): string {
const base32 = ‘0123456789bcdefghjkmnpqrstuvwxyz’;
let latRange = [-90, 90];
let lonRange = [-180, 180];
let hash = ‘’;
let isEven = true;
let bit = 0;
let ch = 0;

```
while (hash.length < precision) {
  const mid = isEven 
    ? (lonRange[0] + lonRange[1]) / 2 
    : (latRange[0] + latRange[1]) / 2;
  
  const val = isEven ? lon : lat;
  
  if (val > mid) {
    ch |= (1 << (4 - bit));
    if (isEven) lonRange[0] = mid;
    else latRange[0] = mid;
  } else {
    if (isEven) lonRange[1] = mid;
    else latRange[1] = mid;
  }

  isEven = !isEven;

  if (bit < 4) {
    bit++;
  } else {
    hash += base32[ch];
    bit = 0;
    ch = 0;
  }
}

return hash;
```

}

private bucketRTT(rtt: number): string {
// Group RTT into buckets for privacy
if (rtt < 10) return ‘local’;
if (rtt < 50) return ‘nearby’;
if (rtt < 100) return ‘regional’;
if (rtt < 200) return ‘national’;
return ‘international’;
}

private hashComponent(data: any): string {
return crypto.createHash(‘sha256’)
.update(JSON.stringify(data))
.digest(‘hex’);
}

generateInternalHash(components: FingerprintComponents): string {
// Create deterministic hash from all components
const compositeParts = [
// IP (hashed separately for privacy)
this.hashComponent(components.ip),

```
  // Geolocation (coarse precision)
  this.geohash(
    components.geolocation.latitude, 
    components.geolocation.longitude, 
    this.GEOHASH_PRECISION
  ),
  
  // RTT bucket
  this.bucketRTT(components.rtt),
  
  // Browser fingerprint (most unique)
  this.hashComponent(components.browserFingerprint)
];

return crypto.createHash('sha256')
  .update(compositeParts.join('::'))
  .digest('hex');
```

}

async detectAnomalies(
components: FingerprintComponents,
ipInfo: any
): Promise<IdentityFingerprint[‘flags’]> {
const flags = {
vpn: false,
tor: false,
proxy: false,
multipleAccounts: false
};

```
// VPN/Proxy Detection
if (ipInfo.isVPN || ipInfo.isHosting) {
  flags.vpn = true;
}

// TOR Detection
if (ipInfo.isTor) {
  flags.tor = true;
}

// Proxy Detection (RTT anomaly)
if (components.rtt > 500 && ipInfo.country !== components.geolocation.timezone) {
  flags.proxy = true;
}

// Geolocation mismatch
const geoDistance = this.calculateDistance(
  components.geolocation.latitude,
  components.geolocation.longitude,
  ipInfo.latitude,
  ipInfo.longitude
);

if (geoDistance > 100) { // More than 100km difference
  flags.proxy = true;
}

return flags;
```

}

private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
const R = 6371; // Earth’s radius in km
const dLat = this.toRad(lat2 - lat1);
const dLon = this.toRad(lon2 - lon1);
const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
Math.sin(dLon / 2) * Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
return R * c;
}

private toRad(degrees: number): number {
return degrees * (Math.PI / 180);
}

calculateTrustScore(
flags: IdentityFingerprint[‘flags’],
accountAge: number, // days
contributions: number,
verifiedContributions: number
): number {
let score = 100;

```
// Deduct for suspicious indicators
if (flags.vpn) score -= 20;
if (flags.tor) score -= 30;
if (flags.proxy) score -= 25;
if (flags.multipleAccounts) score -= 40;

// Add for positive history
score += Math.min(accountAge / 30, 10); // Up to +10 for 30+ days
score += Math.min(contributions / 10, 20); // Up to +20 for 100+ contributions

const verificationRate = contributions > 0 
  ? verifiedContributions / contributions 
  : 0;
score += verificationRate * 30; // Up to +30 for 100% verification rate

return Math.max(0, Math.min(100, score));
```

}

async createFingerprint(
components: FingerprintComponents,
ipInfo: any,
accountStats?: {
accountAge: number;
contributions: number;
verifiedContributions: number;
}
): Promise<IdentityFingerprint> {
const internalHash = this.generateInternalHash(components);
const publicId = this.generatePublicId(internalHash);
const flags = await this.detectAnomalies(components, ipInfo);

```
const stats = accountStats || {
  accountAge: 0,
  contributions: 0,
  verifiedContributions: 0
};

const trustScore = this.calculateTrustScore(
  flags,
  stats.accountAge,
  stats.contributions,
  stats.verifiedContributions
);

return {
  publicId,
  internalHash,
  trustScore,
  metadata: {
    created: new Date(),
    lastSeen: new Date(),
    geohash: this.geohash(
      components.geolocation.latitude,
      components.geolocation.longitude,
      this.GEOHASH_PRECISION
    ),
    rttBucket: this.bucketRTT(components.rtt)
  },
  flags
};
```

}

// =========================================================================
// SYBIL DETECTION
// =========================================================================

async checkForSybils(
newFingerprint: string,
existingFingerprints: string[]
): Promise<{
isSybil: boolean;
similarityScore: number;
matchedFingerprints: string[];
}> {
const similarities: { fingerprint: string; score: number }[] = [];

```
for (const existing of existingFingerprints) {
  const score = this.calculateSimilarity(newFingerprint, existing);
  if (score > 0.7) { // 70% similarity threshold
    similarities.push({ fingerprint: existing, score });
  }
}

return {
  isSybil: similarities.length > 0,
  similarityScore: similarities.length > 0 
    ? Math.max(...similarities.map(s => s.score)) 
    : 0,
  matchedFingerprints: similarities.map(s => s.fingerprint)
};
```

}

private calculateSimilarity(hash1: string, hash2: string): number {
// Simple Hamming distance for hex strings
let differences = 0;
const minLength = Math.min(hash1.length, hash2.length);

```
for (let i = 0; i < minLength; i++) {
  if (hash1[i] !== hash2[i]) differences++;
}

return 1 - (differences / minLength);
```

}

// =========================================================================
// RATE LIMITING BY FINGERPRINT
// =========================================================================

getRateLimitKey(fingerprint: IdentityFingerprint): string {
// Use internal hash for rate limiting
// This prevents IP rotation from bypassing limits
return `ratelimit:${fingerprint.internalHash}`;
}

getRateLimitMultiplier(trustScore: number): number {
// Higher trust = more lenient rate limits
if (trustScore >= 90) return 2.0;
if (trustScore >= 75) return 1.5;
if (trustScore >= 50) return 1.0;
if (trustScore >= 25) return 0.5;
return 0.25;
}
}

export default FingerprintingService;
export type { FingerprintComponents, IdentityFingerprint };