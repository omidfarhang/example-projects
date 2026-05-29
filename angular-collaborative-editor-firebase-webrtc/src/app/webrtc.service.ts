import { Injectable } from '@angular/core';
import Peer from 'simple-peer';

@Injectable({
  providedIn: 'root',
})
export class WebrtcService {
  createPeer(
    isInitiator: boolean,
    stream: MediaStream | undefined,
    signalCallback: (data: unknown) => void,
  ): Peer.Instance {
    const peer = new Peer({
      initiator: isInitiator,
      stream,
      trickle: false,
    });

    peer.on('signal', signalCallback);
    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    return peer;
  }

  connectPeer(peer: Peer.Instance, signal: unknown): void {
    peer.signal(signal as Peer.SignalData);
  }
}
