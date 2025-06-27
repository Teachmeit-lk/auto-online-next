import axios from "axios";
import { SignupRequest, LoginRequest } from "@/interfaces/requests/authRequests";
import { SignupResponse, LoginResponse } from "@/interfaces/responses/authResponses";

const API_URL = process.env.API_URL

type UserType = "admin" | "buyer" | "vendor";

/**
 * Signup function for all user types
 * @param data - Signup form data
 * @param userType - "admin" | "buyer" | "vendor"
 */
export const signup = async (
  data: SignupRequest,
  userType: UserType
): Promise<SignupResponse> => {
  let endpoint = "/auth/signup";
  if (userType === "vendor") endpoint = "/auth/register/vendor";
  else if (userType === "buyer") endpoint = "/auth/register/buyer";

  try {
    const response = await axios.post<SignupResponse>(
      `${API_URL}${endpoint}`,
      data
    );
    const { accessToken, refreshToken } = response.data.data;
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
    return response.data;
  } catch (error) {
    throw new Error("Signup failed. Please try again.");
  }
};

/**
 
 * @param data - Login form data
 * @param userType - "admin" | "buyer" | "vendor"
 */
export const login = async (
  data: LoginRequest,
  userType: UserType
): Promise<LoginResponse> => {
  let endpoint = "/auth/login";
  if (userType === "vendor") endpoint = "/auth/vendor/login";
  else if (userType === "buyer") endpoint = "/auth/buyer/login";

  try {
    const response = await axios.post<LoginResponse>(
      `${API_URL}${endpoint}`,
      data
    );
    const { accessToken, refreshToken } = response.data.data;
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
    return response.data;
  } catch (error) {
    throw new Error("Login failed. Please check your credentials.");
  }
};


export const getAccessToken = (): string | null => {
  return sessionStorage.getItem("accessToken");
};