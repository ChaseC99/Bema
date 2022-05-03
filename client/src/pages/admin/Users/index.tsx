import Users from "./Users";

export type User = {
  account_locked: boolean
  avatar_url: string
  created_tstz: string
  dt_term_end: string
  dt_term_start: string
  email: string | null
  evaluator_id: number
  evaluator_kaid: string
  evaluator_name: string
  force_update: boolean | null
  group_id: number | null
  is_admin: boolean
  logged_in: boolean
  logged_in_tstz: string
  nickname: string
  receive_emails: boolean
  username: string
}

export default Users;