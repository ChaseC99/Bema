package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	errs "github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *mutationResolver) CreateCriteria(ctx context.Context, input model.JudgingCriteriaInput) (*model.JudgingCriteria, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageJudgingCriteria) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to create judging criteria.")
	}

	id, err := models.CreateJudgingCriteria(ctx, &input)
	if err != nil {
		return nil, err
	}

	criteria, err := models.GetJudgingCriteriaById(ctx, *id)
	if err != nil {
		return nil, err
	}

	return criteria, nil
}

func (r *mutationResolver) EditCriteria(ctx context.Context, id int, input model.JudgingCriteriaInput) (*model.JudgingCriteria, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageJudgingCriteria) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit judging criteria.")
	}

	criteria, err := models.GetJudgingCriteriaById(ctx, id)
	if err != nil {
		return nil, err
	}

	activeCriteria, err := models.GetActiveCriteria(ctx)
	if err != nil {
		return nil, err
	}

	if len(activeCriteria) == 4 && criteria.IsActive && !input.IsActive {
		return nil, errs.NewForbiddenError(ctx, "This criteria cannot be updated. There must be at least four active criteria.")
	}

	err = models.EditJudgingCriteriaById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Criteria(ctx, id)
}

func (r *mutationResolver) DeleteCriteria(ctx context.Context, id int) (*model.JudgingCriteria, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageJudgingCriteria) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to delete judging criteria.")
	}

	criteria, err := models.GetJudgingCriteriaById(ctx, id)
	if err != nil {
		return nil, err
	}

	activeCriteria, err := models.GetActiveCriteria(ctx)
	if err != nil {
		return nil, err
	}

	if len(activeCriteria) == 4 && criteria.IsActive {
		return nil, errs.NewForbiddenError(ctx, "This criteria cannot be deleted. There must be at least four active criteria.")
	}

	err = models.DeleteJudgingCriteriaById(ctx, id)
	if err != nil {
		return nil, err
	}

	return criteria, nil
}

func (r *queryResolver) Criteria(ctx context.Context, id int) (*model.JudgingCriteria, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	criteria, err := models.GetJudgingCriteriaById(ctx, id)
	if err != nil {
		return nil, err
	}

	if !criteria.IsActive && !auth.HasPermission(user, auth.ManageJudgingCriteria) {
		return nil, nil
	}

	return criteria, nil
}

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
