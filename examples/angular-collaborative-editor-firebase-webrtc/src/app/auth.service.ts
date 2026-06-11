import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInAnonymously, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  readonly user$: Observable<User | null> = authState(this.auth);

  signInAnonymously(): Promise<void> {
    return signInAnonymously(this.auth).then(() => undefined);
  }
}
