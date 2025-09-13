package user

import "golang.org/x/crypto/bcrypt"

type UserPasswordService struct{}

func NewUserPasswordService() *UserPasswordService {
	return &UserPasswordService{}
}

func (s *UserPasswordService) Hash(plain string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func (s *UserPasswordService) Verify(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
