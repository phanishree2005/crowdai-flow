package auth

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTManager handles signing and validating JWTs
type JWTManager struct {
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
	issuer     string
}

// CustomClaims represents the JWT claims used by CrowdFlow
type CustomClaims struct {
	Roles  []string `json:"roles"`
	Scopes []string `json:"scopes"`
	jwt.RegisteredClaims
}

func NewJWTManager(privateKey *rsa.PrivateKey, publicKey *rsa.PublicKey, issuer string) *JWTManager {
	return &JWTManager{
		privateKey: privateKey,
		publicKey:  publicKey,
		issuer:     issuer,
	}
}

func (m *JWTManager) Generate(subject string, roles []string, scopes []string, duration time.Duration) (string, error) {
	claims := CustomClaims{
		Roles:  roles,
		Scopes: scopes,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   subject,
			Issuer:    m.issuer,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(m.privateKey)
}

func (m *JWTManager) Validate(tokenStr string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return m.publicKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
