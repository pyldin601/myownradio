import { apiDelete, apiGet, apiPost } from "./client";
import type {
  AccountSession,
  EmptyResponse,
  LoginRequest,
  PasswordResetBeginRequest,
  PasswordResetCompleteRequest,
  ProfileUpdateRequest,
  SignUpCompleteRequest,
  SignUpRequest,
} from "./types";

export type FacebookLoginRequest = {
  accessToken: string;
};

export type ChangePasswordRequest = {
  new_password: string;
  old_password: string;
};

export type DeleteAccountRequest = {
  password: string;
};

export function login(credentials: LoginRequest) {
  return apiPost<AccountSession>("/api/v2/user/login", credentials);
}

export function loginByFacebook(authResponse: FacebookLoginRequest) {
  return apiPost<AccountSession>("/api/v2/user/fbLogin", {
    token: authResponse.accessToken,
  });
}

export function signUpRequest(params: SignUpRequest) {
  return apiPost<EmptyResponse>("/api/v2/user/signUpBegin", params);
}

export function signUp(params: SignUpCompleteRequest) {
  return apiPost<EmptyResponse>("/api/v2/user/signUpComplete", {
    code: params.code,
    login: params.login,
    password: params.password,
    name: params.name,
    info: params.info,
    permalink: params.permalink,
    country_id: params.country_id,
  });
}

export function resetRequest(params: PasswordResetBeginRequest) {
  return apiPost<EmptyResponse>("/api/v2/user/passwordResetBegin", {
    login: params.login,
  });
}

export function resetPassword(params: PasswordResetCompleteRequest) {
  return apiPost<EmptyResponse>("/api/v2/user/passwordResetComplete", {
    code: params.code,
    password: params.password,
  });
}

export function whoAmI() {
  return apiGet<AccountSession>("/api/v2/self");
}

export function changeInfo(params: ProfileUpdateRequest) {
  return apiPost<EmptyResponse>("/api/v2/self", {
    name: params.name,
    info: params.info,
    permalink: params.permalink,
    country_id: params.country_id,
  });
}

export function changePassword(params: ChangePasswordRequest) {
  return apiPost<EmptyResponse>("/api/v2/self/changePassword", params);
}

export function deleteAccount(params: DeleteAccountRequest) {
  return apiPost<EmptyResponse>("/api/v2/self/delete", params);
}

export function logout() {
  return apiDelete<EmptyResponse>("/api/v2/self");
}

export function enterPromoCode(code: string) {
  return apiPost<string | EmptyResponse>("/api/v2/self/promoCode", { code });
}

export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);

  return apiPost<string>("/api/v2/avatar", form);
}

export function removeAvatar() {
  return apiDelete<EmptyResponse>("/api/v2/avatar");
}
