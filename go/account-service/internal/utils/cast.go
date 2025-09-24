package utils

func CastToString(v interface{}) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func CastToInt(v interface{}, def int) int {
	switch val := v.(type) {
	case int:
		return val
	case float64:
		return int(val)
	default:
		return def
	}
}

func CastToBool(v interface{}) bool {
	if b, ok := v.(bool); ok {
		return b
	}
	return false
}

func CastStringSlice(v interface{}) []string {
	if v == nil {
		return nil
	}
	if arr, ok := v.([]interface{}); ok {
		res := make([]string, len(arr))
		for i, val := range arr {
			res[i] = CastToString(val)
		}
		return res
	}
	return nil
}
