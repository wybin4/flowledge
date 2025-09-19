package setting

import (
	"context"
	"strings"
	"time"

	setting_model "github.com/wybin4/flowledge/go/policy-service/internal/setting/model"
	"github.com/wybin4/flowledge/go/policy-service/internal/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SettingRegistry struct {
	Repo         *SettingRepository
	settings     map[string]setting_model.Setting
	currentGroup string
	currentTab   string
}

func NewSettingRegistry(repo *SettingRepository) *SettingRegistry {
	return &SettingRegistry{
		Repo:     repo,
		settings: make(map[string]setting_model.Setting),
	}
}

// --- helpers ---
func now() time.Time { return time.Now() }

func coalesce(val, fallback string) string {
	if val != "" {
		return val
	}
	return fallback
}

// --- DSL ---
func (r *SettingRegistry) AddGroup(group string, fn func()) {
	prev := r.currentGroup
	r.currentGroup = group
	fn()
	r.currentGroup = prev
}

func (r *SettingRegistry) AddTab(tab string, fn func()) {
	prev := r.currentTab
	r.currentTab = tab
	fn()
	r.currentTab = prev
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func (r *SettingRegistry) AddSetting(id string, packageVal interface{}, details SettingDetails) {
	if r.currentGroup == "" {
		panic("group must be set before adding settings")
	}

	prefix := r.currentGroup
	if r.currentTab != "" {
		prefix += "." + r.currentTab
	}
	prefix += "." + id

	settingID := details.ID
	if settingID == "" {
		settingID = prefix
	}

	var options []setting_model.SettingSelectOption
	if len(details.Options) > 0 {
		options = make([]setting_model.SettingSelectOption, 0, len(details.Options))
		for _, opt := range details.Options {
			label := opt.Label
			if label == "" {
				label = prefix + "." + strings.ToLower(opt.Value)
			}
			options = append(options, setting_model.SettingSelectOption{
				Label: label,
				Value: opt.Value,
			})
		}
	}

	n := now()
	s := setting_model.Setting{
		ID:              settingID,
		Type:            setting_model.SettingType(details.Type),
		Public:          details.Public,
		I18nLabel:       coalesce(details.I18nLabel, prefix+".name"),
		I18nDescription: strPtr(coalesce(details.I18nDescription, prefix+".description")),
		Placeholder:     strPtr(coalesce(details.Placeholder, prefix+".placeholder")),
		Options:         options,
		Value:           setting_model.SettingValue{Val: packageVal},
		PackageValue:    setting_model.SettingValue{Val: packageVal},
		CreatedAt:       n,
		UpdatedAt:       n,
	}
	r.settings[settingID] = s
}

func optionsEqual(a, b []setting_model.SettingSelectOption) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i].Label != b[i].Label || a[i].Value != b[i].Value {
			return false
		}
	}
	return true
}

func upsertSettings(ctx context.Context, repo *SettingRepository, newSettings []setting_model.Setting, existingMap map[string]setting_model.Setting) error {
	if len(newSettings) == 0 {
		return nil
	}

	var inserts []mongo.WriteModel
	var updates []mongo.WriteModel

	for _, s := range newSettings {
		id := s.ID
		if e, ok := existingMap[id]; ok {
			// сохраняем Value/PackageValue
			s.Value = e.Value
			s.PackageValue = e.PackageValue

			// проверяем, есть ли реально изменения
			if e.Type == s.Type &&
				e.Public == s.Public &&
				e.I18nLabel == s.I18nLabel &&
				utils.CoalescePtr(e.I18nDescription) == utils.CoalescePtr(s.I18nDescription) &&
				utils.CoalescePtr(e.Placeholder) == utils.CoalescePtr(s.Placeholder) &&
				optionsEqual(e.Options, s.Options) {
				continue
			}

			update := mongo.NewUpdateOneModel().
				SetFilter(bson.M{"_id": id}).
				SetUpdate(bson.M{
					"$set": bson.M{
						"type":            s.Type,
						"public":          s.Public,
						"i18nLabel":       s.I18nLabel,
						"i18nDescription": s.I18nDescription,
						"placeholder":     s.Placeholder,
						"options":         s.Options,
						"updatedAt":       time.Now(),
					},
				})
			updates = append(updates, update)
		} else {
			// новая настройка — вставляем полностью
			s.CreatedAt = time.Now()
			s.UpdatedAt = s.CreatedAt
			inserts = append(inserts, mongo.NewInsertOneModel().SetDocument(s))
		}
	}

	if len(inserts) > 0 {
		_, err := repo.collection.BulkWrite(ctx, inserts)
		if err != nil {
			return err
		}
	}

	if len(updates) > 0 {
		_, err := repo.collection.BulkWrite(ctx, updates)
		if err != nil {
			return err
		}
	}

	return nil
}

// --- SaveAll с использованием тупо-настроечной версии ---
func (r *SettingRegistry) SaveAll(ctx context.Context) error {
	if len(r.settings) == 0 {
		return nil
	}

	existing, err := r.Repo.FindAll(ctx)
	if err != nil {
		return err
	}

	existingMap := make(map[string]setting_model.Setting, len(existing))
	for _, e := range existing {
		existingMap[r.Repo.ExtractID(e)] = e
	}

	newSettings := make([]setting_model.Setting, 0, len(r.settings))
	for _, s := range r.settings {
		newSettings = append(newSettings, s)
	}

	return upsertSettings(ctx, r.Repo, newSettings, existingMap)
}

func makeOptions(prefix string, values []string) []setting_model.SettingSelectOption {
	if len(values) == 0 {
		return nil
	}
	opts := make([]setting_model.SettingSelectOption, 0, len(values))
	for _, v := range values {
		opts = append(opts, setting_model.SettingSelectOption{
			Label: prefix + "." + strings.ToLower(v),
			Value: v,
		})
	}
	return opts
}

// --- InitDefaults ---
func (r *SettingRegistry) AddMissingSettings(ctx context.Context) error {
	r.AddGroup("user-default", func() {
		r.AddTab("appearance", func() {
			r.AddSetting("theme", "AUTO", SettingDetails{
				Type:    "SELECTOR_FINITE",
				Public:  true,
				Options: makeOptions("user-default.appearance.theme", []string{"AUTO", "DARK", "LIGHT"}),
			})
			r.AddSetting("language", "EN", SettingDetails{
				Type:    "SELECTOR_INFINITE",
				Public:  true,
				Options: makeOptions("user-default.appearance.language", []string{"EN", "RU"}),
			})
		})
	})

	r.AddGroup("ldap", func() {
		r.AddSetting("enabled", false, SettingDetails{
			Type:   "RADIO",
			Public: true,
		})
		r.AddSetting("map-groups-to-courses",
			`{"ad-group-1": ["course1","course-tag-1","course2"], "ad-group-2":["course-tag-2"]}`,
			SettingDetails{Type: "CODE"},
		)

		r.AddTab("connection", func() {
			r.AddSetting("host", "", SettingDetails{Type: "INPUT_TEXT"})
			r.AddSetting("port", 389, SettingDetails{Type: "INPUT_NUMBER"})
		})
		r.AddTab("auth", func() {
			r.AddSetting("dn", "", SettingDetails{Type: "INPUT_TEXT"})
			r.AddSetting("password", "", SettingDetails{Type: "INPUT_PASSWORD"})
		})
		r.AddTab("user", func() {
			r.AddSetting("base-dn", "", SettingDetails{Type: "INPUT_TEXT"})
			r.AddSetting("search-filter", "", SettingDetails{Type: "INPUT_TEXT"})
		})
		r.AddTab("group", func() {
			r.AddSetting("base-dn", "", SettingDetails{Type: "INPUT_TEXT"})
		})
	})

	r.AddGroup("file-upload", func() {
		r.AddTab("stuff", func() {
			r.AddSetting("task", "*", SettingDetails{Type: "INPUT_TEXT"})
			r.AddSetting("presentation", "*", SettingDetails{Type: "INPUT_TEXT"})
		})
		r.AddSetting("video", "*", SettingDetails{Type: "INPUT_TEXT"})
		r.AddSetting("size", 104857600, SettingDetails{Type: "INPUT_NUMBER"})
	})

	r.AddGroup("security", func() {
		r.AddSetting("link-restrictions", `["e.example.ru"]`, SettingDetails{Type: "INPUT_TEXT"})
	})

	r.AddGroup("discover", func() {
		r.AddSetting("page-size", 10, SettingDetails{Type: "INPUT_NUMBER"})
		r.AddSetting("preview-page-size", 5, SettingDetails{Type: "INPUT_NUMBER"})
	})

	r.AddGroup("courses-hub", func() {
		r.AddSetting("title-length", "(3, 100)", SettingDetails{Type: "INPUT_TEXT"})
		r.AddSetting("title-regex", "[a-zA-Zа-яА-Я0-9_ ]+", SettingDetails{Type: "INPUT_TEXT"})
	})

	r.AddGroup("api-integrations", func() {
		r.AddSetting("map-types-to-integrations",
			`{"surveys":"integration-id"}`,
			SettingDetails{Type: "CODE"},
		)
	})

	return r.SaveAll(ctx)
}

// --- details struct ---
type SettingDetails struct {
	ID              string
	Type            string
	Public          bool
	I18nLabel       string
	I18nDescription string
	Placeholder     string
	Options         []setting_model.SettingSelectOption
}
