package role

type RoleScope string

const (
	RoleScopeUsers   RoleScope = "USERS"
	RoleScopeCourses RoleScope = "COURSES"
)

type Role struct {
	ID          string      `bson:"_id" json:"id"`
	Name        string      `bson:"name" json:"name"`
	Description string      `bson:"description" json:"description"`
	Scopes      []RoleScope `bson:"scopes" json:"scopes"`
}
