package user_dto
type UserGetRequest struct {
	IsSmall     bool     `json:"isSmall"`
	Page        int      `json:"page"`
	PageSize    int      `json:"pageSize"`
	SearchQuery string   `json:"searchQuery,omitempty"`
	SortQuery   string   `json:"sortQuery,omitempty"`
	ExcludedIDs []string `json:"excludedIds,omitempty"`
}

type UserGetSmallResponse struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Name     string `json:"name"`
	Avatar   string `json:"avatar"`
}

type UserGetBigResponse struct {
	ID       string   `json:"id"`
	Username string   `json:"username"`
	Name     string   `json:"name"`
	Avatar   string   `json:"avatar"`
	Roles    []string `json:"roles"`
	Active   bool     `json:"active"`
}
