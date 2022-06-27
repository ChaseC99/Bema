package models

import (
	"context"
	"database/sql"

	"github.com/KA-Challenge-Council/Bema/graph/model"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/KA-Challenge-Council/Bema/internal/util"
)

const ERROR_PAGE_SIZE = 20

func NewErrorModel() model.Error {
	error := model.Error{}
	user := NewUserModel()
	error.User = &user

	return error
}

func GetErrorsByPage(ctx context.Context, page int) ([]*model.Error, error) {
	errs := []*model.Error{}

	rows, err := db.DB.Query("SELECT error_id, error_message, error_stack, to_char(error_tstz, $1), request_origin, request_referer, user_agent, evaluator_id FROM error ORDER BY error_id DESC LIMIT $2 OFFSET $3;", util.DisplayFancyDateFormat, ERROR_PAGE_SIZE, ERROR_PAGE_SIZE*page)
	if err != nil {
		return []*model.Error{}, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the list of logged errors", err)
	}

	for rows.Next() {
		e := NewErrorModel()

		if err := rows.Scan(&e.ID, &e.Message, &e.Stack, &e.Timestamp, &e.RequestOrigin, &e.RequestReferrer, &e.RequestUserAgent, &e.User.ID); err != nil {
			return []*model.Error{}, errors.NewInternalError(ctx, "An unexpected error occurred while reading the list of logged errors", err)
		}

		errs = append(errs, &e)
	}

	return errs, nil
}

func GetErrorById(ctx context.Context, id int) (*model.Error, error) {
	row := db.DB.QueryRow("SELECT error_id, error_message, error_stack, to_char(error_tstz, $1), request_origin, request_referer, user_agent, evaluator_id FROM error WHERE error_id = $2;", util.DisplayFancyDateFormat, id)

	e := NewErrorModel()
	e.User = &model.User{}
	if err := row.Scan(&e.ID, &e.Message, &e.Stack, &e.Timestamp, &e.RequestOrigin, &e.RequestReferrer, &e.RequestUserAgent, &e.User.ID); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError(ctx, "Oops! The requested error does not exist.")
		}
		return nil, errors.NewInternalError(ctx, "An unexpected error occurred while retrieving the requested error", err)
	}

	return &e, nil
}

func DeleteErrorById(ctx context.Context, id int) error {
	_, err := db.DB.Exec("DELETE FROM error WHERE error_id = $1;", id)
	if err != nil {
		return errors.NewInternalError(ctx, "An unexpected error occurred while deleting a logged error", err)
	}
	return nil
}
