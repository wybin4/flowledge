package transport

import "errors"

var (
	ErrInvalidPayload = errors.New("invalid payload")
	ErrUnknownAction  = errors.New("unknown action")
)
