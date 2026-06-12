import { UpperCasePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { User, UsersApiService } from './users-api.service';

@Component({
    selector: 'app-root',
    imports: [FormsModule, UpperCasePipe],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly api = inject(UsersApiService);

  mode: 'rest' | 'graphql' = 'rest';
  users: User[] = [];
  name = '';
  email = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.mode === 'rest') {
      this.api.getUsersRest().subscribe({
        next: (users) => {
          this.users = users;
          this.errorMessage = '';
        },
        error: () => (this.errorMessage = 'REST request failed. Start the server first.'),
      });
      return;
    }

    this.api.getUsersGraphql().subscribe({
      next: (result) => {
        this.users = result.data?.users ?? [];
        this.errorMessage = '';
      },
      error: () => (this.errorMessage = 'GraphQL request failed. Start the server first.'),
    });
  }

  switchMode(mode: 'rest' | 'graphql'): void {
    this.mode = mode;
    this.loadUsers();
  }

  addUser(): void {
    const name = this.name.trim();
    const email = this.email.trim();
    if (!name || !email) return;

    const onDone = () => {
      this.name = '';
      this.email = '';
      this.loadUsers();
    };

    if (this.mode === 'rest') {
      this.api.createUserRest(name, email).subscribe({ next: onDone });
      return;
    }

    this.api.createUserGraphql(name, email).subscribe({ next: onDone });
  }
}
