package auth

import (
	"context"
	"database/sql"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql"
	"github.com/KA-Challenge-Council/Bema/graph/model"
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

// Handler for the @isAuthenticated directive. Only calls the resolver if the user is logged in.
func IsAuthenticated(ctx context.Context, obj interface{}, next graphql.Resolver, nullType model.NullType) (interface{}, error) {
	user := GetUserFromContext(ctx)

	// Let logged in users through
	if user != nil {
		return next(ctx)
	}

	switch nullType {
	case model.NullTypeEmptyString:
		return "", nil
	case model.NullTypeNull:
		return nil, nil
	default:
		return getEmptyArray(nullType), nil
	}
}

// Handler for the @hasPermission directive. Only calls the resolver if the user is an admin or if they are logged in and have the required permission.
func HasPermission(ctx context.Context, obj interface{}, next graphql.Resolver, permission model.Permission, nullType model.NullType, objType *model.ObjectType) (interface{}, error) {
	user := GetUserFromContext(ctx)

	// Allow admin users through
	if user != nil && user.IsAdmin {
		return next(ctx)
	}

	if objType != nil && isOwner(user, obj, *objType) {
		return next(ctx)
	}

	// Make sure the user has the required permission
	hasPermission := getPermissionFromEnum(user, permission.String())
	if !hasPermission {
		if nullType == model.NullTypeEmptyString {
			return "", nil
		} else if nullType == model.NullTypeNull {
			return nil, nil
		} else {
			return getEmptyArray(nullType), nil
		}
	}

	// If they have permission, call the resolver
	return next(ctx)
}

// Retrieves the user's permission value based on the enum string value that comes from the GraphQL Permission enum type
func getPermissionFromEnum(user *User, enumValue string) bool {
	if user == nil {
		return false
	}

	switch enumValue {
	case "ADD_ENTRIES":
		return user.Permissions.AddEntries
	case "ADD_USERS":
		return user.Permissions.AddUsers
	case "ASSIGN_ENTRY_GROUPS":
		return user.Permissions.AssignEntryGroups
	case "ASSIGN_EVALUATOR_GROUPS":
		return user.Permissions.AssignEvaluatorGroups
	case "ASSUME_USER_IDENTITIES":
		return user.Permissions.AssumeUserIdentities
	case "CHANGE_USER_PASSWORDS":
		return user.Permissions.ChangeUserPasswords
	case "DELETE_ALL_EVALUATIONS":
		return user.Permissions.DeleteAllEvaluations
	case "DELETE_ALL_TASKS":
		return user.Permissions.DeleteAllTasks
	case "DELETE_CONTESTS":
		return user.Permissions.DeleteContests
	case "DELETE_ENTRIES":
		return user.Permissions.DeleteEntries
	case "DELETE_ERRORS":
		return user.Permissions.DeleteErrors
	case "DELETE_KB_CONTENT":
		return user.Permissions.DeleteKbContent
	case "EDIT_ALL_EVALUATIONS":
		return user.Permissions.EditAllEvaluations
	case "EDIT_ALL_TASKS":
		return user.Permissions.EditAllTasks
	case "EDIT_CONTESTS":
		return user.Permissions.EditContests
	case "EDIT_ENTRIES":
		return user.Permissions.EditEntries
	case "EDIT_KB_CONTENT":
		return user.Permissions.EditKbContent
	case "EDIT_USER_PROFILES":
		return user.Permissions.EditUserProfiles
	case "JUDGE_ENTRIES":
		return user.Permissions.JudgeEntries
	case "MANAGE_ANNOUNCEMENTS":
		return user.Permissions.ManageAnnouncements
	case "MANAGE_JUDGING_CRITERIA":
		return user.Permissions.ManageJudgingCriteria
	case "MANAGE_JUDGING_GROUPS":
		return user.Permissions.ManageJudgingGroups
	case "MANAGE_WINNERS":
		return user.Permissions.ManageWinners
	case "PUBLISH_KB_CONTENT":
		return user.Permissions.PublishKbContent
	case "VIEW_ADMIN_STATS":
		return user.Permissions.ViewAdminStats
	case "VIEW_ALL_EVALUATIONS":
		return user.Permissions.ViewAllEvaluations
	case "VIEW_ALL_TASKS":
		return user.Permissions.ViewAllTasks
	case "VIEW_ALL_USERS":
		return user.Permissions.ViewAllUsers
	case "VIEW_ERRORS":
		return user.Permissions.ViewErrors
	case "VIEW_JUDGING_SETTINGS":
		return user.Permissions.ViewJudgingSettings
	default:
		return false
	}
}

func getEmptyArray(nullType model.NullType) interface{} {
	switch nullType {
	case model.NullTypeEmptyUserArray:
		return []*model.User{}
	case model.NullTypeEmptyErrorsArray:
		return []*model.Error{}
	case model.NullTypeEmptyJudgingCriteriaArray:
		return []*model.JudgingCriteria{}
	default:
		return nil
	}
}

// Checks if the provided user owns the given object
func isOwner(user *User, obj interface{}, objType model.ObjectType) bool {
	switch objType {
	case model.ObjectTypeUser:
		return obj.(*model.User).ID == user.ID
	default:
		return false
	}
}
