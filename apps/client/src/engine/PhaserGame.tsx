import Phaser from 'phaser';
import { useEffect, useRef } from 'react';

import { BootScene } from './scenes/boot.scene';
import { RoomScene } from './scenes/room.scene';

/**
 * Bridge React ↔ Phaser. The Phaser instance lives outside React's render cycle;
 * communicate with it via Zustand stores or a Phaser event emitter.
 */
export const PhaserGame = (): JSX.Element => {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: '#0b1020',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      pixelArt: true,
      scene: [BootScene, RoomScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={hostRef} className="phaser-canvas-host" data-testid="phaser-host" />;
};
