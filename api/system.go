package api

import "github.com/silver-ts/memos/server/profile"

type SystemStatus struct {
	Host    *User            `json:"host"`
	Profile *profile.Profile `json:"profile"`
}
