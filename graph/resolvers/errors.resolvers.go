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

func (r *errorResolver) User(ctx context.Context, obj *model.Error) (*model.User, error) {
	user, err := models.GetUserById(ctx, obj.User.ID)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *queryResolver) Errors(ctx context.Context, page int) ([]*model.Error, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewErrors) {
		return []*model.Error{}, nil
	}

	errors, err := models.GetErrorsByPage(ctx, page)
	if err != nil {
		return []*model.Error{}, err
	}

	return errors, nil
}

func (r *queryResolver) Error(ctx context.Context, id int) (*model.Error, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewErrors) {
		return nil, nil
	}

	e, err := models.GetErrorById(ctx, id)
	if err != nil {
		return nil, err
	}
	return e, nil
}

// Error returns generated.ErrorResolver implementation.
func (r *Resolver) Error() generated.ErrorResolver { return &errorResolver{r} }

type errorResolver struct{ *Resolver }
