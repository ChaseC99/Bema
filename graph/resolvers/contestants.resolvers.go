package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *contestantResolver) Entries(ctx context.Context, obj *model.Contestant) ([]*model.Entry, error) {
	entries, err := models.GetEntriesByContestantKaid(ctx, obj.Kaid)
	if err != nil {
		return nil, err
	}
	return entries, nil
}

func (r *queryResolver) Contestant(ctx context.Context, kaid string) (*model.Contestant, error) {
	contestant, err := models.GetContestantByKaid(ctx, kaid)
	if err != nil {
		return nil, err
	}
	return contestant, nil
}

// Contestant returns generated.ContestantResolver implementation.
func (r *Resolver) Contestant() generated.ContestantResolver { return &contestantResolver{r} }

type contestantResolver struct{ *Resolver }
