import apiClient from '@/config/api';
import axios from 'axios';

import {
  SignupRequest,
  LoginRequest,
} from '@/interfaces/requests/authRequests';
import {
  SignupResponse,
  LoginResponse,
} from '@/interfaces/responses/authResponses';

type UserType = 'admin' | 'buyer' | 'vendor';

export const login = async (
  data: LoginRequest,
  userType: UserType
): Promise<LoginResponse> => {
  let endpoint = '/auth';
  if (userType === 'vendor') endpoint = '/auth/vendor/login';
  else if (userType === 'buyer') endpoint = '/auth/buyer/login';

  try {
    console.log(`Logging in to: ${endpoint}`);
    const response = await apiClient.post<LoginResponse>(endpoint, data);
    const { accessToken, refreshToken } = response.data.data;
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    return response.data;
  } catch (error: any) {
    console.error('Login service error:', error);
    throw error;
  }
};
export const signup = async (
  data: SignupRequest,
  userType: UserType
): Promise<SignupResponse> => {
  let endpoint = '/auth/signup';
  if (userType === 'vendor') endpoint = '/auth/register/vendor';
  else if (userType === 'buyer') endpoint = '/auth/register/buyer';

  try {
    console.log(`Signing up to: ${endpoint}`);
    const response = await apiClient.post<SignupResponse>(endpoint, data);

    const { accessToken, refreshToken } = response.data.data;
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    return response.data;
  } catch (error: any) {
    console.error('Signup service error:', error);
    throw new Error(error.message || 'Signup failed');
  }
};

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem('accessToken');
};