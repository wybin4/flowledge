package utils

import (
	"errors"
	"strings"

	"github.com/go-ldap/ldap/v3"
)

var (
	ErrEmptyPassword          = errors.New("empty password")
	ErrEmptyUsername          = errors.New("empty username")
	ErrEmptyCredentials       = errors.New("empty username or password")
	ErrInvalidCredentials     = errors.New("invalid username or password")
	ErrUserNotFoundLDAP       = errors.New("user not found in LDAP")
	ErrUserNotFoundDB         = errors.New("user not found in database")
	ErrUserNotFoundBoth       = errors.New("user not found in LDAP and database")
	ErrLDAPConnection         = errors.New("ldap connection error")
	ErrUserServiceUnavailable = errors.New("user-service unavailable")
)

func MapLdapError(err error) error {
	var ldapErr *ldap.Error
	if errors.As(err, &ldapErr) {
		switch ldapErr.ResultCode {
		case ldap.LDAPResultInvalidCredentials:
			return ErrInvalidCredentials
		case ldap.LDAPResultNoSuchObject:
			return ErrUserNotFoundLDAP
		default:
			return ErrLDAPConnection
		}
	}

	// дополнительная проверка по тексту ошибки
	if err != nil {
		msg := strings.ToLower(err.Error())
		if strings.Contains(msg, "invalid credentials") {
			return ErrInvalidCredentials
		}
		if strings.Contains(msg, "user not found") || strings.Contains(msg, "no such object") {
			return ErrUserNotFoundLDAP
		}
	}

	return ErrLDAPConnection
}
