import { google } from 'googleapis';

export async function initializeGoogleDrive() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const projectId = process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID;

    if (!serviceAccountEmail || !serviceAccountPrivateKey || !projectId) {
      console.log('Google Drive credentials not configured');
      return null;
    }

    // More robust private key processing for Vercel deployment
    let processedPrivateKey = serviceAccountPrivateKey;
    
    // Handle different formats of private key that might come from environment variables
    if (processedPrivateKey.includes('\\n')) {
      processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');
    }
    
    // Ensure the private key has proper BEGIN/END markers
    if (!processedPrivateKey.includes('-----BEGIN')) {
      // If the key is base64 encoded without markers, try to decode it
      try {
        processedPrivateKey = Buffer.from(processedPrivateKey, 'base64').toString('utf8');
      } catch (e) {
        console.error('Failed to decode base64 private key:', e);
        throw new Error('Invalid private key format');
      }
    }

    // Validate the private key format
    if (!processedPrivateKey.includes('-----BEGIN PRIVATE KEY-----') && 
        !processedPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      throw new Error('Private key missing BEGIN marker');
    }

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      credentials: {
        type: 'service_account',
        project_id: projectId,
        client_email: serviceAccountEmail,
        private_key: processedPrivateKey,
      },
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return null;
  }
} 