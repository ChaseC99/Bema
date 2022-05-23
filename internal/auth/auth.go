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
