// src/aws-exports.d.ts
interface AwsConfig {
    Auth: {
      Cognito: {
        userPoolId: string;
        userPoolClientId: string;
        userPoolClientSecret: string;
        signUpAttributes: string[];
      };
    };
  }
  
  declare const awsConfig: AwsConfig;
  export default awsConfig;
  