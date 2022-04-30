import Contests from "./Contests";

export type Contest = {
  badge_image_url: string | null
  badge_name: string | null
  contest_author: string | null
  contest_id: number
  contest_name: string
  contest_url: string
  current: boolean
  date_end: string
  date_start: string
  voting_enabled: boolean | null
}

export default Contests;