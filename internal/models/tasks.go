package models

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func newTask() model.Task {
	task := model.Task{}
	task.AssignedUser = &model.User{}
	return task
}

func GetIncompleteTasks(ctx context.Context) ([]*model.Task, error) {
	tasks := []*model.Task{}

	rows, err := db.DB.Query("SELECT task_id, task_title, assigned_member, task_status, to_char(due_date, $1) FROM task WHERE task_status = 'Not Started' OR task_status = 'Started' ORDER BY task_id ASC;", util.DateFormat)
	if err != nil {
		return []*model.Task{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of incomplete tasks.", err)
	}

	for rows.Next() {
		t := newTask()
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
