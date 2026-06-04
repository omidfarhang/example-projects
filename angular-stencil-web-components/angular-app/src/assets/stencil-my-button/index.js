import { r as registerInstance, h } from './index-_YcaRUs3.js';

const myButtonCss = () => `button{background-color:#007bff;color:white;border:none;padding:10px 20px;font-size:16px;cursor:pointer;border-radius:4px}button:hover{background-color:#0056b3}`;

const MyButton = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    text = 'Click Me';
    render() {
        return h("button", { key: '6f08b81b18e149ac43deff63c6b5af4abc8bc2d5', type: "button" }, this.text);
    }
};
MyButton.style = myButtonCss();

export { MyButton };
