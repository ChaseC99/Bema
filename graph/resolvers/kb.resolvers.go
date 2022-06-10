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

func (r *kBArticleResolver) Section(ctx context.Context, obj *model.KBArticle) (*model.KBSection, error) {
	return r.Query().Section(ctx, obj.Section.ID)
}

func (r *kBArticleResolver) Author(ctx context.Context, obj *model.KBArticle) (*model.User, error) {
	user := auth.GetUserFromContext(ctx)
	if user != nil {
		return r.Query().User(ctx, obj.Author.ID)
	}
	return nil, nil
}

func (r *kBArticleResolver) Visibility(ctx context.Context, obj *model.KBArticle) (*string, error) {
	user := auth.GetUserFromContext(ctx)

	if auth.HasPermission(user, auth.EditKbContent) {
		return obj.Visibility, nil
	}
	return nil, nil
}

func (r *kBArticleResolver) IsPublished(ctx context.Context, obj *model.KBArticle) (*bool, error) {
	user := auth.GetUserFromContext(ctx)

	if auth.HasPermission(user, auth.EditKbContent) {
		return obj.IsPublished, nil
	}
	return nil, nil
}

func (r *kBArticleResolver) HasDraft(ctx context.Context, obj *model.KBArticle) (*bool, error) {
	user := auth.GetUserFromContext(ctx)

	if auth.HasPermission(user, auth.EditKbContent) {
		hasDraft, err := models.CheckKBArticleHasDraft(ctx, obj.ID)
		if err != nil {
			return nil, err
		}
		return &hasDraft, nil
	}
	return nil, nil
}

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

func (r *queryResolver) Article(ctx context.Context, id int) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	article, err := models.GetKBArticleById(ctx, id)
	if err != nil {
		return nil, err
	}

	if !*article.IsPublished && !auth.HasPermission(user, auth.EditKbContent) {
		return nil, nil
	}

	if *article.Visibility == "Public" || (*article.Visibility == "Evaluators Only" && user != nil) || (*article.Visibility == "Admins Only" && user != nil && user.IsAdmin) {
		return article, nil
	}

	return nil, nil
}

// KBArticle returns generated.KBArticleResolver implementation.
func (r *Resolver) KBArticle() generated.KBArticleResolver { return &kBArticleResolver{r} }

// KBSection returns generated.KBSectionResolver implementation.
func (r *Resolver) KBSection() generated.KBSectionResolver { return &kBSectionResolver{r} }

type kBArticleResolver struct{ *Resolver }
type kBSectionResolver struct{ *Resolver }
