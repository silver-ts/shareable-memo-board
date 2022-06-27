package cmd

import (
	"fmt"
	"os"

	"github.com/silver-ts/memos/server"
	"github.com/silver-ts/memos/server/profile"
	"github.com/silver-ts/memos/store"
	DB "github.com/silver-ts/memos/store/db"
)

const (
	greetingBanner = `
███╗   ███╗███████╗███╗   ███╗ ██████╗ ███████╗
████╗ ████║██╔════╝████╗ ████║██╔═══██╗██╔════╝
██╔████╔██║█████╗  ██╔████╔██║██║   ██║███████╗
██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██║   ██║╚════██║
██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║╚██████╔╝███████║
╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝
`
)

type Main struct {
	profile *profile.Profile
}

func (m *Main) Run() error {
	db := DB.NewDB(m.profile)
	if err := db.Open(); err != nil {
		return fmt.Errorf("cannot open db: %w", err)
	}

	s := server.NewServer(m.profile)

	storeInstance := store.New(db.Db, m.profile)
	s.Store = storeInstance

	if err := s.Run(); err != nil {
		return err
	}

	return nil
}

func Execute() {
	profile := profile.GetProfile()
	m := Main{
		profile: profile,
	}

	println(greetingBanner)
	fmt.Printf("Version %s has started at :%d\n", profile.Version, profile.Port)

	if err := m.Run(); err != nil {
		fmt.Printf("error: %+v\n", err)
		os.Exit(1)
	}
}
