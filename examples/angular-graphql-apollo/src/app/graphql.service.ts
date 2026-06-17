import { Injectable, NgZone, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import type { MutationOptions } from '@apollo/client/core';
import { Observable } from 'rxjs';

export interface Item {
  id: string;
  name: string;
}

export const ITEMS_QUERY = gql`
  query Items {
    items {
      id
      name
    }
  }
`;

const ADD_ITEM_MUTATION = gql`
  mutation AddItem($name: String!) {
    addItem(name: $name) {
      id
      name
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UpdateItem($id: ID!, $name: String!) {
    updateItem(id: $id, name: $name) {
      id
      name
    }
  }
`;

const DELETE_ITEM_MUTATION = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id) {
      id
      name
    }
  }
`;

/** Apollo query/mutate promises from SchemaLink can resolve outside NgZone. */
function inAngularZone<T>(zone: NgZone, source: Observable<T>): Observable<T> {
  return new Observable((subscriber) =>
    source.subscribe({
      next: (value) => zone.run(() => subscriber.next(value)),
      error: (error) => zone.run(() => subscriber.error(error)),
      complete: () => zone.run(() => subscriber.complete()),
    }),
  );
}

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private readonly apollo = inject(Apollo);
  private readonly ngZone = inject(NgZone);

  getItems() {
    return inAngularZone(
      this.ngZone,
      this.apollo.query<{ items: Item[] }>({
        query: ITEMS_QUERY,
        // SchemaLink + InMemoryCache otherwise returns the first cached snapshot.
        fetchPolicy: 'network-only',
      }),
    );
  }

  addItem(name: string) {
    return this.mutateAndRefresh<{ addItem: Item }>({
      mutation: ADD_ITEM_MUTATION,
      variables: { name },
    });
  }

  updateItem(id: string, name: string) {
    return this.mutateAndRefresh<{ updateItem: Item }>({
      mutation: UPDATE_ITEM_MUTATION,
      variables: { id, name },
    });
  }

  deleteItem(id: string) {
    return this.mutateAndRefresh<{ deleteItem: Item }>({
      mutation: DELETE_ITEM_MUTATION,
      variables: { id },
    });
  }

  private mutateAndRefresh<T>(options: MutationOptions<T>) {
    return inAngularZone(
      this.ngZone,
      this.apollo.mutate<T>({
        ...options,
        refetchQueries: [{ query: ITEMS_QUERY }],
        awaitRefetchQueries: true,
      }),
    );
  }
}
