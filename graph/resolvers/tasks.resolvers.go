package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	errs "github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *mutationResolver) CreateTask(ctx context.Context, input model.CreateTaskInput) (*model.Task, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditAllTasks) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to create tasks.")
	}

	id, err := models.CreateTask(ctx, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Task(ctx, *id)
}

func (r *mutationResolver) EditTask(ctx context.Context, id int, input model.EditTaskInput) (*model.Task, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditAllTasks) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit tasks.")
	}

	err := models.EditTaskById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Task(ctx, id)
}

func (r *mutationResolver) DeleteTask(ctx context.Context, id int) (*model.Task, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.DeleteAllTasks) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to delete tasks.")
	}

	task, err := r.Query().Task(ctx, id)
	if err != nil {
		return nil, err
	}

	err = models.DeleteTaskById(ctx, id)
	if err != nil {
		return nil, err
	}

	return task, nil
}

func (r *queryResolver) Task(ctx context.Context, id int) (*model.Task, error) {
	user := auth.GetUserFromContext(ctx)

	task, err := models.GetTaskById(ctx, id)
	if err != nil {
		return nil, err
	}

	if !auth.HasPermission(user, auth.ViewAllTasks) && task.AssignedUser != nil && task.AssignedUser.ID != user.ID {
		return nil, err
	}

	return task, nil
}

func (r *queryResolver) Tasks(ctx context.Context) ([]*model.Task, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewAllTasks) {
		return []*model.Task{}, nil
	}

	tasks, err := models.GetIncompleteTasks(ctx)
	if err != nil {
		return []*model.Task{}, err
	}
	return tasks, nil
}

func (r *queryResolver) CompletedTasks(ctx context.Context) ([]*model.Task, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewAllTasks) {
		return []*model.Task{}, nil
	}

	tasks, err := models.GetCompletedTasks(ctx)
	if err != nil {
		return []*model.Task{}, err
	}
	return tasks, nil
}

func (r *queryResolver) AvailableTasks(ctx context.Context) ([]*model.Task, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.Task{}, nil
	}

	tasks, err := models.GetAvailableTasks(ctx)
	if err != nil {
		return []*model.Task{}, err
	}
	return tasks, nil
}

func (r *queryResolver) CurrentUserTasks(ctx context.Context) ([]*model.Task, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.Task{}, nil
	}

	tasks, err := models.GetTasksForUser(ctx, user.ID)
	if err != nil {
		return []*model.Task{}, err
	}
	return tasks, nil
}

func (r *taskResolver) AssignedUser(ctx context.Context, obj *model.Task) (*model.User, error) {
	if obj.AssignedUser == nil {
		return nil, nil
	}

	user, err := r.Query().User(ctx, obj.AssignedUser.ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Task returns generated.TaskResolver implementation.
func (r *Resolver) Task() generated.TaskResolver { return &taskResolver{r} }

type taskResolver struct{ *Resolver }
