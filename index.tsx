import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const qc = new QueryClient(
  // NOTE: Suspense mode for React Query is experimental, same as Suspense for data fetching itself. These APIs WILL change and should not be used in production unless you lock both your React and React Query versions to patch-level versions that are compatible with each other.
  // {
  //   defaultOptions: {
  //     queries: {
  //       suspense: true,
  //     }
  //   }
  // }
);

let globalName = 'Alice';

const queryKey = 'name';

const queryOptions = {
  queryKey: [queryKey],
  queryFn(): Promise<string> {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(globalName);
      }, 1500);
    });
  },
  // NOTE: Suspense mode for React Query is experimental, same as Suspense for data fetching itself. These APIs WILL change and should not be used in production unless you lock both your React and React Query versions to patch-level versions that are compatible with each other.
  // suspense: true,
};

function View() {
  // const uqc = useQueryClient();

  const { data, isLoading,isRefetching } = useQuery(queryOptions);

  if (isRefetching) {
    return <div>Refetching...</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{data}</div>

  /*
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div>{data}</div>
    </React.Suspense>
  );
  */
}

function MutatationView() {
  const [name, setName] = React.useState('');

  const uqc = useQueryClient();
  const mutation = useMutation({
    mutationFn(newName: string): Promise<void> {
    return new Promise(function(resolve) {
      setTimeout(function() {
        globalName = newName;
        resolve();
      }, 1500);
    });
    },
    onSuccess() {
      // Invalidate and refetch
      uqc.invalidateQueries({ queryKey: [queryKey] })
    },
  })

  const onChange: React.ChangeEventHandler = (event: React.ChangeEvent) => {
    // I don't like instanceof
    if (event.target instanceof HTMLInputElement) {
      setName(event.target.value)
    }
  };

  const onClick: React.MouseEventHandler = () => {
    mutation.mutate(name);
  };

  return (
    <div>
      <input type="text" onChange={onChange} />
      <input type="button" value="mutate" onClick={onClick} />
      {mutation.isLoading && <span>Updating...</span>}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={qc}>
      <View />
      <MutatationView />
    </QueryClientProvider>
  );
}

const div = document.querySelector<HTMLDivElement>('#js-root');

if (div) {
  ReactDOM.createRoot(div).render(<App />);
}
