package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *contestResolver) Author(ctx context.Context, obj *model.Contest) (*string, error) {
	return obj.Author, nil
}

func (r *contestResolver) IsVotingEnabled(ctx context.Context, obj *model.Contest) (*bool, error) {
	return obj.IsVotingEnabled, nil
}

func (r *queryResolver) Contests(ctx context.Context) ([]*model.Contest, error) {
	arr, err := models.GetAllContests(ctx)
	if err != nil {
		return []*model.Contest{}, err
	}
	return arr, nil
}

func (r *queryResolver) Contest(ctx context.Context, id int) (*model.Contest, error) {
	contest, err := models.GetContest(ctx, id)
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

// Contest returns generated.ContestResolver implementation.
func (r *Resolver) Contest() generated.ContestResolver { return &contestResolver{r} }

type contestResolver struct{ *Resolver }
