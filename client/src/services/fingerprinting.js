// ============================================================================
// AEGIS FINGERPRINTING SERVICE - Client-side identity management
// ============================================================================

import { submitFingerprint } from '../api';

class FingerprintingService {
    constructor() {
        this.SALT_ROUNDS = 12;
        this.GEOHASH_PRECISION = 5;
        this._lastNetworkError = null; // store last network error message to avoid log spam
    }

    // =========================================================================
    // CLIENT-SIDE FINGERPRINTING (Run in browser)
    // =========================================================================

    async collectBrowserFingerprint() {
        const fingerprint = {
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio
        };

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
        fingerprint.doNotTrack = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;

        // Cookie Enabled
        fingerprint.cookieEnabled = navigator.cookieEnabled;

        // WebGL Information
        fingerprint.webgl = this.getWebGLInfo();

        // Audio Context Fingerprint
        fingerprint.audioContext = await this.getAudioFingerprint();

        // Canvas Fingerprint
        fingerprint.canvasFingerprint = this.getCanvasFingerprint();

        // Touch Support
        fingerprint.touchSupport = {
            maxTouchPoints: navigator.maxTouchPoints || 0,
            touchEvent: 'ontouchstart' in window,
            touchStart: 'TouchEvent' in window
        };

        // Battery API (if available)
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                fingerprint.battery = {
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime,
                    level: battery.level
                };
            } catch (e) {
                // Battery API not available or failed
            }
        }

        // Connection Information
        if ('connection' in navigator) {
            const connection = navigator.connection;
            fingerprint.connection = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }

        // Geolocation (approximate)
        fingerprint.geolocation = await this.getApproximateLocation();

        return fingerprint;
    }

    async detectFonts() {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const fontList = [
            'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
            'Bookman Old Style', 'Bradley Hand', 'Calibri', 'Cambria',
            'Cambria Math', 'Candara', 'Century', 'Century Gothic',
            'Century Schoolbook', 'Comic Sans MS', 'Consolas', 'Courier',
            'Courier New', 'Garamond', 'Georgia', 'Helvetica', 'Impact',
            'Lucida Bright', 'Lucida Calligraphy', 'Lucida Console',
            'Lucida Fax', 'Lucida Handwriting', 'Lucida Sans', 'Lucida Sans Typewriter',
            'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Monaco', 'MS Gothic',
            'MS Outlook', 'MS PGothic', 'MS Reference Sans Serif', 'MS Sans Serif',
            'MS Serif', 'MYRIAD', 'MYRIAD PRO', 'Palatino', 'Palatino Linotype',
            'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Light',
            'Segoe UI Semibold', 'Segoe UI Symbol', 'Tahoma', 'Times', 'Times New Roman',
            'Trebuchet MS', 'Verdana', 'Wingdings', 'Wingdings 2', 'Wingdings 3'
        ];

        const detectedFonts = [];

        for (const font of fontList) {
            if (this.isFontAvailable(font)) {
                detectedFonts.push(font);
            }
        }

        return detectedFonts;
    }

    isFontAvailable(font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const text = 'mmmmmmmmmmlli';
        const fontSize = '72px';

        context.font = fontSize + ' monospace';
        const baselineSize = context.measureText(text).width;

        context.font = fontSize + ' ' + font + ', monospace';
        const testSize = context.measureText(text).width;

        return baselineSize !== testSize;
    }

    getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return null;

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return {
                vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
                renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
            };
        } catch (e) {
            return null;
        }
    }

    async getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(audioContext.destination);

            oscillator.frequency.value = 10000;
            oscillator.type = 'triangle';

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            oscillator.start(0);
            analyser.getByteFrequencyData(dataArray);
            oscillator.stop();

            // Create a hash from the frequency data
            const hash = await this.hashString(dataArray.join(''));
            audioContext.close();

            return hash;
        } catch (e) {
            return null;
        }
    }

    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Draw various shapes and text to create unique fingerprint
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Fingerprint Test', 2, 2);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillRect(100, 5, 80, 20);
            ctx.fillStyle = '#f60';
            ctx.fillText('Canvas Fingerprint', 2, 25);

            return canvas.toDataURL();
        } catch (e) {
            return null;
        }
    }

    async getApproximateLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Round to reduce precision and protect privacy
                    resolve({
                        latitude: Math.round(position.coords.latitude * 100) / 100,
                        longitude: Math.round(position.coords.longitude * 100) / 100,
                        accuracy: Math.round(position.coords.accuracy / 100) * 100, // Round to nearest 100m
                        timestamp: position.timestamp
                    });
                },
                (error) => {
                    resolve(null);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    // =========================================================================
    // SERVER-SIDE PROCESSING (Run on server)
    // =========================================================================

    async generateIdentityFingerprint(browserFingerprint, ipAddress, rtt) {
        // Create comprehensive fingerprint object
        const fingerprintComponents = {
            ip: ipAddress,
            geolocation: browserFingerprint.geolocation,
            rtt: rtt,
            browserFingerprint: browserFingerprint,
            timestamp: new Date()
        };

        // Generate internal hash for Sybil detection (server-side only)
        const internalHash = await this.generateInternalHash(fingerprintComponents);

        // Generate public ID (shown to users)
        const publicId = await this.generatePublicId(internalHash);

        // Calculate trust score
        const trustScore = this.calculateTrustScore(fingerprintComponents);

        // Create metadata
        const metadata = {
            created: new Date(),
            lastSeen: new Date(),
            geohash: this.generateGeohash(fingerprintComponents.geolocation),
            rttBucket: this.bucketizeRTT(rtt)
        };

        // Detect flags
        const flags = {
            vpn: this.detectVPN(fingerprintComponents),
            tor: this.detectTor(fingerprintComponents),
            proxy: this.detectProxy(fingerprintComponents),
            multipleAccounts: false // Would be checked against database
        };

        return {
            publicId,
            internalHash,
            trustScore,
            metadata,
            flags
        };
    }

    async generateInternalHash(components) {
        const dataString = JSON.stringify({
            ip: components.ip,
            userAgent: components.browserFingerprint.userAgent,
            screenResolution: components.browserFingerprint.screenResolution,
            timezone: components.browserFingerprint.timezone,
            language: components.browserFingerprint.language,
            platform: components.browserFingerprint.platform,
            hardwareConcurrency: components.browserFingerprint.hardwareConcurrency,
            deviceMemory: components.browserFingerprint.deviceMemory,
            colorDepth: components.browserFingerprint.colorDepth,
            pixelRatio: components.browserFingerprint.pixelRatio,
            webgl: components.browserFingerprint.webgl,
            audioContext: components.browserFingerprint.audioContext,
            canvasFingerprint: components.browserFingerprint.canvasFingerprint,
            fonts: components.browserFingerprint.fonts?.slice(0, 10), // Limit to prevent too long hash
            plugins: components.browserFingerprint.plugins?.slice(0, 5),
            mimeTypes: components.browserFingerprint.mimeTypes?.slice(0, 10),
            geolocation: components.geolocation,
            rtt: components.rtt
        });

        return await this.hashString(dataString);
    }

    async generatePublicId(internalHash) {
        // Create a user-friendly public ID from the hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(internalHash));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Format as aegis_a4f3_9c2d_7b81_4e6a
        return `aegis_${hashHex.substring(0, 4)}_${hashHex.substring(4, 8)}_${hashHex.substring(8, 12)}_${hashHex.substring(12, 16)}`;
    }

    calculateTrustScore(components) {
        let score = 50; // Base score

        // Browser fingerprint consistency (+20)
        if (components.browserFingerprint.userAgent &&
            components.browserFingerprint.screenResolution &&
            components.browserFingerprint.timezone) {
            score += 20;
        }

        // Hardware information (+10)
        if (components.browserFingerprint.hardwareConcurrency &&
            components.browserFingerprint.deviceMemory) {
            score += 10;
        }

        // Advanced fingerprinting (+10)
        if (components.browserFingerprint.webgl &&
            components.browserFingerprint.audioContext &&
            components.browserFingerprint.canvasFingerprint) {
            score += 10;
        }

        // Geolocation available (+5)
        if (components.geolocation) {
            score += 5;
        }

        // Connection information (+5)
        if (components.browserFingerprint.connection) {
            score += 5;
        }

        // Penalize suspicious indicators (-10 to -30)
        if (components.browserFingerprint.doNotTrack === '1') score -= 5;
        if (components.browserFingerprint.plugins?.length === 0) score -= 10; // No plugins might indicate spoofing
        if (!components.browserFingerprint.cookieEnabled) score -= 5;

        // RTT analysis (good RTT = legitimate user)
        if (components.rtt < 50) score += 5; // Very fast = likely local/VPN
        else if (components.rtt < 200) score += 10; // Reasonable RTT
        else if (components.rtt > 1000) score -= 10; // Very slow = suspicious

        return Math.max(0, Math.min(100, score));
    }

    generateGeohash(geolocation) {
        if (!geolocation) return null;

        // Simple geohash implementation (simplified for demo)
        const { latitude, longitude } = geolocation;
        const latBin = Math.floor((latitude + 90) / 180 * 32);
        const lonBin = Math.floor((longitude + 180) / 360 * 32);

        return latBin.toString(32) + lonBin.toString(32);
    }

    bucketizeRTT(rtt) {
        if (rtt < 50) return 'nearby';
        if (rtt < 200) return 'regional';
        if (rtt < 500) return 'continental';
        return 'distant';
    }

    detectVPN(components) {
        // Simple VPN detection heuristics
        const suspicious = [];

        // Very fast RTT might indicate VPN
        if (components.rtt < 20) suspicious.push('very_fast_rtt');

        // Mismatch between timezone and IP geolocation would be checked server-side
        // For now, just check if geolocation is available
        if (!components.geolocation) suspicious.push('no_geolocation');

        return suspicious.length > 0;
    }

    detectTor(components) {
        // Tor detection heuristics
        return components.browserFingerprint.userAgent?.toLowerCase().includes('tor') ||
               components.ip === '127.0.0.1'; // Simplified
    }

    detectProxy(components) {
        // Proxy detection heuristics
        return components.browserFingerprint.plugins?.length === 0 ||
               !components.browserFingerprint.cookieEnabled;
    }

    async hashString(input) {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    async collectAndSendFingerprint() {
        try {
            const browserFingerprint = await this.collectBrowserFingerprint();

            // Try to send to server with retries and exponential backoff
            const maxAttempts = 3;
            let attempt = 0;
            let lastErr = null;

            while (attempt < maxAttempts) {
                try {
                    attempt++;
                    const response = await submitFingerprint(browserFingerprint);
                    // clear stored error on success
                    this._lastNetworkError = null;
                    return response;
                } catch (err) {
                    lastErr = err;
                    // Only log once per distinct error message to avoid console spam
                    const msg = err?.message || String(err);
                    if (this._lastNetworkError !== msg) {
                        // Use console.warn instead of error to be less noisy
                        console.warn('Fingerprint submission error:', msg);
                        this._lastNetworkError = msg;
                    }

                    // Backoff before next attempt (simple exponential)
                    const delay = 500 * Math.pow(2, attempt - 1);
                    await new Promise(r => setTimeout(r, delay));
                }
            }

            // After attempts, return null (caller may fallback)
            return null;
        } catch (error) {
            // Collection failed (non-network), log debug and return null
            console.debug('Fingerprint collection failed (non-network):', error);
            return null;
        }
    }
}

// Export singleton instance
const fingerprintingService = new FingerprintingService();
export default fingerprintingService;