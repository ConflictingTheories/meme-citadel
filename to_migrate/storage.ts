import { create, IPFSHTTPClient } from ‘ipfs-http-client’;
import Arweave from ‘arweave’;
import crypto from ‘crypto’;
import fs from ‘fs/promises’;

interface StorageResult {
hash: string;
url: string;
timestamp: Date;
size: number;
storageType: ‘ipfs’ | ‘arweave’;
}

interface SourceArchive {
originalUrl?: string;
content: Buffer | string;
contentType: string;
metadata: {
title: string;
author?: string;
publicationDate?: string;
archiveReason: string;
};
}

class ImmutableStorageService {
private ipfs: IPFSHTTPClient | null = null;
private arweave: Arweave | null = null;
private wallet: any = null;

constructor() {
this.initializeIPFS();
this.initializeArweave();
}

// =========================================================================
// INITIALIZATION
// =========================================================================

private async initializeIPFS(): Promise<void> {
try {
this.ipfs = create({
host: process.env.IPFS_HOST || ‘localhost’,
port: parseInt(process.env.IPFS_PORT || ‘5001’),
protocol: process.env.IPFS_PROTOCOL || ‘http’
});
console.log(‘IPFS client initialized’);
} catch (error) {
console.error(‘Failed to initialize IPFS:’, error);
}
}

private async initializeArweave(): Promise<void> {
try {
this.arweave = Arweave.init({
host: process.env.ARWEAVE_HOST || ‘arweave.net’,
port: parseInt(process.env.ARWEAVE_PORT || ‘443’),
protocol: process.env.ARWEAVE_PROTOCOL || ‘https’
});

```
  // Load wallet from environment or file
  const walletPath = process.env.ARWEAVE_WALLET_PATH;
  if (walletPath) {
    const walletData = await fs.readFile(walletPath, 'utf-8');
    this.wallet = JSON.parse(walletData);
    console.log('Arweave wallet loaded');
  }
} catch (error) {
  console.error('Failed to initialize Arweave:', error);
}
```

}

// =========================================================================
// CONTENT HASHING
// =========================================================================

private computeHash(content: Buffer | string): string {
const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
return crypto.createHash(‘sha256’).update(buffer).digest(‘hex’);
}

private async verifyIntegrity(
content: Buffer | string,
expectedHash: string
): Promise<boolean> {
const actualHash = this.computeHash(content);
return actualHash === expectedHash;
}

// =========================================================================
// IPFS STORAGE
// =========================================================================

async storeOnIPFS(archive: SourceArchive): Promise<StorageResult> {
if (!this.ipfs) {
throw new Error(‘IPFS client not initialized’);
}

```
const content = Buffer.isBuffer(archive.content) 
  ? archive.content 
  : Buffer.from(archive.content);

// Create metadata object
const metadata = {
  ...archive.metadata,
  contentType: archive.contentType,
  originalUrl: archive.originalUrl,
  archivedAt: new Date().toISOString(),
  contentHash: this.computeHash(content)
};

// Store metadata as separate file
const metadataResult = await this.ipfs.add(
  JSON.stringify(metadata, null, 2)
);

// Store actual content
const contentResult = await this.ipfs.add(content);

// Create directory structure linking both
const directoryResult = await this.ipfs.add({
  path: 'archive/content',
  content: content
}, {
  wrapWithDirectory: true
});

await this.ipfs.add({
  path: 'archive/metadata.json',
  content: JSON.stringify(metadata, null, 2)
});

return {
  hash: contentResult.cid.toString(),
  url: `ipfs://${contentResult.cid.toString()}`,
  timestamp: new Date(),
  size: content.length,
  storageType: 'ipfs'
};
```

}

async retrieveFromIPFS(hash: string): Promise<Buffer> {
if (!this.ipfs) {
throw new Error(‘IPFS client not initialized’);
}

```
const chunks: Uint8Array[] = [];
for await (const chunk of this.ipfs.cat(hash)) {
  chunks.push(chunk);
}

return Buffer.concat(chunks);
```

}

// =========================================================================
// ARWEAVE STORAGE (Permanent)
// =========================================================================

async storeOnArweave(archive: SourceArchive): Promise<StorageResult> {
if (!this.arweave || !this.wallet) {
throw new Error(‘Arweave not initialized or wallet not loaded’);
}

```
const content = Buffer.isBuffer(archive.content) 
  ? archive.content 
  : Buffer.from(archive.content);

// Create transaction
const transaction = await this.arweave.createTransaction({
  data: content
}, this.wallet);

// Add tags for metadata and searchability
transaction.addTag('Content-Type', archive.contentType);
transaction.addTag('Title', archive.metadata.title);
transaction.addTag('Archive-Reason', archive.metadata.archiveReason);
transaction.addTag('Archived-At', new Date().toISOString());
transaction.addTag('Content-Hash', this.computeHash(content));

if (archive.metadata.author) {
  transaction.addTag('Author', archive.metadata.author);
}
if (archive.metadata.publicationDate) {
  transaction.addTag('Publication-Date', archive.metadata.publicationDate);
}
if (archive.originalUrl) {
  transaction.addTag('Original-URL', archive.originalUrl);
}

// Sign and submit
await this.arweave.transactions.sign(transaction, this.wallet);
await this.arweave.transactions.post(transaction);

return {
  hash: transaction.id,
  url: `https://arweave.net/${transaction.id}`,
  timestamp: new Date(),
  size: content.length,
  storageType: 'arweave'
};
```

}

async retrieveFromArweave(transactionId: string): Promise<Buffer> {
if (!this.arweave) {
throw new Error(‘Arweave not initialized’);
}

```
const response = await this.arweave.transactions.getData(
  transactionId, 
  { decode: true, string: false }
);

return Buffer.from(response as Uint8Array);
```

}

async getArweaveMetadata(transactionId: string): Promise<any> {
if (!this.arweave) {
throw new Error(‘Arweave not initialized’);
}

```
const transaction = await this.arweave.transactions.get(transactionId);
const tags: { [key: string]: string } = {};

transaction.tags.forEach((tag: any) => {
  const key = tag.get('name', { decode: true, string: true });
  const value = tag.get('value', { decode: true, string: true });
  tags[key] = value;
});

return tags;
```

}

// =========================================================================
// HYBRID STORAGE STRATEGY
// =========================================================================

async archiveSource(
archive: SourceArchive,
permanent: boolean = false
): Promise<StorageResult[]> {
const results: StorageResult[] = [];

```
// Always store on IPFS for quick access
if (this.ipfs) {
  try {
    const ipfsResult = await this.storeOnIPFS(archive);
    results.push(ipfsResult);
  } catch (error) {
    console.error('IPFS storage failed:', error);
  }
}

// Store on Arweave for permanent archival
if (permanent && this.arweave && this.wallet) {
  try {
    const arweaveResult = await this.storeOnArweave(archive);
    results.push(arweaveResult);
  } catch (error) {
    console.error('Arweave storage failed:', error);
  }
}

if (results.length === 0) {
  throw new Error('Failed to store content on any storage backend');
}

return results;
```

}

// =========================================================================
// URL ARCHIVAL (For web pages/PDFs)
// =========================================================================

async archiveUrl(
url: string,
metadata: SourceArchive[‘metadata’],
permanent: boolean = false
): Promise<StorageResult[]> {
// Fetch content from URL
const response = await fetch(url);
if (!response.ok) {
throw new Error(`Failed to fetch URL: ${response.statusText}`);
}

```
const content = Buffer.from(await response.arrayBuffer());
const contentType = response.headers.get('content-type') || 'application/octet-stream';

const archive: SourceArchive = {
  originalUrl: url,
  content,
  contentType,
  metadata
};

return this.archiveSource(archive, permanent);
```

}

// =========================================================================
// VERIFICATION
// =========================================================================

async verifyStoredContent(
hash: string,
storageType: ‘ipfs’ | ‘arweave’,
expectedHash?: string
): Promise<boolean> {
let content: Buffer;

```
if (storageType === 'ipfs') {
  content = await this.retrieveFromIPFS(hash);
} else {
  content = await this.retrieveFromArweave(hash);
}

if (expectedHash) {
  return this.verifyIntegrity(content, expectedHash);
}

// If no expected hash, just verify we can retrieve it
return content.length > 0;
```

}

// =========================================================================
// SEARCH & DISCOVERY
// =========================================================================

async searchArweaveByTag(
tagName: string,
tagValue: string,
limit: number = 100
): Promise<string[]> {
if (!this.arweave) {
throw new Error(‘Arweave not initialized’);
}

```
const query = {
  query: `{
    transactions(
      tags: [
        { name: "${tagName}", values: ["${tagValue}"] }
      ]
      first: ${limit}
    ) {
      edges {
        node {
          id
        }
      }
    }
  }`
};

const response = await this.arweave.api.post('/graphql', query);
return response.data.data.transactions.edges.map((edge: any) => edge.node.id);
```

}
}

export default ImmutableStorageService;
