package auth

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/go-ldap/ldap/v3"
	"github.com/wybin4/flowledge/go/pkg/transport"
	"github.com/wybin4/flowledge/go/pkg/utils"
)

// ==================== LDAPServiceSettings ====================
type LDAPServiceSettings struct {
	settingsManager *transport.SettingsManager
	client          *transport.SettingsServiceClient
}

func NewLDAPServiceSettings(client *transport.SettingsServiceClient, manager *transport.SettingsManager, sub message.Subscriber) *LDAPServiceSettings {
	s := &LDAPServiceSettings{
		client:          client,
		settingsManager: manager,
	}

	// Асинхронная загрузка настроек
	go s.loadInitialSettings()

	// Подписка на события обновления
	s.client.SubscribeEvents(sub, manager)

	return s
}

func (s *LDAPServiceSettings) loadInitialSettings() {
	var values map[string]interface{}
	var err error

	for i := 0; i < 3; i++ {
		values, err = s.client.GetSettingsByPattern(context.Background(), `^ldap\.`)
		if err == nil {
			break
		}
		log.Printf("Failed to load LDAP settings (attempt %d): %v", i+1, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Printf("Warning: Failed to load initial LDAP settings: %v", err)
		return
	}

	for k, v := range values {
		s.settingsManager.Set(k, v)
	}

	log.Println("LDAP settings loaded successfully")
}

func (s *LDAPServiceSettings) Get(key string) interface{} {
	val, _ := s.settingsManager.Get(key)
	return val
}

// ==================== LDAPAuthenticator ====================
type LDAPAuthenticator struct {
	settings *LDAPServiceSettings
}

func NewLDAPAuthenticator(settings *LDAPServiceSettings) *LDAPAuthenticator {
	return &LDAPAuthenticator{settings: settings}
}

// LdapAuthenticate проверяет пользователя через LDAP
func LdapAuthenticate(cfg LdapConfig, username, password string) (string, []string, error) {
	protocol := "ldap"
	if cfg.Port == 636 {
		protocol = "ldaps"
	}

	// Dial по tcp с TLS, если ldaps
	var l *ldap.Conn
	var err error
	if protocol == "ldaps" {
		l, err = ldap.DialTLS("tcp", fmt.Sprintf("%s:%d", cfg.Host, cfg.Port), &tls.Config{InsecureSkipVerify: true})
	} else {
		l, err = ldap.Dial("tcp", fmt.Sprintf("%s:%d", cfg.Host, cfg.Port))
	}

	if err != nil {
		return "", nil, err
	}
	defer l.Close()

	// Bind как админ
	if err := l.Bind(cfg.AdminDN, cfg.AdminPassword); err != nil {
		return "", nil, err
	}

	filterTemplate := strings.ReplaceAll(cfg.UserSearchFilter, "{0}", "%s")
	filter := fmt.Sprintf(filterTemplate, username)

	searchRequest := ldap.NewSearchRequest(
		cfg.UserBaseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		filter,
		[]string{"dn", "memberOf"},
		nil,
	)

	result, err := l.Search(searchRequest)
	if err != nil || len(result.Entries) == 0 {
		return "", nil, fmt.Errorf("user not found")
	}

	userDN := result.Entries[0].DN
	memberOf := []string{}
	for _, group := range result.Entries[0].GetAttributeValues("memberOf") {
		memberOf = append(memberOf, extractGroupName(group, cfg.GroupBaseDN))
	}

	// Пробуем bind пользователя с его паролем
	if err := l.Bind(userDN, password); err != nil {
		return "", nil, err
	}

	return userDN, memberOf, nil
}

func extractGroupName(dn, baseDN string) string {
	return dn[len("cn=") : len(dn)-len(","+baseDN)]
}

func (a *LDAPAuthenticator) IsEnabled() bool {
	return utils.ToBool(a.settings.Get("ldap.enabled"))
}

func (a *LDAPAuthenticator) Authenticate(username, password string) (string, []string, error) {
	host := a.settings.Get("ldap.connection.host").(string)
	port, err := utils.ToInt(a.settings.Get("ldap.connection.port"))

	if err != nil {
		return "", nil, fmt.Errorf("invalid type for ldap.connection.host")
	}

	adminDN := a.settings.Get("ldap.auth.dn").(string)
	adminPassword := a.settings.Get("ldap.auth.password").(string)
	userBaseDN := a.settings.Get("ldap.user.base-dn").(string)
	userFilter := a.settings.Get("ldap.user.search-filter").(string)
	groupBaseDN := a.settings.Get("ldap.group.base-dn").(string)

	cfg := LdapConfig{
		Host:             host,
		Port:             port,
		AdminDN:          adminDN,
		AdminPassword:    adminPassword,
		UserBaseDN:       userBaseDN,
		UserSearchFilter: userFilter,
		GroupBaseDN:      groupBaseDN,
	}

	return LdapAuthenticate(cfg, username, password)
}

// Вспомогательная функция для извлечения имени группы
func (a *LDAPAuthenticator) ExtractGroupName(dn string) string {
	base := a.settings.Get("ldap.group.base-dn").(string)
	return strings.TrimPrefix(strings.ReplaceAll(dn, ","+base, ""), "cn=")
}

func (a *LDAPAuthenticator) MapGroupsToCoursesAndTags(groups []string) []string {
	val := a.settings.Get("ldap.map-groups-to-courses")
	if val == nil {
		return nil
	}
	mapping := map[string][]string{}
	if str, ok := val.(string); ok {
		if err := json.Unmarshal([]byte(str), &mapping); err != nil {
			log.Printf("Failed to parse map-groups-to-courses: %v", err)
			return nil
		}
	}
	result := []string{}
	for _, g := range groups {
		if tags, ok := mapping[g]; ok {
			result = append(result, tags...)
		}
	}
	uniq := map[string]struct{}{}
	for _, r := range result {
		uniq[r] = struct{}{}
	}
	final := []string{}
	for k := range uniq {
		final = append(final, k)
	}
	return final
}
