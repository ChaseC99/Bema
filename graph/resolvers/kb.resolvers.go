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

func (r *kBArticleResolver) Draft(ctx context.Context, obj *model.KBArticle) (*model.KBArticleDraft, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return nil, nil
	}

	draft, err := models.GetKBArticleDraftByArticleId(ctx, obj.ID)
	if err != nil {
		return nil, err
	}

	return draft, nil
}

func (r *kBArticleDraftResolver) Author(ctx context.Context, obj *model.KBArticleDraft) (*model.User, error) {
	user, err := r.Query().User(ctx, obj.Author.ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *kBSectionResolver) Visibility(ctx context.Context, obj *model.KBSection) (*string, error) {
	user := auth.GetUserFromContext(ctx)

	if auth.HasPermission(user, auth.EditKbContent) {
		return obj.Visibility, nil
	}
	return nil, nil
}

func (r *kBSectionResolver) Articles(ctx context.Context, obj *model.KBSection) ([]*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	var articles []*model.KBArticle
	var err error
	if user == nil {
		articles, err = models.GetPublicKBArticlesBySection(ctx, obj.ID)
	} else if user.IsAdmin {
		articles, err = models.GetAdminKBArticlesBySection(ctx, obj.ID)
	} else {
		articles, err = models.GetEvaluatorKBArticlesBySection(ctx, obj.ID)
	}

	if err != nil {
		return []*model.KBArticle{}, err
	}
	return articles, nil
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
	user := auth.GetUserFromContext(ctx)

	section, err := models.GetKBSectionById(ctx, id)
	if err != nil {
		return nil, err
	}

	// Prevent null pointer derefence below
	if section == nil {
		return section, nil
	}

	// Allow KB editors to access all sections
	if auth.HasPermission(user, auth.EditKbContent) {
		return section, nil
	}

	if *section.Visibility == "Public" {
		return section, nil
	} else if *section.Visibility == "Evaluators Only" && user != nil {
		return section, nil
	}

	return nil, nil
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

	if *article.Visibility == "Public" || (*article.Visibility == "Evaluators Only" && user != nil) || (*article.Visibility == "Admins Only" && auth.HasPermission(user, auth.EditKbContent)) {
		return article, nil
	}

	return nil, nil
}

// KBArticle returns generated.KBArticleResolver implementation.
func (r *Resolver) KBArticle() generated.KBArticleResolver { return &kBArticleResolver{r} }

// KBArticleDraft returns generated.KBArticleDraftResolver implementation.
func (r *Resolver) KBArticleDraft() generated.KBArticleDraftResolver {
	return &kBArticleDraftResolver{r}
}

// KBSection returns generated.KBSectionResolver implementation.
func (r *Resolver) KBSection() generated.KBSectionResolver { return &kBSectionResolver{r} }

type kBArticleResolver struct{ *Resolver }
type kBArticleDraftResolver struct{ *Resolver }
type kBSectionResolver struct{ *Resolver }
