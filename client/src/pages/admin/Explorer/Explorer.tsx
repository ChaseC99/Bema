import { ApolloExplorerReact } from '@apollo/explorer';
import "./Explorer.css";

function Explorer() {
  let graphRef = 'Bema@current';
  if (window.location.href.includes('bema-development') || window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
    graphRef = 'Bema@development';
  }  

  return (
    <div className="container col-12" id="explorer">
      <ApolloExplorerReact
        graphRef={graphRef}
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