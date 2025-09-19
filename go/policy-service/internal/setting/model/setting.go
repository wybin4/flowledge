package setting_model

import (
	"encoding/json"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/bsontype"
)

// SettingType перечисление типов (аналог enum)
type SettingType string

// SettingValue — универсальное значение (string/int/bool/float/map)
type SettingValue struct {
	Val interface{}
}

// JSON
func (s *SettingValue) UnmarshalJSON(data []byte) error {
	var v interface{}
	if err := json.Unmarshal(data, &v); err != nil {
		return err
	}
	s.Val = v
	return nil
}

func (s SettingValue) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.Val)
}

// BSON
func (s *SettingValue) UnmarshalBSONValue(t bsontype.Type, data []byte) error {
	var v interface{}
	if err := bson.UnmarshalValue(t, data, &v); err != nil {
		return err
	}
	s.Val = v
	return nil
}

func (s SettingValue) MarshalBSONValue() (bsontype.Type, []byte, error) {
	return bson.MarshalValue(s.Val)
}

// SettingSelectOption вариант выбора
type SettingSelectOption struct {
	Value string `bson:"value" json:"value"`
	Label string `bson:"label" json:"label"`
}

// EnableQuery условие включения/отображения
type EnableQuery struct {
	Field string      `bson:"field" json:"field"`
	Value interface{} `bson:"value" json:"value"`
}

// SettingModel — документ в MongoDB
type Setting struct {
	ID              string                `bson:"_id" json:"_id"`
	Type            SettingType           `bson:"type" json:"type"`
	Public          bool                  `bson:"public" json:"public"`
	I18nLabel       string                `bson:"i18nLabel" json:"i18nLabel"`
	Value           SettingValue          `bson:"value" json:"value"`
	PackageValue    SettingValue          `bson:"packageValue" json:"packageValue"`
	CreatedAt       time.Time             `bson:"createdAt" json:"createdAt"`
	Options         []SettingSelectOption `bson:"options,omitempty" json:"options,omitempty"`
	I18nDescription *string               `bson:"i18nDescription,omitempty" json:"i18nDescription,omitempty"`
	EnableQuery     *EnableQuery          `bson:"enableQuery,omitempty" json:"enableQuery,omitempty"`
	DisplayQuery    *EnableQuery          `bson:"displayQuery,omitempty" json:"displayQuery,omitempty"`
	Placeholder     *string               `bson:"placeholder,omitempty" json:"placeholder,omitempty"`
	UpdatedAt       time.Time             `bson:"_updatedAt" json:"_updatedAt"`
}
