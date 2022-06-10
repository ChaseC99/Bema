package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

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
