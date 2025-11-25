// AWS Configuration for MMAD FitBooki
// Centralized configuration for all AWS services

export interface AWSConfig {
  region: string;
  cognito: {
    userPoolId: string;
    clientId: string;
    identityPoolId: string;
  };
  dynamodb: {
    tables: {
      users: string;
      bookings: string;
      trainers: string;
      schedules: string;
    };
  };
  s3: {
    bucket: string;
    region: string;
  };
  cloudfront: {
    distributionId?: string;
    domainName?: string;
  };
  ses: {
    region: string;
    fromEmail: string;
  };
}

// Default configuration - update these values after running setup scripts
export const awsConfig: AWSConfig = {
  region: 'us-east-1',
  cognito: {
    userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
    clientId: process.env.REACT_APP_CLIENT_ID || '',
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
  },
  dynamodb: {
    tables: {
      users: 'MMADFitBooki-Users',
      bookings: 'MMADFitBooki-Bookings',
      trainers: 'MMADFitBooki-Trainers',
      schedules: 'MMADFitBooki-Schedules',
    },
  },
  s3: {
    bucket: 'mmadfitbooki-servive',
    region: 'us-east-1',
  },
  cloudfront: {
    distributionId: process.env.REACT_APP_CLOUDFRONT_DISTRIBUTION_ID,
    domainName: process.env.REACT_APP_CLOUDFRONT_DOMAIN,
  },
  ses: {
    region: 'us-east-1',
    fromEmail: 'noreply@mmadfitbooki.com',
  },
};

// Environment-specific configurations
export const getConfig = (): AWSConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...awsConfig,
        // Production-specific overrides
      };
    case 'staging':
      return {
        ...awsConfig,
        // Staging-specific overrides
        dynamodb: {
          tables: {
            users: 'MMADFitBooki-Users-Staging',
            bookings: 'MMADFitBooki-Bookings-Staging',
            trainers: 'MMADFitBooki-Trainers-Staging',
            schedules: 'MMADFitBooki-Schedules-Staging',
          },
        },
      };
    default:
      return awsConfig;
  }
};

// Validation function to ensure all required config is present
export const validateConfig = (config: AWSConfig): boolean => {
  const required = [
    config.cognito.userPoolId,
    config.cognito.clientId,
    config.cognito.identityPoolId,
  ];
  
  return required.every(value => value && value.length > 0);
};

export default awsConfig;