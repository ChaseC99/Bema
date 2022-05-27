package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *queryResolver) AllCriteria(ctx context.Context) ([]*model.JudgingCriteria, error) {
	criteria, err := models.GetAllCriteria(ctx)
	if err != nil {
		return []*model.JudgingCriteria{}, err
	}
	return criteria, nil
}

func (r *queryResolver) ActiveCriteria(ctx context.Context) ([]*model.JudgingCriteria, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil {
		criteria, err := models.GetPublicCriteria(ctx)
		if err != nil {
			return []*model.JudgingCriteria{}, nil
		}
		return criteria, nil
	} else {
		criteria, err := models.GetActiveCriteria(ctx)
		if err != nil {
			return []*model.JudgingCriteria{}, nil
		}
		return criteria, nil
	}
}

func (r *queryResolver) AllJudgingGroups(ctx context.Context) ([]*model.JudgingGroup, error) {
	groups, err := models.GetAllJudgingGroups(ctx)
	if err != nil {
		return []*model.JudgingGroup{}, err
	}
	return groups, err
}

func (r *queryResolver) ActiveJudgingGroups(ctx context.Context) ([]*model.JudgingGroup, error) {
	groups, err := models.GetActiveJudgingGroups(ctx)
	if err != nil {
		return []*model.JudgingGroup{}, err
	}
	return groups, err
}
