package user_model

import "time"

type UserSettings struct {
	Theme    string `bson:"theme" json:"theme"`
	Language string `bson:"language" json:"language"`
}

type User struct {
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
	Resume []*Resume `bson:"resume,omitempty" json:"resume,omitempty"`
	// LDAP     *LDAP     `bson:"ldap,omitempty" json:"ldap,omitempty"`
	Password *Password `bson:"password,omitempty" json:"password,omitempty"`
}

type Resume struct {
	AccessToken  string    `bson:"access_token" json:"access_token"`
	RefreshToken string    `bson:"refresh_token" json:"refresh_token"`
	ExpiresAt    time.Time `bson:"expires_at" json:"expires_at"`
}

type Password struct {
	Bcrypt string `bson:"bcrypt" json:"bcrypt"`
}
