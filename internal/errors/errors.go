package errors

import (
	"context"
	"fmt"

	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/pkg/errors"
)

type stackTracer interface {
	StackTrace() errors.StackTrace
}

type causer interface {
	Cause() error
}

type InternalError struct {
	PublicMessage string
	InternalError error
	UserId        *int
	Origin        string
	Referer       string
	UserAgent     string
	CallStack     string
}

func (e *InternalError) Error() string {
	return e.PublicMessage
}

func NewInternalError(ctx context.Context, publicMessage string, err error) *InternalError {
	internalError := errors.WithStack(err) // Wraps the passed in error so a stack trace can be added

	newError := &InternalError{
		PublicMessage: publicMessage,
		InternalError: internalError,
		UserId:        nil,
		Origin:        "",
		Referer:       "",
		UserAgent:     "",
		CallStack:     fmt.Sprintf("%v\n%v", internalError.(stackTracer).StackTrace(), internalError.(causer).Cause()),
	}

	user := auth.GetUserFromContext(ctx)
	if user != nil {
		newError.UserId = &user.ID
	}

	logError(newError)

	return newError
}

type NotFoundError struct {
	message string
}

func (e *NotFoundError) Error() string {
	return e.message
}

func NewNotFoundError(message string) *NotFoundError {
	return &NotFoundError{
		message: message,
	}
}

func logError(err *InternalError) {
	fmt.Println(err.InternalError)
	//db.DB.Query("SELECT log_error($1, $2, $3, $4, $5, $6);", err.PublicMessage, err.CallStack, err.UserId, err.Origin, err.Referer, err.UserAgent)
}
