package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
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
