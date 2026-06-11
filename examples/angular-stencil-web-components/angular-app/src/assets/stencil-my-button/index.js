import { r as registerInstance, c as createEvent, h } from './index-CAYeuYwY.js';

const myButtonCss = () => `button{background-color:#007bff;color:white;border:none;padding:10px 20px;font-size:16px;cursor:pointer;border-radius:4px}button:hover{background-color:#0056b3}`;

const MyButton = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.buttonClick = createEvent(this, "buttonClick");
    }
    text = 'Click Me';
    buttonClick;
    handleClick = () => {
        this.buttonClick.emit();
    };
    render() {
        return (h("button", { key: '88b378f48ad25e71baa81aacde5d37e89cb0236f', type: "button", onClick: this.handleClick }, this.text));
    }
};
MyButton.style = myButtonCss();

export { MyButton };
