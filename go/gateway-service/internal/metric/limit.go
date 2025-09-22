package gateway_metric

import (
	"github.com/prometheus/client_golang/prometheus"
)

var (
	RateLimitHits = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "rate_limit_hits_total",
			Help: "Number of requests blocked by rate limiter",
		},
	)

	FailedLoginAttempts = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "failed_login_attempts_total",
			Help: "Number of failed login attempts",
		},
	)

	AccountLockouts = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "account_lockouts_total",
			Help: "Number of account lockouts after failed login attempts",
		},
	)
)

func init() {
	prometheus.MustRegister(RateLimitHits)
	prometheus.MustRegister(FailedLoginAttempts)
	prometheus.MustRegister(AccountLockouts)
}
