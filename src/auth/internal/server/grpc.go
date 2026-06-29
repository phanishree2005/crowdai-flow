package server

import (
	"context"
	"strings"

	extauthz "github.com/envoyproxy/go-control-plane/envoy/service/auth/v3"
	ratelimit "github.com/envoyproxy/go-control-plane/envoy/service/ratelimit/v3"
	envoy_type "github.com/envoyproxy/go-control-plane/envoy/type/v3"
	"github.com/redis/go-redis/v9"
	"google.golang.org/genproto/googleapis/rpc/status"
	"google.golang.org/grpc/codes"
)

type AuthzServer struct {
	rdb *redis.Client
}

func NewAuthzServer(rdb *redis.Client) *AuthzServer {
	return &AuthzServer{rdb: rdb}
}

// Check implements the Envoy ext_authz API
func (s *AuthzServer) Check(ctx context.Context, req *extauthz.CheckRequest) (*extauthz.CheckResponse, error) {
	authHeader, ok := req.Attributes.Request.Http.Headers["authorization"]
	
	if !ok || !strings.HasPrefix(authHeader, "Bearer ") {
		return &extauthz.CheckResponse{
			Status: &status.Status{Code: int32(codes.Unauthenticated)},
			HttpResponse: &extauthz.CheckResponse_DeniedResponse{
				DeniedResponse: &extauthz.DeniedHttpResponse{
					Status: &envoy_type.HttpStatus{Code: envoy_type.StatusCode_Unauthorized},
					Body:   "Missing or invalid Authorization header",
				},
			},
		}, nil
	}

	// token := strings.TrimPrefix(authHeader, "Bearer ")
	// In a real implementation, we would call jwt.Validate(token) here.
	// For scaffolding, we accept all tokens starting with Bearer.

	return &extauthz.CheckResponse{
		Status: &status.Status{Code: int32(codes.OK)},
		HttpResponse: &extauthz.CheckResponse_OkResponse{
			OkResponse: &extauthz.OkHttpResponse{},
		},
	}, nil
}

// ShouldRateLimit implements the Envoy ratelimit API
func (s *AuthzServer) ShouldRateLimit(ctx context.Context, req *ratelimit.RateLimitRequest) (*ratelimit.RateLimitResponse, error) {
	// Dummy implementation. In real life we check Redis here.
	return &ratelimit.RateLimitResponse{
		OverallCode: ratelimit.RateLimitResponse_OK,
	}, nil
}
