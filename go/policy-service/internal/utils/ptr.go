package utils

func CoalescePtr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
