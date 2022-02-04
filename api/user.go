package api

type User struct {
	Id        int   `json:"id"`
	CreatedTs int64 `json:"createdTs"`
	UpdatedTs int64 `json:"updatedTs"`

	OpenId   string `json:"openId"`
	Name     string `json:"name"`
	Password string `json:"-"`
}

type UserCreate struct {
	OpenId   string `json:"openId"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type UserPatch struct {
	Id int

	OpenId *string

	Name        *string `json:"name"`
	Password    *string `json:"password"`
	ResetOpenId *bool   `json:"resetOpenId"`
}

type UserFind struct {
	Id *int `json:"id"`

	Name     *string `json:"name"`
	Password *string
	OpenId   *string
}

type UserRenameCheck struct {
	Name string `json:"name"`
}

type UserPasswordCheck struct {
	Password string `json:"password"`
}

type UserService interface {
	CreateUser(create *UserCreate) (*User, error)
	PatchUser(patch *UserPatch) (*User, error)
	FindUser(find *UserFind) (*User, error)
}
