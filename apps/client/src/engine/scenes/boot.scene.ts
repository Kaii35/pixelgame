import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  override create(): void {
    this.scene.start('Room');
  }
}
