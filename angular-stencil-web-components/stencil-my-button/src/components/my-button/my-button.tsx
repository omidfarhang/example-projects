import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-button',
  styleUrl: 'my-button.css',
  shadow: true,
})
export class MyButton {
  @Prop() text = 'Click Me';

  render() {
    return <button type="button">{this.text}</button>;
  }
}
