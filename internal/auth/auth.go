package auth

import (
	"context"
	"net/http"
	"time"

	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var userCtxKey = &contextKey{"user"}

type contextKey struct {
	name string
}

type User struct {
	ID             int
	Kaid           string
	Name           string
	Nickname       string
	Username       string
	IsAdmin        bool
	Permissions    Permissions
	IsImpersonated bool
	OriginKaid     *string
}

type Permissions struct {
	AddEntries            bool
	AddUsers              bool
	AssignEntryGroups     bool
	AssignEvaluatorGroups bool
	AssumeUserIdentities  bool
	ChangeUserPasswords   bool
	DeleteAllEvaluations  bool
	DeleteAllTasks        bool
	DeleteContests        bool
	DeleteEntries         bool
	DeleteErrors          bool
	DeleteKbContent       bool
	EditAllEvaluations    bool
	EditAllTasks          bool
	EditContests          bool
	EditEntries           bool
	EditKbContent         bool
	EditUserProfiles      bool
	JudgeEntries          bool
	ManageAnnouncements   bool
	ManageJudgingCriteria bool
	ManageJudgingGroups   bool
	ManageWinners         bool
	PublishKbContent      bool
	ViewAdminStats        bool
	ViewAllEvaluations    bool
	ViewAllTasks          bool
	ViewAllUsers          bool
	ViewErrors            bool
	ViewJudgingSettings   bool
}

type Permission string

const (
	AddEntries            Permission = "ADD_ENTRIES"
	AddUsers              Permission = "ADD_USERS"
	AssignEntryGroups     Permission = "ASSIGN_ENTRY_GROUPS"
	AssignEvaluatorGroups Permission = "ASSIGN_EVALUATOR_GROUPS"
	AssumeUserIdentities  Permission = "ASSUME_USER_IDENTITIES"
	ChangeUserPasswords   Permission = "CHANGE_USER_PASSWORDS"
	DeleteAllEvaluations  Permission = "DELETE_ALL_EVALUATIONS"
	DeleteAllTasks        Permission = "DELETE_ALL_TASKS"
	DeleteContests        Permission = "DELETE_CONTESTS"
	DeleteEntries         Permission = "DELETE_ENTRIES"
	DeleteErrors          Permission = "DELETE_ERRORS"
	DeleteKbContent       Permission = "DELETE_KB_CONTENT"
	EditAllEvaluations    Permission = "EDIT_ALL_EVALUATIONS"
	EditAllTasks          Permission = "EDIT_ALL_TASKS"
	EditContests          Permission = "EDIT_CONTESTS"
	EditEntries           Permission = "EDIT_ENTRIES"
	EditKbContent         Permission = "EDIT_KB_CONTENT"
	EditUserProfiles      Permission = "EDIT_USER_PROFILES"
	JudgeEntries          Permission = "JUDGE_ENTRIES"
	ManageAnnouncements   Permission = "MANAGE_ANNOUNCEMENTS"
	ManageJudgingCriteria Permission = "MANAGE_JUDGING_CRITERIA"
	ManageJudgingGroups   Permission = "MANAGE_JUDGING_GROUPS"
	ManageWinners         Permission = "MANAGE_WINNERS"
	PublishKbContent      Permission = "PUBLISH_KB_CONTENT"
	ViewAdminStats        Permission = "VIEW_ADMIN_STATS"
	ViewAllEvaluations    Permission = "VIEW_ALL_EVALUATIONS"
	ViewAllTasks          Permission = "VIEW_ALL_TASKS"
	ViewAllUsers          Permission = "VIEW_ALL_USERS"
	ViewErrors            Permission = "VIEW_ERRORS"
	ViewJudgingSettings   Permission = "VIEW_JUDGING_SETTINGS"
)

func newUserModel() *User {
	user := &User{}
	user.Permissions = Permissions{}
	return user
}

func Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, err := r.Cookie("auth")
			user := newUserModel()

			// Don't set the user for unauthenticated users
			if err != nil || token == nil {
				user = nil
			} else {
				// Look up the user by their session token
				var originToken *string
				row := db.DB.QueryRow("SELECT e.evaluator_id, e.evaluator_kaid, e.evaluator_name, e.nickname, e.username, e.is_admin, p.view_admin_stats, p.edit_contests, p.delete_contests, p.add_entries, p.edit_entries, p.delete_entries, p.assign_entry_groups, p.view_all_evaluations, p.edit_all_evaluations, p.delete_all_evaluations, p.manage_winners, p.view_all_tasks, p.edit_all_tasks, p.delete_all_tasks, p.view_judging_settings, p.manage_judging_groups, p.assign_evaluator_groups, p.manage_judging_criteria, p.view_all_users, p.edit_user_profiles, p.change_user_passwords, p.assume_user_identities, p.add_users, p.view_errors, p.delete_errors, p.judge_entries, p.edit_kb_content, p.delete_kb_content, p.publish_kb_content, p.manage_announcements, s.impersonated_by_token FROM user_session s INNER JOIN evaluator e ON s.user_id = e.evaluator_id INNER JOIN evaluator_permissions p ON p.evaluator_id = e.evaluator_id WHERE s.token = $1 AND s.expires > $2 AND e.account_locked = false;", token.Value, time.Now())
				if err := row.Scan(&user.ID, &user.Kaid, &user.Name, &user.Nickname, &user.Username, &user.IsAdmin, &user.Permissions.ViewAdminStats, &user.Permissions.EditContests, &user.Permissions.DeleteContests, &user.Permissions.AddEntries, &user.Permissions.EditEntries, &user.Permissions.DeleteEntries, &user.Permissions.AssignEntryGroups, &user.Permissions.ViewAllEvaluations, &user.Permissions.EditAllEvaluations, &user.Permissions.DeleteAllEvaluations, &user.Permissions.ManageWinners, &user.Permissions.ViewAllTasks, &user.Permissions.EditAllTasks, &user.Permissions.DeleteAllTasks, &user.Permissions.ViewJudgingSettings, &user.Permissions.ManageJudgingGroups, &user.Permissions.AssignEvaluatorGroups, &user.Permissions.ManageJudgingCriteria, &user.Permissions.ViewAllUsers, &user.Permissions.EditUserProfiles, &user.Permissions.ChangeUserPasswords, &user.Permissions.AssumeUserIdentities, &user.Permissions.AddUsers, &user.Permissions.ViewErrors, &user.Permissions.DeleteErrors, &user.Permissions.JudgeEntries, &user.Permissions.EditKbContent, &user.Permissions.DeleteKbContent, &user.Permissions.PublishKbContent, &user.Permissions.ManageAnnouncements, &originToken); err != nil {
					user = nil
				}

				if user != nil {
					user.IsImpersonated = originToken != nil
				}
			}

			// Add user to request context
			ctx := context.WithValue(r.Context(), userCtxKey, user)
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

// GetUserFromContext finds the user from the context. REQUIRES Middleware to have already run.
func GetUserFromContext(ctx context.Context) *User {
	user, _ := ctx.Value(userCtxKey).(*User)
	return user
}

func HasPermission(user *User, permission Permission) bool {
	if user == nil {
		return false
	}

	if user.IsAdmin {
		return true
	}

	switch permission {
	case AddEntries:
		return user.Permissions.AddEntries
	case AddUsers:
		return user.Permissions.AddUsers
	case AssignEntryGroups:
		return user.Permissions.AssignEntryGroups
	case AssignEvaluatorGroups:
		return user.Permissions.AssignEvaluatorGroups
	case AssumeUserIdentities:
		return user.Permissions.AssumeUserIdentities
	case ChangeUserPasswords:
		return user.Permissions.ChangeUserPasswords
	case DeleteAllEvaluations:
		return user.Permissions.DeleteAllEvaluations
	case DeleteAllTasks:
		return user.Permissions.DeleteAllTasks
	case DeleteContests:
		return user.Permissions.DeleteContests
	case DeleteEntries:
		return user.Permissions.DeleteEntries
	case DeleteErrors:
		return user.Permissions.DeleteErrors
	case DeleteKbContent:
		return user.Permissions.DeleteKbContent
	case EditAllEvaluations:
		return user.Permissions.EditAllEvaluations
	case EditAllTasks:
		return user.Permissions.EditAllTasks
	case EditContests:
		return user.Permissions.EditContests
	case EditEntries:
		return user.Permissions.EditEntries
	case EditKbContent:
		return user.Permissions.EditKbContent
	case EditUserProfiles:
		return user.Permissions.EditUserProfiles
	case JudgeEntries:
		return user.Permissions.JudgeEntries
	case ManageAnnouncements:
		return user.Permissions.ManageAnnouncements
	case ManageJudgingCriteria:
		return user.Permissions.ManageJudgingCriteria
	case ManageJudgingGroups:
		return user.Permissions.ManageJudgingGroups
	case ManageWinners:
		return user.Permissions.ManageWinners
	case PublishKbContent:
		return user.Permissions.PublishKbContent
	case ViewAdminStats:
		return user.Permissions.ViewAdminStats
	case ViewAllEvaluations:
		return user.Permissions.ViewAllEvaluations
	case ViewAllTasks:
		return user.Permissions.ViewAllTasks
	case ViewAllUsers:
		return user.Permissions.ViewAllUsers
	case ViewErrors:
		return user.Permissions.ViewErrors
	case ViewJudgingSettings:
		return user.Permissions.ViewJudgingSettings
	default:
		return false
	}
}

func ValidateUserLogin(password string, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func CreateAuthToken(ctx context.Context, userId int) *string {
	token := uuid.NewString()

	_, err := db.DB.Exec("INSERT INTO user_session (user_id, token, expires) VALUES ($1, $2, $3);", userId, token, time.Now().Add(14400000000000))
	if err != nil {
		return nil
	}

	_, err = db.DB.Exec("UPDATE evaluator SET logged_in_tstz = $1 WHERE evaluator_id = $2;", time.Now(), userId)
	if err != nil {
		return nil
	}

	return &token
}

func RemoveAuthTokensForUser(ctx context.Context, userId int) error {
	_, err := db.DB.Exec("DELETE FROM user_session WHERE user_id = $1", userId)
	return err
}
