package gateway_limit

import (
	"sync"
	"time"
)

type loginLimiterEntry struct {
	attempts int
	last     time.Time
	blocked  bool
	unblock  time.Time
}

type LoginLimiter struct {
	mu       sync.Mutex
	users    map[string]*loginLimiterEntry
	maxTries int
	window   time.Duration
	block    time.Duration
}

func NewLoginLimiter(maxTries int, window, block time.Duration) *LoginLimiter {
	return &LoginLimiter{
		users:    make(map[string]*loginLimiterEntry),
		maxTries: maxTries,
		window:   window,
		block:    block,
	}
}

func (ll *LoginLimiter) IsBlocked(username, ip string) bool {
	ll.mu.Lock()
	defer ll.mu.Unlock()
	key := username + "|" + ip
	now := time.Now()
	entry, ok := ll.users[key]
	if !ok {
		return false
	}
	if entry.blocked && now.Before(entry.unblock) {
		return true
	}
	if entry.blocked && now.After(entry.unblock) {
		entry.blocked = false
		entry.attempts = 0
	}
	return false
}

func (ll *LoginLimiter) IncrementFailed(username, ip string) {
	ll.mu.Lock()
	defer ll.mu.Unlock()
	key := username + "|" + ip
	now := time.Now()
	entry, ok := ll.users[key]
	if !ok {
		entry = &loginLimiterEntry{attempts: 1, last: now}
		ll.users[key] = entry
		return
	}
	if now.Sub(entry.last) > ll.window {
		entry.attempts = 1
	} else {
		entry.attempts++
	}
	entry.last = now
	if entry.attempts > ll.maxTries {
		entry.blocked = true
		entry.unblock = now.Add(ll.block)
	}
}

func (ll *LoginLimiter) Reset(username, ip string) {
	ll.mu.Lock()
	defer ll.mu.Unlock()
	key := username + "|" + ip
	delete(ll.users, key)
}
