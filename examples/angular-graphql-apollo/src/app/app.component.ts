import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GraphqlService, Item } from './graphql.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly graphqlService = inject(GraphqlService);

  items: Item[] = [];
  newItemName = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.graphqlService.getItems().subscribe({
      next: (result) => {
        this.items = result.data?.items ?? [];
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Could not reach GraphQL server. Start it with: cd server && npm start';
      },
    });
  }

  addItem(): void {
    const name = this.newItemName.trim();
    if (!name) {
      return;
    }

    this.graphqlService.addItem(name).subscribe({
      next: () => {
        this.newItemName = '';
        this.loadItems();
      },
      error: () => {
        this.errorMessage = 'Mutation failed. Is the GraphQL server running?';
      },
    });
  }
}
