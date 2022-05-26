package errors

import (
	"context"
	"fmt"

	"github.com/99designs/gqlgen/graphql"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/pkg/errors"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type stackTracer interface {
	StackTrace() errors.StackTrace
}

type causer interface {
	Cause() error
}

// Creates and logs a new internal error
func NewInternalError(ctx context.Context, publicMessage string, err error) *gqlerror.Error {
	internalError := errors.WithStack(err) // Wraps the passed in error so a stack trace can be added
	callStack := fmt.Sprintf("%v\n%v", internalError.(causer).Cause(), internalError.(stackTracer).StackTrace())
	request := GetRequestFromContext(ctx)

	var userId *int = nil
	user := auth.GetUserFromContext(ctx)
	if user != nil {
		userId = &user.ID
	}

	logError(publicMessage, callStack, userId, request.RemoteAddr, request.Referer(), request.UserAgent())

	return &gqlerror.Error{
		Path:    graphql.GetPath(ctx),
		Message: publicMessage,
		Extensions: map[string]interface{}{
			"status": 500,
		},
	}
}

// Creates a new not found error
func NewNotFoundError(ctx context.Context, message string) *gqlerror.Error {
	return &gqlerror.Error{
		Path:    graphql.GetPath(ctx),
		Message: message,
		Extensions: map[string]interface{}{
			"status": 404,
		},
	}
}

func logError(publicMessage string, callStack string, userId *int, origin string, referer string, userAgent string) {
	db.DB.Query("SELECT log_error($1, $2, $3, $4, $5, $6);", publicMessage, callStack, userId, origin, referer, userAgent)
}
