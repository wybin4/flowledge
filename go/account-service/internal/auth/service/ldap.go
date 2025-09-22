package auth_service

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/go-ldap/ldap/v3"
	auth_provider "github.com/wybin4/flowledge/go/account-service/internal/auth/provider"
	auth_type "github.com/wybin4/flowledge/go/account-service/internal/auth/type"
	"github.com/wybin4/flowledge/go/pkg/utils"
)

type LDAPService struct {
	settings *auth_provider.LDAPSettingProvider
}

func NewLDAPService(settings *auth_provider.LDAPSettingProvider) *LDAPService {
	return &LDAPService{settings: settings}
}

func LdapAuthenticate(cfg auth_type.LdapConfig, username, password string) (string, []string, error) {
	protocol := "ldap"
	if cfg.Port == 636 {
		protocol = "ldaps"
	}

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

	if err := l.Bind(userDN, password); err != nil {
		return "", nil, err
	}

	return userDN, memberOf, nil
}

func extractGroupName(dn, baseDN string) string {
	return dn[len("cn=") : len(dn)-len(","+baseDN)]
}

func (a *LDAPService) IsEnabled() bool {
	return utils.ToBool(a.settings.Get("ldap.enabled"))
}

func (a *LDAPService) Authenticate(username, password string) (string, []string, error) {
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

	cfg := auth_type.LdapConfig{
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

func (a *LDAPService) ExtractGroupName(dn string) string {
	base := a.settings.Get("ldap.group.base-dn").(string)
	return strings.TrimPrefix(strings.ReplaceAll(dn, ","+base, ""), "cn=")
}

func (a *LDAPService) MapGroupsToCoursesAndTags(groups []string) []string {
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
