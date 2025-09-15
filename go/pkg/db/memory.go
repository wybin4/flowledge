package db

import "sync"

type MemoryStore[T any] struct {
	data map[string]T
	mu   sync.RWMutex
}

func NewMemoryStore[T any]() *MemoryStore[T] {
	return &MemoryStore[T]{
		data: make(map[string]T),
	}
}

func (m *MemoryStore[T]) Get(key string) (T, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	val, ok := m.data[key]
	return val, ok
}

func (m *MemoryStore[T]) Set(key string, value T) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.data[key] = value
}

func (m *MemoryStore[T]) All() map[string]T {
	m.mu.RLock()
	defer m.mu.RUnlock()

	result := make(map[string]T)
	for k, v := range m.data {
		result[k] = v
	}
	return result
}
