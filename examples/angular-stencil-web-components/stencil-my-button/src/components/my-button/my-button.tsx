import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-button',
  styleUrl: 'my-button.css',
  shadow: true,
})
export class MyButton {
  @Prop() text = 'Click Me';

  @Event() buttonClick: EventEmitter<void>;

  private handleClick = () => {
    this.buttonClick.emit();
  };

  render() {
    return (
      <button type="button" onClick={this.handleClick}>
        {this.text}
      </button>
    );
  }
}
