import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly apollo = inject(Apollo);
  private readonly baseUrl = 'http://localhost:4000';

  getUsersRest() {
    return this.http.get<User[]>(`${this.baseUrl}/api/users`);
  }

  createUserRest(name: string, email: string) {
    return this.http.post<User>(`${this.baseUrl}/api/users`, { name, email });
  }

  getUsersGraphql() {
    return this.apollo.query<{ users: User[] }>({
      query: gql`
        query Users {
          users {
            id
            name
            email
          }
        }
      `,
    });
  }

  createUserGraphql(name: string, email: string) {
    return this.apollo.mutate<{ createUser: User }>({
      mutation: gql`
        mutation CreateUser($name: String!, $email: String!) {
          createUser(name: $name, email: $email) {
            id
            name
            email
          }
        }
      `,
      variables: { name, email },
      refetchQueries: ['Users'],
    });
  }
}
