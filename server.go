package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/KA-Challenge-Council/Bema/graph"
	"github.com/KA-Challenge-Council/Bema/graph/generated"
	"github.com/KA-Challenge-Council/Bema/internal/auth"
	"github.com/go-chi/chi"
	"github.com/joho/godotenv"
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

	router := chi.NewRouter()
	router.Use(auth.Middleware(nil))

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	router.Handle("/api/internal/graphql", srv)

	mode := os.Getenv("APP_STATE")
	if mode == "dev" {
		router.Handle("/", playground.Handler("Bema", "/api/internal/graphql"))
	}

	fmt.Println("Running server on port :" + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
