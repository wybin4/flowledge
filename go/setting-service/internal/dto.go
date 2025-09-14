package setting

import "time"

type SettingUpdateRequest struct {
	ID    string      `json:"id" binding:"required"`
	Value interface{} `json:"value" binding:"required"`
}

type CreateSettingRequest struct {
	Key    string      `json:"key" binding:"required"`
	Value  interface{} `json:"value" binding:"required"`
	Public bool        `json:"public"`
}

type SettingResponse struct {
	ID        string      `json:"id"`
	Key       string      `json:"key"`
	Value     interface{} `json:"value"`
	Public    bool        `json:"public"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
}
