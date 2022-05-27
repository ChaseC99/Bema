import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import './index.css';
import App from './App';
import { AppStateProvider } from './state/AppStateContext';
import { AppErrorProvider } from './util/errors';
import { BrowserRouter } from 'react-router-dom';

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
  cache: new InMemoryCache()
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