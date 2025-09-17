package permission

type Permission struct {
	ID    string   `bson:"_id" json:"id"`
	Roles []string `bson:"roles" json:"roles"`
}
