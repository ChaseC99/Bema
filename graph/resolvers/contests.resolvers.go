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

func (r *contestResolver) Author(ctx context.Context, obj *model.Contest) (*string, error) {
	user := auth.GetUserFromContext(ctx)
	if auth.HasPermission(user, auth.EditContests) {
		return obj.Author, nil
	}
	return nil, nil
}

func (r *contestResolver) IsVotingEnabled(ctx context.Context, obj *model.Contest) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	return obj.IsVotingEnabled, nil
}

func (r *contestResolver) Winners(ctx context.Context, obj *model.Contest) ([]*model.Entry, error) {
	winners, err := models.GetWinningEntriesByContestId(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	return winners, nil
}

func (r *mutationResolver) AddContest(ctx context.Context, input model.CreateContestInput) (*model.Contest, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditContests) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to create contests.")
	}

	id, err := models.CreateContest(ctx, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Contest(ctx, *id)
}

func (r *mutationResolver) EditContest(ctx context.Context, id int, input model.EditContestInput) (*model.Contest, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditContests) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit contests.")
	}

	err := models.EditContestById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Contest(ctx, id)
}

func (r *queryResolver) Contests(ctx context.Context) ([]*model.Contest, error) {
	arr, err := models.GetAllContests(ctx)
	if err != nil {
		return []*model.Contest{}, err
	}
	return arr, nil
}

func (r *queryResolver) Contest(ctx context.Context, id int) (*model.Contest, error) {
	contest, err := models.GetContestById(ctx, id)
	if err != nil {
		return nil, err
	}
	return contest, nil
}

func (r *queryResolver) CurrentContest(ctx context.Context) (*model.Contest, error) {
	contest, err := models.GetCurrentContest(ctx)
	if err != nil {
		return nil, err
	}
	return contest, nil
}

func (r *queryResolver) ContestsEvaluatedByUser(ctx context.Context, id int) ([]*model.Contest, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.Contest{}, nil
	}

	contest, err := models.GetContestsEvaluatedByUser(ctx, id)
	if err != nil {
		return []*model.Contest{}, err
	}
	return contest, nil
}

// Contest returns generated.ContestResolver implementation.
func (r *Resolver) Contest() generated.ContestResolver { return &contestResolver{r} }

type contestResolver struct{ *Resolver }
