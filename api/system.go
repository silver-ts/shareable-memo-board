package api

import "github.com/silver-ts/memos/server/profile"

type SystemStatus struct {
	Owner   *User            `json:"owner"`
	Profile *profile.Profile `json:"profile"`
}
