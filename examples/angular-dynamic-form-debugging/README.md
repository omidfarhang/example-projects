# Angular Dynamic Form Debugging

Companion project for [Debugging Angular: A Tale of Two Developers](https://omid.dev/2024/05/22/debugging-angular-a-tale-of-two-developers/).

**Live demo:** https://playground.omid.dev/examples/angular-dynamic-form-debugging/ (prebuilt on [playground.omid.dev](https://playground.omid.dev))

## Run

```bash
npm install
npm start
npm test
```

Toggle **Use buggy flow** to replay a form built before metadata arrives. The debug panel shows the concrete failure: metadata fields are present, but the Angular form has no matching controls. Turn it off to see the fixed path build controls and validators after metadata loads.

## Blog post

https://omid.dev/2024/05/22/debugging-angular-a-tale-of-two-developers/
