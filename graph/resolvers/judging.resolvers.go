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
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewJudgingSettings) {
		return []*model.JudgingCriteria{}, nil
	}

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
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewJudgingSettings) {
		return []*model.JudgingGroup{}, nil
	}

	groups, err := models.GetAllJudgingGroups(ctx)
	if err != nil {
		return []*model.JudgingGroup{}, err
	}
	return groups, err
}

func (r *queryResolver) ActiveJudgingGroups(ctx context.Context) ([]*model.JudgingGroup, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.JudgingGroup{}, nil
	}

	groups, err := models.GetActiveJudgingGroups(ctx)
	if err != nil {
		return []*model.JudgingGroup{}, err
	}
	return groups, err
}

func (r *queryResolver) JudgingGroup(ctx context.Context, id int) (*model.JudgingGroup, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	group, err := models.GetJudgingGroupById(ctx, id)
	if err != nil {
		return nil, err
	}
	return group, nil
}
