//go:generate go run github.com/99designs/gqlgen generate

package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/graph/resolvers"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/KA-Challenge-Council/Bema/internal/db"
	"github.com/KA-Challenge-Council/Bema/internal/errors"
	"github.com/go-chi/chi"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	_ "github.com/lib/pq"
)

const defaultPort = "8080"

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("error loading environment variables")
	}

	port := os.Getenv("GRAPHQL_PORT")
	if port == "" {
		port = defaultPort
	}

	// Create database connection
	db.InitDB()

	// Create configuration and set directive handlers
	config := generated.Config{Resolvers: &resolvers.Resolver{}}

	// Create router
	router := chi.NewRouter()
	router.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"https://www.kachallengecouncil.org", "https://bema-development.herokuapp.com/", "https://studio.apollographql.com", "http://localhost:6001"},
		AllowCredentials: true,
		Debug:            false,
	}).Handler)
	router.Use(auth.Middleware(nil))
	router.Use(errors.Middleware(nil))

	// Create graphql handler
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(config))
	router.Handle("/api/internal/graphql", srv)

	// Render a playground editor in dev mode
	mode := os.Getenv("APP_STATE")
	if mode == "dev" {
		router.Handle("/", playground.Handler("Bema", "/api/internal/graphql"))
	}

	// Start the server
	log.Println("Running server on port :" + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
