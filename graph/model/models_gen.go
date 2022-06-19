// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

// An announcement message
type Announcement struct {
	// A unique integer ID
	ID int `json:"id"`
	// The author of the announcement
	Author *User `json:"author"`
	// The creation date of the announcement
	Created string `json:"created"`
	// The announcement title
	Title string `json:"title"`
	// The announcement body
	Content string `json:"content"`
	// Indicates whether the announcement is shown to unauthenticated users
	IsPublic bool `json:"isPublic"`
}

// The input required to create or edit an announcement
type AnnouncementInput struct {
	// The title of the announcement
	Title string `json:"title"`
	// The message content
	Content string `json:"content"`
	// Indicates whether the announcement is shown to unauthenticated users
	IsPublic bool `json:"isPublic"`
}

// A contest
type Contest struct {
	// A unique integer id of the contest
	ID int `json:"id"`
	// The name of the contest
	Name string `json:"name"`
	// The url of the contest program page
	URL *string `json:"url"`
	// The author of the announcement program code. Only visible to contest editors. Requires Edit Contests permission.
	Author *string `json:"author"`
	// The url slug of the contest badge
	BadgeSlug *string `json:"badgeSlug"`
	// A url to the badge image
	BadgeImageURL *string `json:"badgeImageUrl"`
	// Indicates whether the contest is active (accepting entries or being judged). This must be enabled for users to score entries
	IsCurrent bool `json:"isCurrent"`
	// The start date of the contest
	StartDate *string `json:"startDate"`
	// The end date (deadline) of the contest
	EndDate *string `json:"endDate"`
	// Indicates whether voting for winners is enabled for the contest. Requires authentication.
	IsVotingEnabled *bool `json:"isVotingEnabled"`
	// A list of winning entries
	Winners []*Entry `json:"winners"`
}

// A Khan Academy user and contest participant
type Contestant struct {
	// The user's unique KAID
	Kaid string `json:"kaid"`
	// The user's most recent display name
	Name string `json:"name"`
	// A list of entries submitted by the contestant. Requires authentication.
	Entries []*Entry `json:"entries"`
	// The total number of entries the contestant has submitted
	EntryCount int `json:"entryCount"`
	// The total number of contests the contestant has participated in
	ContestCount int `json:"contestCount"`
}

// The input required for creating a new contest
type CreateContestInput struct {
	// The name of the contest
	Name string `json:"name"`
	// The url of the contest program page
	URL string `json:"url"`
	// The author of the announcement program code.
	Author string `json:"author"`
	// Indicates whether the contest is active (accepting entries or being judged). This must be enabled for users to score entries
	IsCurrent bool `json:"isCurrent"`
	// The start date of the contest
	StartDate string `json:"startDate"`
	// The end date (deadline) of the contest
	EndDate string `json:"endDate"`
}

type CreateJudgingGroupInput struct {
	// The name of the group
	Name string `json:"name"`
}

// The input required for editing a contest
type EditContestInput struct {
	// The name of the contest
	Name string `json:"name"`
	// The url of the contest program page
	URL string `json:"url"`
	// The author of the announcement program code.
	Author string `json:"author"`
	// Indicates whether the contest is active (accepting entries or being judged). This must be enabled for users to score entries
	IsCurrent bool `json:"isCurrent"`
	// The start date of the contest
	StartDate string `json:"startDate"`
	// The end date (deadline) of the contest
	EndDate string `json:"endDate"`
	// The url slug of the contest badge
	BadgeSlug *string `json:"badgeSlug"`
	// A url to the badge image
	BadgeImageURL *string `json:"badgeImageUrl"`
	// Indicates whether voting for winners is enabled for the contest
	IsVotingEnabled bool `json:"isVotingEnabled"`
}

// The input required for editing an entry
type EditEntryInput struct {
	// The title of the entry
	Title string `json:"title"`
	// The skill level assigned to the entry
	SkillLevel string `json:"skillLevel"`
	// The height of the entry program canvas
	Height int `json:"height"`
	// The ID of the judging group the entry is assigned to. Requires Assign Entry Groups permission.
	Group int `json:"group"`
	// Indicates whether the entry has been flagged
	IsFlagged bool `json:"isFlagged"`
	// Indicates whether the entry has been disqualified
	IsDisqualified bool `json:"isDisqualified"`
	// Indicates whether the skill level has been permanently set for the entry. Requires admin permission.
	IsSkillLevelLocked bool `json:"isSkillLevelLocked"`
}

type EditJudgingGroupInput struct {
	// The name of the group
	Name string `json:"name"`
	// Indicates whether new entries and users can be assigned to this group
	IsActive bool `json:"isActive"`
}

// A skill bracket and its respective entry count
type EntriesPerLevel struct {
	// The name of the skill bracket
	Level string `json:"level"`
	// The number of entries in the skill bracket
	Count int `json:"count"`
}

// A program submission for a contest
type Entry struct {
	// A unique integer ID
	ID int `json:"id"`
	// The contest for which the entry was submitted
	Contest *Contest `json:"contest"`
	// A URL to the entry program
	URL string `json:"url"`
	// The KAID of the entry program
	Kaid string `json:"kaid"`
	// The title of the entry
	Title string `json:"title"`
	// The author of the entry
	Author *Contestant `json:"author"`
	// The skill level assigned to the entry
	SkillLevel *string `json:"skillLevel"`
	// The number of votes the entry received on KA
	Votes int `json:"votes"`
	// The date the entry program was created
	Created string `json:"created"`
	// The height of the entry program canvas
	Height int `json:"height"`
	// Indicates if the entry is a winner of the contest
	IsWinner bool `json:"isWinner"`
	// The judging group the entry is assigned to. Requires authentication.
	Group *JudgingGroup `json:"group"`
	// Indicates whether the entry has been flagged. Requires authentication.
	IsFlagged *bool `json:"isFlagged"`
	// Indicates whether the entry has been disqualified. Requires authentication.
	IsDisqualified *bool `json:"isDisqualified"`
	// Indicates whether the skill level has been permanently set for the entry. Requires Edit Entries permission.
	IsSkillLevelLocked *bool `json:"isSkillLevelLocked"`
	// The average score of the entry. Requires authentication.
	AverageScore *float64 `json:"averageScore"`
	// The number of evaluations submitted for the entry. Requires authentication.
	EvaluationCount *int `json:"evaluationCount"`
	// The number of judges that voted for this entry. Requires authentication.
	VoteCount *int `json:"voteCount"`
	// Indicates whether the current user has voted for the entry. Requires authentication.
	IsVotedByUser *bool `json:"isVotedByUser"`
	// A list of judge votes for the entry. Requires authentication.
	JudgeVotes []*EntryVote `json:"judgeVotes"`
}

// The number of entries for a contest
type EntryCounts struct {
	// The number of flagged entries
	Flagged int `json:"flagged"`
	// The number of disqualified entries
	Disqualified int `json:"disqualified"`
	// The total number of active entries
	Total int `json:"total"`
}

// A judge vote submitted for an entry
type EntryVote struct {
	// A unique integer ID
	ID int `json:"id"`
	// The user that voted for the entry
	User *User `json:"user"`
	// The reason the user likes the entry
	Reason string `json:"reason"`
}

// A logged application error
type Error struct {
	// A unique integer id
	ID int `json:"id"`
	// A description of the error
	Message string `json:"message"`
	// The call stack of when the error occurred
	Stack *string `json:"stack"`
	// The date and time the error occurred
	Timestamp string `json:"timestamp"`
	// The origin of the network request associated with the error
	RequestOrigin *string `json:"requestOrigin"`
	// The referrer of the network request associated with the error
	RequestReferrer *string `json:"requestReferrer"`
	// The device and browser the user was using
	RequestUserAgent *string `json:"requestUserAgent"`
	// The user that experienced the error, if they were logged in
	User *User `json:"user"`
}

// An evaluation of an entry
type Evaluation struct {
	// A unique integer ID
	ID int `json:"id"`
	// The entry the evaluation is for
	Entry *Entry `json:"entry"`
	// The user that submitted the evaluation
	User *User `json:"user"`
	// The creativity score
	Creativity float64 `json:"creativity"`
	// The complexity score
	Complexity float64 `json:"complexity"`
	// The execution score
	Execution float64 `json:"execution"`
	// The interpretation score
	Interpretation float64 `json:"interpretation"`
	// The total score
	Total float64 `json:"total"`
	// The suggested skill level of the entry
	SkillLevel string `json:"skillLevel"`
	// The timestamp of when the evaluation was submitted
	Created string `json:"created"`
	// Indicates whether the current user can edit the evaluation
	CanEdit bool `json:"canEdit"`
}

// The progress of a single evaluator
type EvaluatorProgress struct {
	// The evaluator
	User *User `json:"user"`
	// The number of entries scored by the evaluator
	Count int `json:"count"`
	// The number of entries in the evaluator's group
	Total int `json:"total"`
}

// The full profile of a logged in user
type FullUserProfile struct {
	// Indicates whether the user is an admin, which allows them to perform all actions and access all data
	IsAdmin bool `json:"isAdmin"`
	// Indicates whether the acting user is being impersonated by an admin user
	IsImpersonated bool `json:"isImpersonated"`
	// Indicates whether the actor is logged in
	LoggedIn bool `json:"loggedIn"`
	// The kaid of the actual user, if the current actor is being impersonated
	OriginKaid *string `json:"originKaid"`
	// The logged in user
	User *User `json:"user"`
}

// Represents a criterium used for scoring entries
type JudgingCriteria struct {
	// A unique integer ID
	ID int `json:"id"`
	// The name of the criteria
	Name string `json:"name"`
	// An explanation of how to use the criteria
	Description string `json:"description"`
	// Indicates if the criteria should be displayed on the judging page
	IsActive bool `json:"isActive"`
	// The order in which the criteria appears
	SortOrder int `json:"sortOrder"`
}

// Input used for creating or editing judging criteria
type JudgingCriteriaInput struct {
	// The name of the criteria
	Name string `json:"name"`
	// An explanation of how to use the criteria
	Description string `json:"description"`
	// Indicates if the criteria should be displayed on the judging page
	IsActive bool `json:"isActive"`
	// The order in which the criteria appears
	SortOrder int `json:"sortOrder"`
}

// A group of evaluators that can be assigned entries to judge
type JudgingGroup struct {
	// A uniqune integer ID
	ID int `json:"id"`
	// The name of the group
	Name string `json:"name"`
	// Indicates whether new entries and users can be assigned to this group
	IsActive bool `json:"isActive"`
}

type JudgingProgress struct {
	// The current user's progress
	User *Progress `json:"user"`
	// The progress of the current user's group
	Group *Progress `json:"group"`
	// The number of entries that have received at least one evaluation
	Entries *Progress `json:"entries"`
	// The total and expected number of evaluations
	Evaluations *Progress `json:"evaluations"`
	// The progress of each evaluator
	Evaluators []*EvaluatorProgress `json:"evaluators"`
}

// A knowledge base article
type KBArticle struct {
	// A unique integer ID
	ID int `json:"id"`
	// The section the article is assigned to
	Section *KBSection `json:"section"`
	// The title of the article
	Title string `json:"title"`
	// The content of the article
	Content string `json:"content"`
	// The author of the article. Requires authentication.
	Author *User `json:"author"`
	// The timestamp of the last update to the article
	LastUpdated string `json:"lastUpdated"`
	// The visibility of the article. Requires Edit KB Content permission.
	Visibility *string `json:"visibility"`
	// Indicates whether the initial version of the article has been published. Requires Edit KB Content permission.
	IsPublished *bool `json:"isPublished"`
	// Indicates whether the article has an existing draft. Requires Edit KB Content permission.
	HasDraft *bool `json:"hasDraft"`
	// The current draft revision to the article
	Draft *KBArticleDraft `json:"draft"`
}

type KBArticleDraft struct {
	// A unique integer ID
	ID int `json:"id"`
	// The title of the article
	Title string `json:"title"`
	// The content of the article
	Content string `json:"content"`
	// The author of the article draft. Requires authentication.
	Author *User `json:"author"`
	// The timestamp of the last update to the article draft
	LastUpdated string `json:"lastUpdated"`
}

// A knowledge base section
type KBSection struct {
	// A unique integer ID
	ID int `json:"id"`
	// The name of the section
	Name string `json:"name"`
	// A description of the section
	Description string `json:"description"`
	// The visibility of the section. Requires Edit KB Content permission.
	Visibility *string `json:"visibility"`
	// A list of articles assigned to the section
	Articles []*KBArticle `json:"articles"`
}

// The permissions set, associated with the User type
type Permissions struct {
	// Allows the user to add individual and bulk import entries
	AddEntries bool `json:"add_entries"`
	// Allows the user to create new user accounts
	AddUsers bool `json:"add_users"`
	// Allows the user to assign entries to judging groups
	AssignEntryGroups bool `json:"assign_entry_groups"`
	// Allows the user to assign evaluators to judging groups
	AssignEvaluatorGroups bool `json:"assign_evaluator_groups"`
	// Allows the user to impersonate other users
	AssumeUserIdentities bool `json:"assume_user_identities"`
	// Allows the user to change the passwords of other users
	ChangeUserPasswords bool `json:"change_user_passwords"`
	// Allows the user to delete all evaluations
	DeleteAllEvaluations bool `json:"delete_all_evaluations"`
	// Allows the user to delete all tasks
	DeleteAllTasks bool `json:"delete_all_tasks"`
	// Allows the user to delete all contests and associated data
	DeleteContests bool `json:"delete_contests"`
	// Allows the user to delete all entries
	DeleteEntries bool `json:"delete_entries"`
	// Allows the user to delete all errors
	DeleteErrors bool `json:"delete_errors"`
	// Allows the user to delete all KB articles and sections
	DeleteKbContent bool `json:"delete_kb_content"`
	// Allows the user to edit all evaluations
	EditAllEvaluations bool `json:"edit_all_evaluations"`
	// Allows the user to edit all tasks
	EditAllTasks bool `json:"edit_all_tasks"`
	// Allows the user to edit all contests
	EditContests bool `json:"edit_contests"`
	// Allows the user to edit all entries
	EditEntries bool `json:"edit_entries"`
	// Allows the user to edit all KB articles and sections
	EditKbContent bool `json:"edit_kb_content"`
	// Allows the user to edit all user profiles
	EditUserProfiles bool `json:"edit_user_profiles"`
	JudgeEntries     bool `json:"judge_entries"`
	// Allows the user to create, edit, and delete announcements
	ManageAnnouncements bool `json:"manage_announcements"`
	// Allows the user to create, edit, and delete judging criteria
	ManageJudgingCriteria bool `json:"manage_judging_criteria"`
	// Allows the user to create, edit, and delete judging groups. Needs the assign_evaluator_groups permission to also assign users to groups.
	ManageJudgingGroups bool `json:"manage_judging_groups"`
	// Allows the user to add and remove winning entries
	ManageWinners bool `json:"manage_winners"`
	// Allows the user to publish draft KB articles
	PublishKbContent bool `json:"publish_kb_content"`
	// Allows the user to view admin stats on the dashboard
	ViewAdminStats bool `json:"view_admin_stats"`
	// Allows the user to view all evaluations
	ViewAllEvaluations bool `json:"view_all_evaluations"`
	// Allows the user to view all tasks
	ViewAllTasks bool `json:"view_all_tasks"`
	// Allows the user to view all user accounts
	ViewAllUsers bool `json:"view_all_users"`
	// Allows the user to view all errors
	ViewErrors bool `json:"view_errors"`
	// Allows the user to view all judging settings
	ViewJudgingSettings bool `json:"view_judging_settings"`
}

// The progress of a general entity
type Progress struct {
	// The current progress
	Count int `json:"count"`
	// The expected progress
	Total int `json:"total"`
}

// A single task that can be assigned to and completed by a user
type Task struct {
	// A uniqune integer ID
	ID int `json:"id"`
	// A description of the task
	Title string `json:"title"`
	// The user the task is assigned to, or null if unassigned
	AssignedUser *User `json:"assignedUser"`
	// The completion status of the task
	Status string `json:"status"`
	// The date the task needs to be completed by
	DueDate string `json:"dueDate"`
}

// An evaluator account
type User struct {
	// The unique integer id of the user
	ID int `json:"id"`
	// The kaid associated with the user's KA account
	Kaid string `json:"kaid"`
	// The user's real name. Requires View All Users permission.
	Name *string `json:"name"`
	// The user's display name
	Nickname *string `json:"nickname"`
	// The user's username that is used to log in
	Username *string `json:"username"`
	// The user's email address. Requires View All Users permission.
	Email *string `json:"email"`
	// Indicates if the account has been deactivated. Requires View All Users permission.
	AccountLocked *bool `json:"accountLocked"`
	// The permission set of the user. Requires View All Users permission.
	Permissions *Permissions `json:"permissions"`
	// Indicates whether the user is an admin, which allows them to perform all actions and access all data. Requires View All Users permission.
	IsAdmin *bool `json:"isAdmin"`
	// The timestamp of the user's last login. Requires View All Users permission.
	LastLogin *string `json:"lastLogin"`
	// The start date of the user's term
	TermStart *string `json:"termStart"`
	// The end date of the user's term
	TermEnd *string `json:"termEnd"`
	// Indicates whether the user has email notifications enabled for new announcements. Requires View All Users permission.
	NotificationsEnabled *bool `json:"notificationsEnabled"`
	// The judging group the user is assigned to. Requires View Judging Settings permission.
	AssignedGroup *JudgingGroup `json:"assignedGroup"`
	// The total number of entries the user has scored. Requires authentication.
	TotalEvaluations *int `json:"totalEvaluations"`
	// The total number of contests the user has scored. Requires authentication.
	TotalContestsJudged *int `json:"totalContestsJudged"`
}
