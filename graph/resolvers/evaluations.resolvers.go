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

func (r *evaluationResolver) Entry(ctx context.Context, obj *model.Evaluation) (*model.Entry, error) {
	entry, err := r.Query().Entry(ctx, obj.Entry.ID)
	if err != nil {
		return nil, err
	}
	return entry, nil
}

func (r *evaluationResolver) User(ctx context.Context, obj *model.Evaluation) (*model.User, error) {
	user, err := r.Query().User(ctx, obj.User.ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *queryResolver) Evaluations(ctx context.Context, userID int, contestID int) ([]*model.Evaluation, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.Evaluation{}, nil
	}

	if user.ID != userID && !user.Permissions.ViewAllEvaluations && !user.IsAdmin {
		return []*model.Evaluation{}, nil
	}

	evaluations, err := models.GetEvaluationsForUserAndContest(ctx, userID, contestID)
	if err != nil {
		return []*model.Evaluation{}, err
	}
	return evaluations, nil
}

// Evaluation returns generated.EvaluationResolver implementation.
func (r *Resolver) Evaluation() generated.EvaluationResolver { return &evaluationResolver{r} }

type evaluationResolver struct{ *Resolver }
