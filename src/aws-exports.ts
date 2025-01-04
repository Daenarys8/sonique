const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_xMhpiezaN',
      userPoolClientId: '6a56678hpu4lqk0fpjatb6tgj5',
      identityPoolId: 'us-east-1:86d45a16-dbf4-48b2-be32-962ae125be4b',
      signUpAttributes: ['email'],
      loginWith: {
        email: true,
        username: true,
        phone: false
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://4ymack2igrcglg7622gp6ggiw4.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'userPool'
    }
  }
};

export default awsConfig;
