import Users from "./Users";

export type User = {
  id: number
  name: string
  kaid: string
  username: string
  nickname: string | null
  email: string | null
  notificationsEnabled: boolean
  termStart: string | null
  termEnd: string | null
  lastLogin: string | null
  accountLocked: boolean
  isAdmin: boolean
}

export default Users;