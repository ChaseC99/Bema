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

func (r *contestantResolver) Entries(ctx context.Context, obj *model.Contestant) ([]*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.Entry{}, nil
	}

	entries, err := models.GetEntriesByContestantKaid(ctx, obj.Kaid)
	if err != nil {
		return nil, err
	}
	return entries, nil
}

func (r *contestantResolver) EntryCount(ctx context.Context, obj *model.Contestant) (int, error) {
	entryCount, err := models.GetContestantEntryCount(ctx, obj.Kaid)
	if err != nil {
		return 0, err
	}
	return entryCount, nil
}

func (r *contestantResolver) ContestCount(ctx context.Context, obj *model.Contestant) (int, error) {
	contestCount, err := models.GetContestantContestCount(ctx, obj.Kaid)
	if err != nil {
		return 0, nil
	}
	return contestCount, nil
}

func (r *queryResolver) Contestant(ctx context.Context, kaid string) (*model.Contestant, error) {
	contestant, err := models.GetContestantByKaid(ctx, kaid)
	if err != nil {
		return nil, err
	}
	return contestant, nil
}

func (r *queryResolver) ContestantSearch(ctx context.Context, query string) ([]*model.Contestant, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.Contestant{}, nil
	}

	contestants, err := models.GetContestantsBySearchQuery(ctx, query)
	if err != nil {
		return []*model.Contestant{}, err
	}
	return contestants, nil
}

// Contestant returns generated.ContestantResolver implementation.
func (r *Resolver) Contestant() generated.ContestantResolver { return &contestantResolver{r} }

type contestantResolver struct{ *Resolver }
