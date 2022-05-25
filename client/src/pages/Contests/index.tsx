import Contests from "./Contests";

// export type Contest = {
//   badge_image_url: string | null
//   badge_name: string | null
//   contest_author: string | null
//   contest_id: number
//   contest_name: string
//   contest_url: string
//   current: boolean
//   date_end: string
//   date_start: string
//   voting_enabled: boolean | null
// }

export type Contest = {
  id: number
  name: string
  url: string | null
  author: string | null
  badgeSlug: string | null
  badgeImageUrl: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  isVotingEnabled: boolean | null
}

export default Contests;