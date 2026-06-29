package auth

// Role definitions
const (
	RoleAdmin  = "admin"
	RoleDevice = "device"
	RoleViewer = "viewer"
)

// CheckAccess verifies if a user with given roles has access to a specific resource path
func CheckAccess(roles []string, path string) bool {
	// Admin has access to everything
	for _, role := range roles {
		if role == RoleAdmin {
			return true
		}
	}

	// Device has access to telemetry
	if path == "/telemetry" {
		for _, role := range roles {
			if role == RoleDevice {
				return true
			}
		}
	}

	// By default, deny access
	return false
}
