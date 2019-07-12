
export enum LoginStates {
    PUBLIC = 0,     // The user became a public user
    NEW_USER,       // A new new logs in
    LAST_USER,      // The previuos user logs in
    LOGOUT,         // The user logs out
    THROW_OUT       // The refreshToken expires
}
