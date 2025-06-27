

export interface SignupRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  whatsApp: string;
  address: string;
  city: string;
  district: string;
  zipCode: string;
  NIC: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}