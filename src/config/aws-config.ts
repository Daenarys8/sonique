interface AWSConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  apiEndpoint: string;
}

// Load configuration from environment variables
export const awsConfig: AWSConfig = {
  region: import.meta.env.VITE_AWS_REGION || '',
  userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || '',
  userPoolWebClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID || '',
  apiEndpoint: import.meta.env.VITE_AWS_API_ENDPOINT || ''
};

// Validate required configuration
const validateConfig = (config: AWSConfig): void => {
  const missingVars: string[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required AWS configuration variables: ${missingVars.join(', ')}`
    );
  }
};

// Validate configuration on load
validateConfig(awsConfig);