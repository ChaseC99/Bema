package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	var connStr string
	if os.Getenv("DATABASE_URL") != "" {
		connStr = os.Getenv("DATABASE_URL")
	} else if os.Getenv("APP_STATE") == "dev" {
		connStr = os.Getenv("DEV_DB_URL")
	} else {
		connStr = os.Getenv("PROD_DB_URL")
	}
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Panic(err)
	}

	if err = db.Ping(); err != nil {
		log.Panic(err)
	}

	db.SetMaxOpenConns(10)

	DB = db

	log.Println("Connection to database established")
}
