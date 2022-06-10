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

func (r *kBSectionResolver) Visibility(ctx context.Context, obj *model.KBSection) (*string, error) {
	user := auth.GetUserFromContext(ctx)

	if auth.HasPermission(user, auth.EditKbContent) {
		return obj.Visibility, nil
	}
	return nil, nil
}

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

func (r *queryResolver) Section(ctx context.Context, id int) (*model.KBSection, error) {
	section, err := models.GetKBSectionById(ctx, id)
	if err != nil {
		return nil, err
	}
	return section, nil
}

// KBSection returns generated.KBSectionResolver implementation.
func (r *Resolver) KBSection() generated.KBSectionResolver { return &kBSectionResolver{r} }

type kBSectionResolver struct{ *Resolver }
