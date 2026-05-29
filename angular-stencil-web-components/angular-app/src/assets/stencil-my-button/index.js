import { r as registerInstance, h } from './index-_YcaRUs3.js';

const myButtonCss = () => `button{background-color:#007bff;color:white;border:none;padding:10px 20px;font-size:16px;cursor:pointer;border-radius:4px}button:hover{background-color:#0056b3}`;

const MyButton = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    text = 'Click Me';
    render() {
        return h("button", { key: 'acc9df5d34ec4770c476142cfa0fcd7ac524fcf1', type: "button" }, this.text);
    }
};
MyButton.style = myButtonCss();

export { MyButton };
