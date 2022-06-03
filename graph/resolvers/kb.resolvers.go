package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/models"
)

func (r *queryResolver) Sections(ctx context.Context) ([]*model.KBSection, error) {
	user := auth.GetUserFromContext(ctx)

	var sections []*model.KBSection
	var err error

	if user == nil {
		sections, err = models.GetPublicKBSections(ctx)
	} else if user.IsAdmin {
		sections, err = models.GetAllKBSections(ctx)
	} else {
		sections, err = models.GetEvaluatorKBSections(ctx)
	}

	if err != nil {
		return []*model.KBSection{}, nil
	}
	return sections, nil
}
