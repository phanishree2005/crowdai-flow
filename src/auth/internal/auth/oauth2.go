package auth

import (
	"errors"
	"time"
)

type OAuth2Service struct {
	jwtManager *JWTManager
}

func NewOAuth2Service(jwtManager *JWTManager) *OAuth2Service {
	return &OAuth2Service{jwtManager: jwtManager}
}

func (s *OAuth2Service) HandleClientCredentials(clientID, clientSecret string, requestedScopes []string) (string, error) {
	// In a real implementation, we would check the client credentials against a DB
	if clientID == "" || clientSecret == "" {
		return "", errors.New("invalid client credentials")
	}

	// Determine roles based on clientID for demo purposes
	roles := []string{"device"}
	if clientID == "admin_client" {
		roles = []string{"admin"}
	}

	token, err := s.jwtManager.Generate(clientID, roles, requestedScopes, 1*time.Hour)
	if err != nil {
		return "", err
	}

	return token, nil
}
