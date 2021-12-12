package store

import (
	"database/sql"
	"io/ioutil"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

/*
 * Use a global variable to save the db connection: Quick and easy to setup.
 * Reference: https://techinscribed.com/different-approaches-to-pass-database-connection-into-controllers-in-golang/
 */
var DB *sql.DB

func InitDBConn() {
	dbFilePath := "/var/opt/memos/data/memos.db"

	if _, err := os.Stat(dbFilePath); err != nil {
		dbFilePath = "./resources/memos.db"
		println("use the default database")
	} else {
		println("use the custom database")
	}

	db, err := sql.Open("sqlite3", dbFilePath)

	if err != nil {
		panic("db connect failed")
	} else {
		DB = db
		println("connect to sqlite succeed")
	}

	if dbFilePath == "./resources/memos.db" {
		resetDataInDefaultDatabase()
	}
}

func FormatDBError(err error) error {
	if err == nil {
		return nil
	}

	switch err.Error() {
	default:
		return err
	}
}

func resetDataInDefaultDatabase() {
	initialSQLFilePath := filepath.Join("resources", "initial_db.sql")
	c, err := ioutil.ReadFile(initialSQLFilePath)

	if err != nil {
		// do nth
		return
	}

	sql := string(c)
	DB.Exec(sql)

	println("Initial data succeed")
}
