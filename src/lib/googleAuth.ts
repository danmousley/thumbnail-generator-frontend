import { google } from 'googleapis';

function formatPrivateKey(privateKey: string): string {
  // Remove any surrounding quotes
  let key = privateKey.trim().replace(/^["']|["']$/g, '');
  
  // Handle escaped newlines
  key = key.replace(/\\n/g, '\n');
  
  // If the key is base64 encoded without proper markers, try to decode it
  if (!key.includes('-----BEGIN') && !key.includes('-----END')) {
    try {
      key = Buffer.from(key, 'base64').toString('utf8');
    } catch {
      console.warn('Could not decode base64 private key, using as-is');
    }
  }
  
  // Ensure proper formatting with correct line breaks
  if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    // Split by spaces and rejoin with proper newlines
    const parts = key.split(/\s+/);
    const beginIndex = parts.findIndex(part => part.includes('-----BEGIN'));
    const endIndex = parts.findIndex(part => part.includes('-----END'));
    
    if (beginIndex !== -1 && endIndex !== -1) {
      const header = parts.slice(beginIndex, beginIndex + 3).join(' ');
      const body = parts.slice(beginIndex + 3, endIndex).join('');
      const footer = parts.slice(endIndex, endIndex + 3).join(' ');
      
      // Format with proper line breaks (64 chars per line for the body)
      const formattedBody = body.match(/.{1,64}/g)?.join('\n') || body;
      key = `${header}\n${formattedBody}\n${footer}`;
    }
  }
  
  return key;
}

export async function initializeGoogleDrive() {
  try {
    // Method 1: Try standard GOOGLE_APPLICATION_CREDENTIALS approach
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Attempting Google Auth with GOOGLE_APPLICATION_CREDENTIALS');
      try {
        const auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        
        const drive = google.drive({ version: 'v3', auth });
        await auth.getAccessToken(); // Test the auth
        console.log('Google Auth successful with GOOGLE_APPLICATION_CREDENTIALS');
        return drive;
      } catch (error) {
        console.warn('GOOGLE_APPLICATION_CREDENTIALS failed:', error instanceof Error ? error.message : error);
      }
    }

    // Method 2: Try JSON credentials (alternative approach)
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (serviceAccountJson) {
      console.log('Attempting Google Auth with JSON credentials');
      try {
        const credentials = JSON.parse(serviceAccountJson);
        const auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/drive.readonly'],
          credentials: credentials,
        });
        
        const drive = google.drive({ version: 'v3', auth });
        await auth.getAccessToken(); // Test the auth
        console.log('Google Auth successful with JSON credentials');
        return drive;
      } catch (error) {
        console.warn('JSON credentials failed:', error instanceof Error ? error.message : error);
      }
    }

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const projectId = process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID;

    if (!serviceAccountEmail || !serviceAccountPrivateKey || !projectId) {
      console.log('Individual Google Drive credentials not configured');
      return null;
    }

    // Method 3: Try multiple private key formats (original approach with enhanced handling)
    const privateKeyAttempts = [
      // Attempt 1: Use our formatted key
      formatPrivateKey(serviceAccountPrivateKey),
      // Attempt 2: Simple newline replacement
      serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      // Attempt 3: Try base64 decode if it doesn't have markers
      !serviceAccountPrivateKey.includes('-----BEGIN') 
        ? (() => {
            try {
              return Buffer.from(serviceAccountPrivateKey, 'base64').toString('utf8');
            } catch {
              return serviceAccountPrivateKey;
            }
          })()
        : serviceAccountPrivateKey,
      // Attempt 4: Use as-is
      serviceAccountPrivateKey
    ];

    let lastError: Error | null = null;
    
    for (let i = 0; i < privateKeyAttempts.length; i++) {
      const privateKey = privateKeyAttempts[i];
      
      try {
        console.log(`Attempting Google Auth with private key format ${i + 1}`);
        
        // Validate the key has proper markers
        if (!privateKey.includes('-----BEGIN') || !privateKey.includes('-----END')) {
          throw new Error('Private key missing proper BEGIN/END markers');
        }

        const auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/drive.readonly'],
          credentials: {
            type: 'service_account',
            project_id: projectId,
            client_email: serviceAccountEmail,
            private_key: privateKey,
          },
        });

        // Test the authentication by creating a drive instance
        const drive = google.drive({ version: 'v3', auth });
        
        // Try to make a simple API call to validate the auth works
        await auth.getAccessToken();
        
        console.log(`Google Auth successful with format ${i + 1}`);
        return drive;
      } catch (error) {
        console.warn(`Private key format ${i + 1} failed:`, error instanceof Error ? error.message : error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // If all attempts failed, throw the last error
    throw lastError || new Error('All private key formats failed');
    
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return null;
  }
} 