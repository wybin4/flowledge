package role

type DefaultRole string

const (
	USER      DefaultRole = "USER"
	EDITOR    DefaultRole = "EDITOR"
	ADMIN     DefaultRole = "ADMIN"
	OWNER     DefaultRole = "OWNER"
	MODERATOR DefaultRole = "MODERATOR"
)
