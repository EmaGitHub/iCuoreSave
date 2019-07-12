
export interface AuthResponse {
    refreshToken: string;
    refreshTokenExpiration: string;
    accessToken: string;
    accessTokenExpiration: string;
    userCode?: string;
    extra?: {meetingIds : string[]};
    jwt: string;
}
