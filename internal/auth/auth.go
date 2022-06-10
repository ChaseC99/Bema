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
func HasPermissionOld(ctx context.Context, obj interface{}, next graphql.Resolver, permission model.Permission, nullType model.NullType, objType *model.ObjectType) (interface{}, error) {
	user := GetUserFromContext(ctx)

	// Allow admin users through
	if user != nil && user.IsAdmin {
		return next(ctx)
	}

	// For object types, we need to fetch the object first in order to determine ownership
	if objType != nil && obj == nil {
		obj, _ = next(ctx)
	}

	// Allow object owners through
	if objType != nil && obj != nil && isOwner(user, obj, *objType) {
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
	case "IS_ADMIN":
		return user.IsAdmin
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
	case model.NullTypeEmptyJudgingGroupArray:
		return []*model.JudgingGroup{}
	case model.NullTypeEmptyEntryArray:
		return []*model.Entry{}
	case model.NullTypeEmptyContestantArray:
		return []*model.Contestant{}
	case model.NullTypeEmptyTaskArray:
		return []*model.Task{}
	case model.NullTypeEmptyEntryVoteArray:
		return []*model.EntryVote{}
	case model.NullTypeEmptyContestArray:
		return []*model.Contest{}
	case model.NullTypeEmptyEvaluationArray:
		return []*model.Evaluation{}
	default:
		return nil
	}
}

// Checks if the provided user owns the given object
func isOwner(user *User, obj interface{}, objType model.ObjectType) bool {
	if obj == nil {
		return false
	}

	switch val := obj.(type) {
	case model.User:
		return val.ID == user.ID
	case model.Task:
		return val.AssignedUser.ID == user.ID
	case model.KBSection:
		if *val.Visibility == "Public" {
			return true
		} else if *val.Visibility == "Evaluators Only" && user != nil {
			return true
		} else if *val.Visibility == "Admins Only" && user != nil && user.IsAdmin {
			return true
		}
		return false
	default:
		return false
	}
}

func HasPermission(user *User, permission Permission) bool {
	if user == nil {
		return false
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
