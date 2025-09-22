package gateway_limit

import (
	"net"
	"net/http"
	"sync"
	"time"

	gateway_metric "github.com/wybin4/flowledge/go/gateway-service/internal/metric"
	"golang.org/x/time/rate"
)

type limiterEntry struct {
	limiter *rate.Limiter
	last    time.Time
}

type RateLimiter struct {
	limiters map[string]*limiterEntry
	mu       sync.Mutex
	r        rate.Limit
	b        int
	cleanup  time.Duration
}

func NewRateLimiter(r rate.Limit, b int, cleanup time.Duration) *RateLimiter {
	rl := &RateLimiter{
		limiters: make(map[string]*limiterEntry),
		r:        r,
		b:        b,
		cleanup:  cleanup,
	}
	go rl.cleanupOld()
	return rl
}

func (rl *RateLimiter) getLimiter(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	le, exists := rl.limiters[ip]
	if !exists {
		le = &limiterEntry{
			limiter: rate.NewLimiter(rl.r, rl.b),
			last:    time.Now(),
		}
		rl.limiters[ip] = le
	} else {
		le.last = time.Now()
	}
	return le.limiter
}

func (rl *RateLimiter) cleanupOld() {
	for {
		time.Sleep(rl.cleanup)
		rl.mu.Lock()
		for ip, le := range rl.limiters {
			if time.Since(le.last) > rl.cleanup {
				delete(rl.limiters, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}

		limiter := rl.getLimiter(ip)
		if !limiter.Allow() {
			gateway_metric.RateLimitHits.Inc()
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
