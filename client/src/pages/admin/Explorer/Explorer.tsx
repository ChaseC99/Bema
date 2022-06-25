import { ApolloExplorerReact } from '@apollo/explorer';
import "./Explorer.css";

function Explorer() {
  return (
    <div className="container col-12" id="explorer">
      <ApolloExplorerReact
        graphRef='Bema-Local@current'
        endpointUrl='/api/internal/graphql'
        persistExplorerState={true}
        initialState={{
          document: '',
          variables: {},
          headers: {},
          displayOptions: {
            showHeadersAndEnvVars: false,
            docsPanelState: 'open',
            theme: 'light',
          },
        }}
      />
    </div>
  );
}

export default Explorer;