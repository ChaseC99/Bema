package errors

import (
	"context"
	"fmt"

	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/pkg/errors"
)

type stackTracer interface {
	StackTrace() errors.StackTrace
}

type causer interface {
	Cause() error
}

// Represents an unexpected internal server error. These errors are logged in the database, and only the public
// message is shown to the end user.
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

// Creates and logs a new internal error
func NewInternalError(ctx context.Context, publicMessage string, err error) *InternalError {
	internalError := errors.WithStack(err) // Wraps the passed in error so a stack trace can be added

	request := GetRequestFromContext(ctx)

	newError := &InternalError{
		PublicMessage: publicMessage,
		InternalError: internalError,
		UserId:        nil,
		Origin:        request.RemoteAddr,
		Referer:       request.Referer(),
		UserAgent:     request.UserAgent(),
		CallStack:     fmt.Sprintf("%v\n%v", internalError.(causer).Cause(), internalError.(stackTracer).StackTrace()),
	}

	user := auth.GetUserFromContext(ctx)
	if user != nil {
		newError.UserId = &user.ID
	}

	logError(newError)

	return newError
}

// Represents a not found error that occurs when the requested resource does not exist.
type NotFoundError struct {
	message string
}

func (e *NotFoundError) Error() string {
	return e.message
}

// Creates a new not found error
func NewNotFoundError(message string) *NotFoundError {
	return &NotFoundError{
		message: message,
	}
}

func logError(err *InternalError) {
	db.DB.Query("SELECT log_error($1, $2, $3, $4, $5, $6);", err.PublicMessage, err.CallStack, *err.UserId, err.Origin, err.Referer, err.UserAgent)
}
