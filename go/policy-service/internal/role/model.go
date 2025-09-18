package role

type RoleScope string

const (
	RoleScopeUsers   RoleScope = "USERS"
	RoleScopeCourses RoleScope = "COURSES"
)

type Role struct {
	ID          string      `bson:"_id" json:"id"`
	Description string      `bson:"description,omitempty" json:"description,omitempty"`
	Scopes      []RoleScope `bson:"scopes" json:"scopes"`
}
