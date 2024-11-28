// src/aws-exports.ts
interface AwsConfig {
  Auth: {
    Cognito: {
      userPoolId: string;
      userPoolClientId: string;
      signUpAttributes: string[];
    };
  };
}

// src/aws-exports.ts
const awsConfig: AwsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_XXXXXXXXX',
      userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Note: changed from userPoolWebClientId
      signUpAttributes: ['email']
    }
  }
};

export default awsConfig;

