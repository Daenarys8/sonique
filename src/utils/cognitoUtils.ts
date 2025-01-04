import awsConfig from '../aws-exports';

export async function calculateSecretHash(username: string): Promise<string> {
  const { userPoolClientId, userPoolClientSecret } = awsConfig.Auth.Cognito;
  
  const message = username + userPoolClientId;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(userPoolClientSecret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}