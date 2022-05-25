package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/models/contests"
)

func (r *contestResolver) Author(ctx context.Context, obj *model.Contest) (*string, error) {
	return obj.Author, nil
}

func (r *contestResolver) IsVotingEnabled(ctx context.Context, obj *model.Contest) (*bool, error) {
	return obj.IsVotingEnabled, nil
}

func (r *queryResolver) Contests(ctx context.Context) ([]*model.Contest, error) {
	arr := contests.GetAllContests(ctx)

	return arr, nil
}

// Contest returns generated.ContestResolver implementation.
func (r *Resolver) Contest() generated.ContestResolver { return &contestResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type contestResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
