import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { environment } from '../environments/environment';
import { GraphqlService, Item } from './graphql.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly graphqlService = inject(GraphqlService);

  readonly isPlayground = environment.playground;

  items: Item[] = [];
  newItemName = '';
  errorMessage = '';
  statusMessage = '';
  loading = false;
  adding = false;
  updating = false;
  deletingId: string | null = null;
  editingId: string | null = null;
  editingName = '';

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.graphqlService.getItems().subscribe({
      next: (result) => {
        this.items = result.data?.items ?? [];
        this.errorMessage = '';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.isPlayground
          ? 'Could not load items. The in-browser GraphQL mock failed.'
          : 'Could not reach GraphQL server. Start it with: cd server && npm start';
        this.loading = false;
      },
    });
  }

  addItem(): void {
    const name = this.newItemName.trim();
    if (!name || this.adding) {
      return;
    }

    this.adding = true;
    this.clearStatus();
    this.graphqlService.addItem(name).subscribe({
      next: () => {
        this.newItemName = '';
        this.statusMessage = `Added ${name}.`;
        this.adding = false;
        this.loadItems();
      },
      error: () => this.onMutationError('add', () => {
        this.adding = false;
      }),
    });
  }

  startEdit(item: Item): void {
    this.editingId = item.id;
    this.editingName = item.name;
    this.clearStatus();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingName = '';
  }

  saveEdit(): void {
    const id = this.editingId;
    const name = this.editingName.trim();
    if (!id || !name || this.updating) {
      return;
    }

    this.updating = true;
    this.clearStatus();
    this.graphqlService.updateItem(id, name).subscribe({
      next: () => {
        this.statusMessage = `Updated item #${id} to ${name}.`;
        this.updating = false;
        this.cancelEdit();
        this.loadItems();
      },
      error: () => this.onMutationError('update', () => {
        this.updating = false;
      }),
    });
  }

  deleteItem(item: Item): void {
    if (this.deletingId || this.editingId) {
      return;
    }

    this.deletingId = item.id;
    this.clearStatus();
    this.graphqlService.deleteItem(item.id).subscribe({
      next: () => {
        this.statusMessage = `Deleted ${item.name}.`;
        this.deletingId = null;
        if (this.editingId === item.id) {
          this.cancelEdit();
        }
        this.loadItems();
      },
      error: () => this.onMutationError('delete', () => {
        this.deletingId = null;
      }),
    });
  }

  private clearStatus(): void {
    this.statusMessage = '';
    this.errorMessage = '';
  }

  private onMutationError(action: string, reset: () => void): void {
    this.errorMessage = this.isPlayground
      ? `Could not ${action} item against the in-browser GraphQL mock.`
      : `Could not ${action} item. Is the GraphQL server running?`;
    reset();
  }
}
