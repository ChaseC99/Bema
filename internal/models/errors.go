package models

import (
	"context"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

func GetAllErrors(ctx context.Context) ([]*model.Error, error) {
	errs := []*model.Error{}

	rows, err := db.DB.Query("SELECT error_id, error_message, error_stack, to_char(error_tstz, $1), request_origin, request_referer, user_agent, evaluator_id FROM error;", util.DisplayFancyDateFormat)
	if err != nil {
		return []*model.Error{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of logged errors", err)
	}

	for rows.Next() {
		var e model.Error
		e.User = &model.User{}

		if err := rows.Scan(&e.ID, &e.Message, &e.Stack, &e.Timestamp, &e.RequestOrigin, &e.RequestReferrer, &e.RequestUserAgent, &e.User.ID); err != nil {
			return []*model.Error{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of logged errors", err)
		}

		errs = append(errs, &e)
	}

	return errs, nil
}
