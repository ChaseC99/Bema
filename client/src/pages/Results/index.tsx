import Results from "./Results";

export default Results;

export interface WinningEntry {
  entry_author: string
  entry_id: number
  entry_level: string
  entry_title: string
  entry_url: string
}

export interface EntryWithScores {
  avg_score: number
  entry_author: string
  entry_id: number
  entry_level: string
  entry_url: string
  evaluations: number
  title: string
  vote_count: number
  voted_by_user: boolean
}

export interface EntryWithScoresPublic {
  entry_author: string
  entry_id: number
  entry_url: string
  title: string
}

export type EntriesPerLevel = {
  entry_level: string
  count: number
}

export type EntryVote = {
  entry_id: number
  evaluator_id: number
  feedback: string
  nickname: string
  vote_id: number
}