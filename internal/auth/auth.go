package auth

import (
	"context"
	"database/sql"
	"net/http"
	"os"

	"github.com/KA-Challenge-Council/Bema/internal/util"
	"github.com/golang-jwt/jwt"
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
	Email          string
	AccountLocked  bool
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

func Middleware(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c, err := r.Cookie("jwtToken")

			var user *User

			// Don't set the user for unauthenticated users
			if err != nil || c == nil {
				user = nil
			} else {
				// Decode the user token
				token, err := jwt.Parse(c.Value, func(token *jwt.Token) (interface{}, error) {
					secret := os.Getenv("SECRET_KEY")
					return []byte(secret), nil
				})
				if err != nil {
					http.Error(w, "invalid auth token", http.StatusForbidden)
				}

				// Allow users with expired tokens to pass
				if !token.Valid {
					user = nil
				} else {
					// Retrieve data from the token
					claims := token.Claims.(jwt.MapClaims)

					permissions := claims["permissions"].(map[string]interface{})

					user = &User{
						ID:             int(claims["evaluator_id"].(float64)),
						Kaid:           claims["evaluator_kaid"].(string),
						Name:           claims["evaluator_name"].(string),
						Nickname:       claims["nickname"].(string),
						Username:       claims["username"].(string),
						Email:          claims["email"].(string),
						AccountLocked:  claims["account_locked"].(bool),
						IsAdmin:        claims["is_admin"].(bool),
						IsImpersonated: claims["is_impersonated"].(bool),
						OriginKaid:     util.ParseString(claims["origin_kaid"]),
						Permissions: Permissions{
							AddEntries:            permissions["add_entries"].(bool),
							AddUsers:              permissions["add_users"].(bool),
							AssignEntryGroups:     permissions["assign_entry_groups"].(bool),
							AssignEvaluatorGroups: permissions["assign_evaluator_groups"].(bool),
							AssumeUserIdentities:  permissions["assume_user_identities"].(bool),
							ChangeUserPasswords:   permissions["change_user_passwords"].(bool),
							DeleteAllEvaluations:  permissions["delete_all_evaluations"].(bool),
							DeleteAllTasks:        permissions["delete_all_tasks"].(bool),
							DeleteContests:        permissions["delete_contests"].(bool),
							DeleteEntries:         permissions["delete_entries"].(bool),
							DeleteErrors:          permissions["delete_errors"].(bool),
							DeleteKbContent:       permissions["delete_kb_content"].(bool),
							EditAllEvaluations:    permissions["edit_all_evaluations"].(bool),
							EditAllTasks:          permissions["edit_all_tasks"].(bool),
							EditContests:          permissions["edit_contests"].(bool),
							EditEntries:           permissions["edit_entries"].(bool),
							EditKbContent:         permissions["edit_kb_content"].(bool),
							EditUserProfiles:      permissions["edit_user_profiles"].(bool),
							JudgeEntries:          permissions["judge_entries"].(bool),
							ManageAnnouncements:   permissions["manage_announcements"].(bool),
							ManageJudgingCriteria: permissions["manage_judging_criteria"].(bool),
							ManageJudgingGroups:   permissions["manage_judging_groups"].(bool),
							ManageWinners:         permissions["manage_winners"].(bool),
							PublishKbContent:      permissions["publish_kb_content"].(bool),
							ViewAdminStats:        permissions["view_admin_stats"].(bool),
							ViewAllEvaluations:    permissions["view_all_evaluations"].(bool),
							ViewAllTasks:          permissions["view_all_tasks"].(bool),
							ViewAllUsers:          permissions["view_all_users"].(bool),
							ViewErrors:            permissions["view_errors"].(bool),
							ViewJudgingSettings:   permissions["view_judging_settings"].(bool),
						},
					}
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
