export type Hook = (...params: any[]) => any;

export interface UserHooks {
    [key: string]: Hook;
}
