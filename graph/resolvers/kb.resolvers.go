package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	errs "github.com/KA-Challenge-Council/Bema/internal/errors"
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

func (r *kBArticleResolver) Drafts(ctx context.Context, obj *model.KBArticle) ([]*model.KBArticleDraft, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return []*model.KBArticleDraft{}, nil
	}

	drafts, err := models.GetKBArticleRecentDraftsByArticleId(ctx, obj.ID)
	if err != nil {
		return nil, err
	}

	return drafts, nil
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

func (r *mutationResolver) CreateSection(ctx context.Context, input model.KBSectionInput) (*model.KBSection, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to create KB sections.")
	}

	id, err := models.CreateKBSection(ctx, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Section(ctx, *id)
}

func (r *mutationResolver) EditSection(ctx context.Context, id int, input model.KBSectionInput) (*model.KBSection, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit KB sections.")
	}

	err := models.EditKBSectionById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Section(ctx, id)
}

func (r *mutationResolver) DeleteSection(ctx context.Context, id int) (*model.KBSection, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.DeleteKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to delete KB sections.")
	}

	section, err := r.Query().Section(ctx, id)
	if err != nil {
		return nil, err
	}

	articles, err := models.GetAdminKBArticlesBySection(ctx, section.ID)
	if err != nil {
		return nil, err
	}
	if len(articles) > 0 {
		return nil, errs.NewForbiddenError(ctx, "This section has articles associated with it and cannot be deleted.")
	}

	err = models.DeleteKBSectionById(ctx, id)
	if err != nil {
		return nil, err
	}

	return section, nil
}

func (r *mutationResolver) CreateArticle(ctx context.Context, input model.KBArticleInput) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to create KB articles.")
	}

	id, err := models.CreateKBArticle(ctx, &input, user.ID)
	if err != nil {
		return nil, err
	}

	return r.Query().Article(ctx, *id)
}

func (r *mutationResolver) EditArticle(ctx context.Context, id int, input model.KBArticleInput) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit KB articles.")
	}

	err := models.EditKBArticle(ctx, id, &input, user.ID)
	if err != nil {
		return nil, err
	}

	return r.Query().Article(ctx, id)
}

func (r *mutationResolver) EditArticleProperties(ctx context.Context, id int, visibility string, section int) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit KB articles.")
	}

	err := models.EditKBArticleProperties(ctx, id, visibility, section)
	if err != nil {
		return nil, err
	}

	return r.Query().Article(ctx, id)
}

func (r *mutationResolver) DeleteArticle(ctx context.Context, id int) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.DeleteKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to delete KB articles.")
	}

	article, err := r.Query().Article(ctx, id)
	if err != nil {
		return nil, err
	}

	err = models.DeleteKBArticle(ctx, id)
	if err != nil {
		return nil, err
	}

	return article, nil
}

func (r *mutationResolver) DeleteArticleDraft(ctx context.Context, id int) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to delete KB article drafts.")
	}

	article, err := r.Query().Article(ctx, id)
	if err != nil {
		return nil, err
	}

	err = models.DeleteKBArticleDraft(ctx, id)
	if err != nil {
		return nil, err
	}

	return article, nil
}

func (r *mutationResolver) PublishArticle(ctx context.Context, id int) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.PublishKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to publish KB articles.")
	}

	err := models.PublishKBArticle(ctx, id)
	if err != nil {
		return nil, err
	}

	return r.Query().Article(ctx, id)
}

func (r *mutationResolver) UnpublishArticle(ctx context.Context, id int) (*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.PublishKbContent) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to unpublish KB articles.")
	}

	err := models.UnpublishKBArticle(ctx, id)
	if err != nil {
		return nil, err
	}

	return r.Query().Article(ctx, id)
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

func (r *queryResolver) Articles(ctx context.Context, filter *string) ([]*model.KBArticle, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditKbContent) {
		return []*model.KBArticle{}, errs.NewForbiddenError(ctx, "You do not have permission to view the full list of KB articles.")
	}

	var articles []*model.KBArticle
	var err error

	if filter == nil {
		articles, err = models.GetAllKBArticles(ctx)
	} else if *filter == "DRAFTS" {
		articles, err = models.GetAllKBArticlesWithDrafts(ctx)
	} else {
		articles, err = models.GetAllKBArticles(ctx)
	}

	if err != nil {
		return []*model.KBArticle{}, nil
	}

	return articles, nil
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
