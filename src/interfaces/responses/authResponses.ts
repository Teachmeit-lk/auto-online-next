
export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      buyerId: number;
      userId: number;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      role: string;
    };
  };
  timestamp: string; 
}

export interface SignupResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  };
  timestamp: string;  
}

