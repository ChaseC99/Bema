import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import './index.css';
import App from './App';
import { AppStateProvider } from './state/AppStateContext';
import { AppErrorProvider } from './util/errors';
import { BrowserRouter } from 'react-router-dom';
import { ERROR_PAGE_SIZE } from './pages/admin/Errors';

const httpLink = new HttpLink({
  uri: "/api/internal/graphql"
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((e) => {
      console.log(
        `[GraphQL error]: Message: ${e.message}, Location: ${e.locations}, Path: ${e.path}`,
      );
    }
    );
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          errors: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
            read(existing, { args }) {
              const page = args?.page || 0;
              return existing && existing.slice(page * ERROR_PAGE_SIZE, (page * ERROR_PAGE_SIZE) + ERROR_PAGE_SIZE);
            }
          }
        }
      }
    }
  })
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AppStateProvider>
        <AppErrorProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppErrorProvider>
      </AppStateProvider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);