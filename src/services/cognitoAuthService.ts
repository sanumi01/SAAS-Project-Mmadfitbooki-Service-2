// Enhanced Cognito Authentication Service for MMAD FitBooki
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from '../config/aws-config';

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: awsConfig.region 
});

export interface CognitoUser {
  username: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'TRAINER' | 'ADMIN';
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export class CognitoAuthService {
  // Sign up new user
  static async signUp(
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ): Promise<{ userSub: string; codeDeliveryDetails: any }> {
    const command = new SignUpCommand({
      ClientId: awsConfig.cognito.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'custom:role', Value: 'CUSTOMER' },
        ...(phone ? [{ Name: 'phone_number', Value: phone }] : [])
      ],
    });

    const response = await cognitoClient.send(command);
    return {
      userSub: response.UserSub!,
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  }

  // Confirm sign up with verification code
  static async confirmSignUp(email: string, code: string): Promise<void> {
    const command = new ConfirmSignUpCommand({
      ClientId: awsConfig.cognito.clientId,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<AuthTokens> {
    const command = new InitiateAuthCommand({
      ClientId: awsConfig.cognito.clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);
    
    if (!response.AuthenticationResult) {
      throw new Error('Authentication failed');
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken!,
      idToken: response.AuthenticationResult.IdToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
    };
  }

  // Get current user info
  static async getCurrentUser(accessToken: string): Promise<CognitoUser> {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);
    
    const getAttributeValue = (name: string) => 
      response.UserAttributes?.find(attr => attr.Name === name)?.Value || '';

    return {
      username: response.Username!,
      email: getAttributeValue('email'),
      name: getAttributeValue('name'),
      phone: getAttributeValue('phone_number'),
      role: (getAttributeValue('custom:role') as any) || 'CUSTOMER',
    };
  }

  // Update user attributes
  static async updateUserAttributes(
    accessToken: string, 
    attributes: { [key: string]: string }
  ): Promise<void> {
    const userAttributes = Object.entries(attributes).map(([name, value]) => ({
      Name: name,
      Value: value,
    }));

    const command = new UpdateUserAttributesCommand({
      AccessToken: accessToken,
      UserAttributes: userAttributes,
    });

    await cognitoClient.send(command);
  }

  // Change password
  static async changePassword(
    accessToken: string,
    previousPassword: string,
    proposedPassword: string
  ): Promise<void> {
    const command = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword,
    });

    await cognitoClient.send(command);
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<{ codeDeliveryDetails: any }> {
    const command = new ForgotPasswordCommand({
      ClientId: awsConfig.cognito.clientId,
      Username: email,
    });

    const response = await cognitoClient.send(command);
    return {
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  }

  // Confirm forgot password
  static async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: awsConfig.cognito.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);
  }

  // Decode JWT token (client-side)
  static decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }
}

export default CognitoAuthService;