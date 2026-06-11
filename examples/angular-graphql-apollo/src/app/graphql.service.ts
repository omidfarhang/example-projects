import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

export interface Item {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private readonly apollo = inject(Apollo);

  getItems() {
    return this.apollo.query<{ items: Item[] }>({
      query: gql`
        query Items {
          items {
            id
            name
          }
        }
      `,
    });
  }

  addItem(name: string) {
    return this.apollo.mutate<{ addItem: Item }>({
      mutation: gql`
        mutation AddItem($name: String!) {
          addItem(name: $name) {
            id
            name
          }
        }
      `,
      variables: { name },
      refetchQueries: ['Items'],
    });
  }
}
