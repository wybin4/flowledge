package user

import (
	"time"
)

type UserSettings struct {
	Theme    string `bson:"theme" json:"theme"`
	Language string `bson:"language" json:"language"`
}

// UserModel — основная модель пользователя
type UserModel struct {
	ID        string       `bson:"_id" json:"id"`
	Username  string       `bson:"username" json:"username"`
	Name      string       `bson:"name" json:"name"`
	Roles     []string     `bson:"roles" json:"-"`
	Active    bool         `bson:"active" json:"active"`
	CreatedAt time.Time    `bson:"createdAt" json:"-"`
	UpdatedAt time.Time    `bson:"updatedAt" json:"-"`
	Settings  UserSettings `bson:"settings" json:"-"`
	Services  UserServices `bson:"services" json:"-"`
}

type UserServices struct {
	// Resume   *ResumeService   `bson:"resume,omitempty" json:"resume,omitempty"`
	// LDAP     *LDAPService     `bson:"ldap,omitempty" json:"ldap,omitempty"`
	Password *PasswordService `bson:"password,omitempty" json:"password,omitempty"`
}

type PasswordService struct {
	Bcrypt string `bson:"bcrypt" json:"bcrypt"`
}

type CreateUserResponse struct {
	UserModel     *UserModel `json:"user_model"`
	AlreadyExists bool       `json:"already_exists"`
}
