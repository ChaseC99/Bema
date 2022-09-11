package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

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

	if obj.Group == nil {
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

func (r *entryResolver) FlagReason(ctx context.Context, obj *model.Entry) (*string, error) {
	user := auth.GetUserFromContext(ctx)
	if !auth.HasPermission(user, auth.EditEntries) {
		return nil, nil
	}

	return obj.FlagReason, nil
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

func (r *mutationResolver) FlagEntry(ctx context.Context, id int, reason string) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.JudgeEntries) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to flag entries.")
	}

	err := models.FlagEntryById(ctx, id, reason)
	if err != nil {
		return nil, err
	}

	return r.Query().Entry(ctx, id)
}

func (r *mutationResolver) ApproveEntry(ctx context.Context, id int) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditEntries) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to approve entries.")
	}

	err := models.ApproveEntryById(ctx, id)
	if err != nil {
		return nil, err
	}

	return r.Query().Entry(ctx, id)
}

func (r *mutationResolver) DisqualifyEntry(ctx context.Context, id int) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditEntries) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to disqualify entries.")
	}

	err := models.DisqualifyEntryById(ctx, id)
	if err != nil {
		return nil, err
	}

	return r.Query().Entry(ctx, id)
}

func (r *mutationResolver) EditEntry(ctx context.Context, id int, input model.EditEntryInput) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.EditEntries) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to edit entries.")
	}

	entry, err := models.GetEntryById(ctx, id)
	if err != nil {
		return nil, err
	}

	if !auth.HasPermission(user, auth.AssignEntryGroups) {
		input.Group = entry.Group.ID
	}
	if !user.IsAdmin {
		input.IsSkillLevelLocked = *entry.IsSkillLevelLocked
	}

	err = models.EditEntryById(ctx, id, &input)
	if err != nil {
		return nil, err
	}

	return r.Query().Entry(ctx, id)
}

func (r *mutationResolver) DeleteEntry(ctx context.Context, id int) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.DeleteEntries) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to delete entries.")
	}

	entry, err := r.Query().Entry(ctx, id)
	if err != nil {
		return nil, err
	}

	err = models.DeleteEntryById(ctx, id)
	if err != nil {
		return nil, err
	}

	return entry, nil
}

func (r *mutationResolver) SetEntryLevel(ctx context.Context, id int, skillLevel string) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil || !user.IsAdmin {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to set entry skill levels.")
	}

	err := models.SetEntryLevelById(ctx, id, skillLevel)
	if err != nil {
		return nil, err
	}

	return r.Query().Entry(ctx, id)
}

func (r *mutationResolver) CreateEntryVote(ctx context.Context, entryID int, reason string) (*model.EntryVote, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.JudgeEntries) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to vote for winning entries.")
	}

	entry, err := models.GetEntryById(ctx, entryID)
	if err != nil {
		return nil, err
	}

	contest, err := models.GetContestById(ctx, entry.Contest.ID)
	if err != nil {
		return nil, err
	}

	if !*contest.IsVotingEnabled {
		return nil, errs.NewForbiddenError(ctx, "Voting is not enabled for this contest.")
	}

	id, err := models.CreateEntryVote(ctx, entryID, user.ID, reason)
	if err != nil {
		return nil, err
	}

	return r.Query().EntryVote(ctx, *id)
}

func (r *mutationResolver) DeleteEntryVote(ctx context.Context, id int) (*model.EntryVote, error) {
	user := auth.GetUserFromContext(ctx)

	vote, err := r.Query().EntryVote(ctx, id)
	if err != nil {
		return nil, err
	}

	if !auth.HasPermission(user, auth.JudgeEntries) || user == nil || (vote.User.ID != user.ID && !user.IsAdmin) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to vote for winning entries.")
	}

	contestId, err := models.GetContestIdByVoteId(ctx, id)
	if err != nil {
		return nil, err
	}

	contest, err := models.GetContestById(ctx, *contestId)
	if err != nil {
		return nil, err
	}

	if !*contest.IsVotingEnabled {
		return nil, errs.NewForbiddenError(ctx, "Voting is not enabled for this contest.")
	}

	err = models.DeleteEntryVoteById(ctx, id)
	if err != nil {
		return nil, err
	}

	return vote, nil
}

func (r *mutationResolver) ImportEntries(ctx context.Context, contestID int) (bool, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.AddEntries) {
		return false, errs.NewForbiddenError(ctx, "You do not have permission to import entries.")
	}

	contest, err := models.GetContestById(ctx, contestID)
	if err != nil {
		return false, err
	}

	splitURL := strings.Split(*contest.URL, "/")
	APIEndpoint := fmt.Sprintf("https://www.khanacademy.org/api/internal/scratchpads/Scratchpad:%s/top-forks?sort=2&page=0&limit=1000", splitURL[len(splitURL)-1])

	res, err := http.Get(APIEndpoint)
	if err != nil {
		return false, err
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return false, err
	}

	type Scratchpad struct {
		Created    string `json:"created"`
		Title      string `json:"title"`
		Votes      int    `json:"sumVotesIncremented"`
		URL        string `json:"url"`
		AuthorKAID string `json:"authorKaid"`
		AuthorName string `json:"authorNickname"`
	}

	type Response struct {
		Scratchpads []Scratchpad `json:"scratchpads"`
	}

	var data Response
	json.Unmarshal(body, &data)

	for i := range data.Scratchpads {
		urlSplit := strings.Split(data.Scratchpads[i].URL, "/")
		input := &models.EntryInput{
			URL:        data.Scratchpads[i].URL,
			Kaid:       urlSplit[len(urlSplit)-1],
			Title:      data.Scratchpads[i].Title,
			AuthorName: data.Scratchpads[i].AuthorName,
			AuthorKaid: data.Scratchpads[i].AuthorKAID,
			Votes:      data.Scratchpads[i].Votes,
			Created:    data.Scratchpads[i].Created,
		}

		_, err := models.CreateEntry(ctx, contestID, input)
		if err != nil {
			return false, err
		}
	}

	return true, nil
}

func (r *mutationResolver) ImportEntry(ctx context.Context, contestID int, kaid string) (*model.Entry, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.AddEntries) {
		return nil, errs.NewForbiddenError(ctx, "You do not have permission to import entries.")
	}

	APIEndpoint := fmt.Sprintf("https://www.khanacademy.org/api/internal/show_scratchpad?scratchpad_id=%s", kaid)

	res, err := http.Get(APIEndpoint)
	if err != nil {
		return nil, err
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	type Scratchpad struct {
		URL        string `json:"url"`
		AuthorKaid string `json:"kaid"`
		Title      string `json:"title"`
		Votes      int    `json:"sumVotesIncremented"`
		Created    string `json:"created"`
		Height     int    `json:"height"`
	}

	type Author struct {
		AuthorName string `json:"nickname"`
	}

	type Response struct {
		Scratchpad Scratchpad `json:"scratchpad"`
		Author     Author     `json:"creatorProfile"`
	}

	var data Response
	json.Unmarshal(body, &data)

	input := &models.EntryInput{
		URL:        data.Scratchpad.URL,
		Kaid:       kaid,
		Title:      data.Scratchpad.Title,
		AuthorName: data.Author.AuthorName,
		AuthorKaid: data.Scratchpad.AuthorKaid,
		Votes:      data.Scratchpad.Votes,
		Created:    data.Scratchpad.Created,
	}

	id, err := models.CreateEntry(ctx, contestID, input)
	if err != nil {
		return nil, err
	}

	return r.Query().Entry(ctx, *id)
}

func (r *mutationResolver) AssignAllEntriesToGroups(ctx context.Context, contestID int) (bool, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.AssignEntryGroups) {
		return false, errs.NewForbiddenError(ctx, "You do not have permission to assign entries to groups.")
	}

	err := models.AssignAllEntriesToGroups(ctx, contestID)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) AssignNewEntriesToGroups(ctx context.Context, contestID int) (bool, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.AssignEntryGroups) {
		return false, errs.NewForbiddenError(ctx, "You do not have permission to assign entries to groups.")
	}

	err := models.AssignNewEntriesToGroups(ctx, contestID)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) TransferEntryGroups(ctx context.Context, contest int, prevGroup int, newGroup int) (bool, error) {
	user := auth.GetUserFromContext(ctx)

	if !auth.HasPermission(user, auth.AssignEntryGroups) {
		return false, errs.NewForbiddenError(ctx, "You do not have permission to transfer entry groups.")
	}

	err := models.TransferEntryGroups(ctx, contest, prevGroup, newGroup)
	if err != nil {
		return false, err
	}

	return true, nil
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

func (r *queryResolver) EntryVote(ctx context.Context, id int) (*model.EntryVote, error) {
	user := auth.GetUserFromContext(ctx)

	if user == nil {
		return nil, nil
	}

	vote, err := models.GetEntryVoteById(ctx, id)
	if err != nil {
		return nil, err
	}

	return vote, nil
}

// Entry returns generated.EntryResolver implementation.
func (r *Resolver) Entry() generated.EntryResolver { return &entryResolver{r} }

// EntryVote returns generated.EntryVoteResolver implementation.
func (r *Resolver) EntryVote() generated.EntryVoteResolver { return &entryVoteResolver{r} }

type entryResolver struct{ *Resolver }
type entryVoteResolver struct{ *Resolver }
