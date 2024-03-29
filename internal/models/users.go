package models

import (
	"context"
	"database/sql"
	"time"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
	"golang.org/x/crypto/bcrypt"
)

func NewUserModel() model.User {
	user := model.User{}

	group := NewJudgingGroupModel()
	permissions := NewPermissionsModel()

	user.AssignedGroup = &group
	user.Permissions = &permissions

	return user
}

func NewPermissionsModel() model.Permissions {
	permissions := model.Permissions{}
	return permissions
}

func GetAllActiveUsers(ctx context.Context) ([]*model.User, error) {
	users := []*model.User{}

	rows, err := db.DB.Query("SELECT evaluator_id, evaluator_kaid, evaluator_name, nickname, username, email, account_locked, is_admin, to_char(logged_in_tstz, $1) as logged_in_tstz, to_char(dt_term_start, $1) as dt_term_start, to_char(dt_term_end, $1) as dt_term_end, receive_emails FROM evaluator WHERE account_locked = false ORDER BY evaluator_id DESC", util.DisplayDateFormat)
	if err != nil {
		return []*model.User{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of active users", err)
	}

	for rows.Next() {
		user := NewUserModel()
		if err := rows.Scan(&user.ID, &user.Kaid, &user.Name, &user.Nickname, &user.Username, &user.Email, &user.AccountLocked, &user.IsAdmin, &user.LastLogin, &user.TermStart, &user.TermEnd, &user.NotificationsEnabled); err != nil {
			return []*model.User{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of active users", err)
		}
		users = append(users, &user)
	}

	return users, nil
}

func GetAllInactiveUsers(ctx context.Context) ([]*model.User, error) {
	users := []*model.User{}

	rows, err := db.DB.Query("SELECT evaluator_id, evaluator_kaid, evaluator_name, nickname, username, email, account_locked, is_admin, to_char(logged_in_tstz, $1) as logged_in_tstz, to_char(dt_term_start, $1) as dt_term_start, to_char(dt_term_end, $1) as dt_term_end, receive_emails FROM evaluator WHERE account_locked = true ORDER BY evaluator_id DESC", util.DisplayDateFormat)
	if err != nil {
		return []*model.User{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of inactive users", err)
	}

	for rows.Next() {
		user := NewUserModel()
		if err := rows.Scan(&user.ID, &user.Kaid, &user.Name, &user.Nickname, &user.Username, &user.Email, &user.AccountLocked, &user.IsAdmin, &user.LastLogin, &user.TermStart, &user.TermEnd, &user.NotificationsEnabled); err != nil {
			return []*model.User{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of inactive users", err)
		}
		users = append(users, &user)
	}

	return users, nil
}

func GetUserById(ctx context.Context, id int) (*model.User, error) {
	row := db.DB.QueryRow("SELECT evaluator_id, evaluator_kaid, evaluator_name, nickname, username, email, account_locked, is_admin, to_char(logged_in_tstz, $1) as logged_in_tstz, to_char(dt_term_start, $1) as dt_term_start, to_char(dt_term_end, $1) as dt_term_end, receive_emails FROM evaluator WHERE evaluator_id = $2", util.DisplayDateFormat, id)

	user := NewUserModel()
	if err := row.Scan(&user.ID, &user.Kaid, &user.Name, &user.Nickname, &user.Username, &user.Email, &user.AccountLocked, &user.IsAdmin, &user.LastLogin, &user.TermStart, &user.TermEnd, &user.NotificationsEnabled); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! The requested user does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the requested user", err)
	}

	return &user, nil
}

func GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	row := db.DB.QueryRow("SELECT evaluator_id, evaluator_kaid, evaluator_name, nickname, username, email, account_locked, is_admin, to_char(logged_in_tstz, $1) as logged_in_tstz, to_char(dt_term_start, $1) as dt_term_start, to_char(dt_term_end, $1) as dt_term_end, receive_emails FROM evaluator WHERE username = $2", util.DisplayDateFormat, username)

	user := NewUserModel()
	if err := row.Scan(&user.ID, &user.Kaid, &user.Name, &user.Nickname, &user.Username, &user.Email, &user.AccountLocked, &user.IsAdmin, &user.LastLogin, &user.TermStart, &user.TermEnd, &user.NotificationsEnabled); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the requested user", err)
	}

	return &user, nil
}

func GetUserPermissionsById(ctx context.Context, id int) (*model.Permissions, error) {
	row := db.DB.QueryRow("SELECT view_admin_stats, edit_contests, delete_contests, add_entries, edit_entries, delete_entries, assign_entry_groups, view_all_evaluations, edit_all_evaluations, delete_all_evaluations, manage_winners, view_all_tasks, edit_all_tasks, delete_all_tasks, view_judging_settings, manage_judging_groups, assign_evaluator_groups, manage_judging_criteria, view_all_users, edit_user_profiles, change_user_passwords, assume_user_identities, add_users, view_errors, delete_errors, judge_entries, edit_kb_content, delete_kb_content, publish_kb_content, manage_announcements FROM evaluator_permissions WHERE evaluator_id = $1", id)

	p := NewPermissionsModel()
	if err := row.Scan(&p.ViewAdminStats, &p.EditContests, &p.DeleteContests, &p.AddEntries, &p.EditEntries, &p.DeleteEntries, &p.AssignEntryGroups, &p.ViewAllEvaluations, &p.EditAllEvaluations, &p.DeleteAllEvaluations, &p.ManageWinners, &p.ViewAllTasks, &p.EditAllTasks, &p.DeleteAllTasks, &p.ViewJudgingSettings, &p.ManageJudgingGroups, &p.AssignEvaluatorGroups, &p.ManageJudgingCriteria, &p.ViewAllUsers, &p.EditUserProfiles, &p.ChangeUserPasswords, &p.AssumeUserIdentities, &p.AddUsers, &p.ViewErrors, &p.DeleteErrors, &p.JudgeEntries, &p.EditKbContent, &p.DeleteKbContent, &p.PublishKbContent, &p.ManageAnnouncements); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! The requested user does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving user permissions", err)
	}

	return &p, nil
}

// Returns the group id assigned to the specified user
func GetUserGroupById(ctx context.Context, id int) (*int, error) {
	row := db.DB.QueryRow("SELECT group_id FROM evaluator WHERE evaluator_id = $1", id)

	var groupId *int
	if err := row.Scan(&groupId); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! The requested user does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while looking up a user's assigned group", err)
	}

	return groupId, nil
}

func GetUserPasswordHashByUsername(ctx context.Context, username string) (*string, error) {
	row := db.DB.QueryRow("SELECT password FROM evaluator WHERE username = $1", username)

	var hashedPassword string
	if err := row.Scan(&hashedPassword); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while validating a user's login", err)
	}

	return &hashedPassword, nil
}

func SetUserLastLoginById(ctx context.Context, id int) error {
	_, err := db.DB.Exec("UPDATE evaluator SET logged_in_tstz = $1 WHERE evaluator_id = $2", time.Now(), id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while logging in a user", err)
	}
	return nil
}

func ChangeUserPasswordById(ctx context.Context, id int, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while changing a user's password", err)
	}

	_, err = db.DB.Exec("UPDATE evaluator SET password = $1 WHERE evaluator_id = $2", hash, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while changing a user's password", err)
	}

	return nil
}

func CreateUser(ctx context.Context, input *model.CreateUserInput) (*int, error) {
	row := db.DB.QueryRow("INSERT INTO evaluator (evaluator_name, email, evaluator_kaid, username, dt_term_start) VALUES ($1, $2, $3, $4, $5) RETURNING evaluator_id;", input.Name, input.Email, input.Kaid, input.Username, input.TermStart)

	var id int
	if err := row.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a new user", err)
	}

	_, err := db.DB.Exec("INSERT INTO evaluator_permissions (evaluator_id) VALUES ($1)", id)
	if err != nil {
		return &id, errors.NewInternalError(ctx, "An unexpected error occurred while creating a new user", err)
	}

	return &id, nil
}

func EditUserById(ctx context.Context, id int, input *model.EditUserProfileInput) error {
	_, err := db.DB.Exec("UPDATE evaluator SET evaluator_name = $1, evaluator_kaid = $2, is_admin = $3, dt_term_start = $4, dt_term_end = $5, account_locked = $6, email = $7, username = $8, nickname = $9, receive_emails = $10 WHERE evaluator_id = $11", input.Name, input.Kaid, input.IsAdmin, input.TermStart, input.TermEnd, input.AccountLocked, input.Email, input.Username, input.Nickname, input.NotificationsEnabled, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while updating a user's profile", err)
	}
	return nil
}

func EditUserPermissionsById(ctx context.Context, id int, input *model.EditUserPermissionsInput) error {
	_, err := db.DB.Exec("UPDATE evaluator_permissions SET view_admin_stats = $1, edit_contests = $2, delete_contests = $3, add_entries = $4, edit_entries = $5, delete_entries = $6, assign_entry_groups = $7, view_all_evaluations = $8, edit_all_evaluations = $9, delete_all_evaluations = $10, manage_winners = $11, view_all_tasks = $12, edit_all_tasks = $13, delete_all_tasks = $14, view_judging_settings = $15, manage_judging_groups = $16, assign_evaluator_groups = $17, manage_judging_criteria = $18, view_all_users = $19, edit_user_profiles = $20, change_user_passwords = $21, assume_user_identities = $22, add_users = $23, view_errors = $24, delete_errors = $25, judge_entries = $26, edit_kb_content = $27, delete_kb_content = $28, publish_kb_content = $29, manage_announcements = $30 WHERE evaluator_id = $31", input.ViewAdminStats, input.EditContests, input.DeleteContests, input.AddEntries, input.EditEntries, input.DeleteEntries, input.AssignEntryGroups, input.ViewAllEvaluations, input.EditAllEvaluations, input.DeleteAllEvaluations, input.ManageWinners, input.ViewAllTasks, input.EditAllTasks, input.DeleteAllTasks, input.ViewJudgingSettings, input.ManageJudgingGroups, input.AssignEvaluatorGroups, input.ManageJudgingCriteria, input.ViewAllUsers, input.EditUserProfiles, input.ChangeUserPasswords, input.AssumeUserIdentities, input.AddUsers, input.ViewErrors, input.DeleteErrors, input.JudgeEntries, input.EditKbContent, input.DeleteKbContent, input.PublishKbContent, input.ManageAnnouncements, id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while updating a user's permissions", err)
	}
	return nil
}

func AssignUserToJudgingGroup(ctx context.Context, userId int, groupId *int) error {
	_, err := db.DB.Exec("UPDATE evaluator SET group_id = $1 WHERE evaluator_id = $2", groupId, userId)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while assigning a user to a judging group", err)
	}
	return nil
}
