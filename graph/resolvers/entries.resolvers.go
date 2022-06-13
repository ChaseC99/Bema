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

func (r *entryResolver) Contest(ctx context.Context, obj *model.Entry) (*model.Contest, error) {
	contest, err := r.Query().Contest(ctx, obj.Contest.ID)
	if err != nil {
		return nil, nil
	}
	return contest, nil
}

func (r *entryResolver) Author(ctx context.Context, obj *model.Entry) (*model.Contestant, error) {
	if obj.Author == nil {
		return &model.Contestant{
			Kaid: "",
			Name: "Unknown Author",
		}, nil
	}

	author, err := r.Query().Contestant(ctx, obj.Author.Kaid)
	if err != nil {
		return nil, err
	}
	return author, nil
}

func (r *entryResolver) SkillLevel(ctx context.Context, obj *model.Entry) (*string, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		if obj.IsWinner {
			return obj.SkillLevel, nil
		}
		return nil, nil
	}

	return obj.SkillLevel, nil
}

func (r *entryResolver) Group(ctx context.Context, obj *model.Entry) (*model.JudgingGroup, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	group, err := r.Query().JudgingGroup(ctx, obj.Group.ID)
	if err != nil {
		return nil, err
	}
	return group, nil
}

func (r *entryResolver) IsFlagged(ctx context.Context, obj *model.Entry) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	return obj.IsFlagged, nil
}

func (r *entryResolver) IsDisqualified(ctx context.Context, obj *model.Entry) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	return obj.IsDisqualified, nil
}

func (r *entryResolver) IsSkillLevelLocked(ctx context.Context, obj *model.Entry) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.EditEntries) {
		return nil, nil
	}

	return obj.IsSkillLevelLocked, nil
}

func (r *entryResolver) AverageScore(ctx context.Context, obj *model.Entry) (*float64, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	avgScore, err := models.GetEntryAverageScore(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	return avgScore, nil
}

func (r *entryResolver) EvaluationCount(ctx context.Context, obj *model.Entry) (*int, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	count, err := models.GetEntryEvaluationCount(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	return &count, nil
}

func (r *entryResolver) VoteCount(ctx context.Context, obj *model.Entry) (*int, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	count, err := models.GetEntryVoteCount(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	return &count, nil
}

func (r *entryResolver) IsVotedByUser(ctx context.Context, obj *model.Entry) (*bool, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return nil, nil
	}

	wasVoted, err := models.IsEntryVotedByUser(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	return wasVoted, nil
}

func (r *entryResolver) JudgeVotes(ctx context.Context, obj *model.Entry) ([]*model.EntryVote, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return []*model.EntryVote{}, nil
	}

	votes, err := models.GetEntryVotes(ctx, obj.ID)
	if err != nil {
		return []*model.EntryVote{}, err
	}
	return votes, nil
}

func (r *entryVoteResolver) User(ctx context.Context, obj *model.EntryVote) (*model.User, error) {
	if obj.User != nil {
		user, err := models.GetUserById(ctx, obj.User.ID)
		if err != nil {
			return nil, err
		}
		return user, nil
	}
	return nil, nil
}

func (r *mutationResolver) AddWinner(ctx context.Context, id int) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageWinners) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to add winners.")
	}

	err := models.AddWinnerByEntryId(ctx, id)
	if err != nil {
		return nil, err
	}

	entry, err := r.Query().Entry(ctx, id)
	if err != nil {
		return nil, err
	}
	return entry, nil
}

func (r *mutationResolver) RemoveWinner(ctx context.Context, id int) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.ManageWinners) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to remove winners.")
	}

	err := models.RemoveWinnerByEntryId(ctx, id)
	if err != nil {
		return nil, err
	}

	entry, err := r.Query().Entry(ctx, id)
	if err != nil {
		return nil, err
	}
	return entry, nil
}

func (r *queryResolver) Entries(ctx context.Context, contestID int) ([]*model.Entry, error) {
	entries, err := models.GetEntriesByContestId(ctx, contestID)
	if err != nil {
		return []*model.Entry{}, err
	}
	return entries, nil
}

func (r *queryResolver) Entry(ctx context.Context, id int) (*model.Entry, error) {
	entry, err := models.GetEntryById(ctx, id)
	if err != nil {
		return nil, err
	}
	return entry, nil
}

func (r *queryResolver) FlaggedEntries(ctx context.Context) ([]*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.ViewJudgingSettings) {
		return []*model.Entry{}, nil
	}

	entries, err := models.GetFlaggedEntries(ctx)
	if err != nil {
		return []*model.Entry{}, err
	}
	return entries, nil
}

func (r *queryResolver) EntriesByAverageScore(ctx context.Context, contestID int) ([]*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		entries, err := models.GetEntriesByContestId(ctx, contestID)
		if err != nil {
			return []*model.Entry{}, err
		}
		return entries, nil
	}

	entries, err := models.GetEntriesByAverageScore(ctx, contestID)
	if err != nil {
		return []*model.Entry{}, err
	}
	return entries, nil
}

func (r *queryResolver) EntriesPerLevel(ctx context.Context, contestID int) ([]*model.EntriesPerLevel, error) {
	entriesPerLevel, err := models.GetEntriesPerLevel(ctx, contestID)
	if err != nil {
		return []*model.EntriesPerLevel{}, err
	}
	return entriesPerLevel, nil
}

func (r *queryResolver) NextEntryToJudge(ctx context.Context) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.JudgeEntries) {
		return nil, nil
	}

	id, err := models.GetNextEntryToJudge(ctx)
	if err != nil {
		return nil, err
	}
	if id == nil {
		return nil, nil
	}

	entry, err := r.Query().Entry(ctx, *id)
	if err != nil {
		return nil, err
	}
	return entry, nil
}

func (r *queryResolver) NextEntryToReviewSkillLevel(ctx context.Context) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil || !user.IsAdmin {
		return nil, nil
	}

	id, err := models.GetNextEntryToReviewSkillLevel(ctx)
	if err != nil {
		return nil, err
	}
	if id == nil {
		return nil, nil
	}

	entry, err := r.Query().Entry(ctx, *id)
	if err != nil {
		return nil, err
	}
	return entry, nil
}

// Entry returns generated.EntryResolver implementation.
func (r *Resolver) Entry() generated.EntryResolver { return &entryResolver{r} }

// EntryVote returns generated.EntryVoteResolver implementation.
func (r *Resolver) EntryVote() generated.EntryVoteResolver { return &entryVoteResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

type entryResolver struct{ *Resolver }
type entryVoteResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
