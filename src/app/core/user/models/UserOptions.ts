import { UserHooks } from "./UserHooks";

export interface UserOptions {
    afterLogin?: UserHooks
    afterLogout?: UserHooks
}
