package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func NewTaskModel() model.Task {
	task := model.Task{}

	user := NewUserModel()

	task.AssignedUser = &user

	return task
}

func GetTaskById(ctx context.Context, id int) (*model.Task, error) {
	row := db.DB.QueryRow("SELECT task_id, task_title, assigned_member, task_status, to_char(due_date, $1) FROM task WHERE task_id = $2 ORDER BY task_id ASC;", util.DateFormat, id)

	task := NewTaskModel()
	if err := row.Scan(&task.ID, &task.Title, &task.AssignedUser.ID, &task.Status, &task.DueDate); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "This task does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving a task", err)
	}

	return &task, nil
}

func GetIncompleteTasks(ctx context.Context) ([]*model.Task, error) {
	tasks := []*model.Task{}

	rows, err := db.DB.Query("SELECT task_id, task_title, assigned_member, task_status, to_char(due_date, $1) FROM task WHERE task_status = 'Not Started' OR task_status = 'Started' ORDER BY task_id ASC;", util.DateFormat)
	if err != nil {
		return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of incomplete tasks.", err)
	}

	for rows.Next() {
		t := NewTaskModel()
		var userId *int

		if err := rows.Scan(&t.ID, &t.Title, &userId, &t.Status, &t.DueDate); err != nil {
			return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of incomplete tasks.", err)
		}

		if userId != nil {
			t.AssignedUser.ID = *userId
		} else {
			t.AssignedUser = nil
		}

		tasks = append(tasks, &t)
	}

	return tasks, nil
}

func GetCompletedTasks(ctx context.Context) ([]*model.Task, error) {
	tasks := []*model.Task{}

	rows, err := db.DB.Query("SELECT task_id, task_title, assigned_member, task_status, to_char(due_date, $1) FROM task WHERE task_status = 'Completed' ORDER BY task_id DESC;", util.DateFormat)
	if err != nil {
		return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of completed tasks.", err)
	}

	for rows.Next() {
		t := NewTaskModel()
		var userId *int

		if err := rows.Scan(&t.ID, &t.Title, &userId, &t.Status, &t.DueDate); err != nil {
			return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of completed tasks.", err)
		}

		if userId != nil {
			t.AssignedUser.ID = *userId
		} else {
			t.AssignedUser = nil
		}

		tasks = append(tasks, &t)
	}

	return tasks, nil
}

func GetAvailableTasks(ctx context.Context) ([]*model.Task, error) {
	tasks := []*model.Task{}

	rows, err := db.DB.Query("SELECT task_id, task_title, task_status, to_char(due_date, $1) FROM task WHERE assigned_member IS NULL ORDER BY task_id ASC;", util.DateFormat)
	if err != nil {
		return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of available tasks.", err)
	}

	for rows.Next() {
		t := NewTaskModel()
		t.AssignedUser = nil

		if err := rows.Scan(&t.ID, &t.Title, &t.Status, &t.DueDate); err != nil {
			return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of available tasks.", err)
		}

		tasks = append(tasks, &t)
	}

	return tasks, nil
}

func GetTasksForUser(ctx context.Context, userId int) ([]*model.Task, error) {
	tasks := []*model.Task{}

	rows, err := db.DB.Query("SELECT task_id, task_title, assigned_member, task_status, to_char(due_date, $1) FROM task WHERE assigned_member = $2 AND (task_status = 'Not Started' OR task_status = 'Started') ORDER BY task_id ASC;", util.DateFormat, userId)
	if err != nil {
		return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of user tasks.", err)
	}

	for rows.Next() {
		t := NewTaskModel()

		if err := rows.Scan(&t.ID, &t.Title, &t.AssignedUser.ID, &t.Status, &t.DueDate); err != nil {
			return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of user tasks.", err)
		}

		tasks = append(tasks, &t)
	}

	return tasks, nil
}

func CreateTask(ctx context.Context, input *model.CreateTaskInput) (*int, error) {
	var id int
	row := db.DB.QueryRow("INSERT INTO task (task_title, assigned_member, due_date) VALUES ($1, $2, $3) RETURNING task_id;", input.Title, input.AssignedUser, input.DueDate)
	if err := row.Scan(&id); err != nil {
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while creating a task", err)
	}

	return &id, nil
}
