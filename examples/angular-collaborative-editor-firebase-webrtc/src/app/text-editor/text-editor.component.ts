import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';
import { WebrtcService } from '../webrtc.service';

interface CollaborativeDocument {
  content: string;
}

@Component({
    selector: 'app-text-editor',
    imports: [ReactiveFormsModule],
    templateUrl: './text-editor.component.html',
    styleUrl: './text-editor.component.css'
})
export class TextEditorComponent implements OnInit, OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly webrtcService = inject(WebrtcService);

  editorControl = new FormControl('', { nonNullable: true });
  docId = 'collaborative-doc';
  statusMessage = 'Connecting...';

  private subscriptions = new Subscription();
  private localUpdate = false;

  ngOnInit(): void {
    void this.authService.signInAnonymously().then(() => {
      this.statusMessage = 'Signed in anonymously';
      this.setupFirestoreSync();
      this.setupWebRtcPlaceholder();
    }).catch(() => {
      this.statusMessage = 'Firebase auth failed. Check environment.ts and enable Anonymous Auth.';
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupFirestoreSync(): void {
    const documentRef = doc(this.firestore, 'documents', this.docId);

    this.subscriptions.add(
      docData(documentRef).subscribe((document) => {
        const content = (document as CollaborativeDocument | undefined)?.content ?? '';
        this.localUpdate = true;
        this.editorControl.setValue(content, { emitEvent: false });
        this.localUpdate = false;
      }),
    );

    this.subscriptions.add(
      this.editorControl.valueChanges.subscribe((content) => {
        if (this.localUpdate) {
          return;
        }
        void setDoc(documentRef, { content }, { merge: true });
      }),
    );
  }

  private setupWebRtcPlaceholder(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe((user) => {
        if (!user) {
          return;
        }

        const peer = this.webrtcService.createPeer(true, undefined, (signal) => {
          const signalRef = doc(this.firestore, 'signals', user.uid);
          void setDoc(signalRef, { signal, updatedAt: Date.now() }, { merge: true });
        });

        const signalRef = doc(this.firestore, 'signals', user.uid);
        this.subscriptions.add(
          docData(signalRef).subscribe((payload) => {
            const signal = (payload as { signal?: unknown } | undefined)?.signal;
            if (signal) {
              this.webrtcService.connectPeer(peer, signal);
            }
          }),
        );
      }),
    );
  }
}
