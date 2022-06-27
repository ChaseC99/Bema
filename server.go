//go:generate go run github.com/99designs/gqlgen generate
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/resolvers"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	_ "github.com/lib/pq"
)

const defaultPort = "8080"

func main() {
	godotenv.Load(".env")

	port := os.Getenv("PORT")
	if port == "" {
		port = os.Getenv("GRAPHQL_PORT")
		if port == "" {
			port = defaultPort
		}
	}

	// Create database connection
	db.InitDB()

	// Create configuration and set directive handlers
	config := generated.Config{Resolvers: &resolvers.Resolver{}}

	// Create router
	router := mux.NewRouter()
	router.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"https://www.kachallengecouncil.org", "https://bema-development.herokuapp.com/", "https://studio.apollographql.com", "http://localhost:6001"},
		AllowCredentials: true,
		Debug:            false,
	}).Handler)
	router.Use(auth.Middleware())
	router.Use(errors.Middleware(nil))

	// Create graphql handler
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(config))
	router.Handle("/api/internal/graphql", srv)

	// Serve the react app
	router.PathPrefix("/static").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./client/build"))))
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./client/build/index.html")
	})

	// Start the server
	log.Println("Running server on port :" + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
