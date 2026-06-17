export function ReactMicroFrontend({ message }) {
  const sendMessage = () => {
    window.dispatchEvent(
      new CustomEvent('microfrontend:message', {
        detail: {
          source: 'React',
          message: 'React updated the shell through a DOM event',
        },
      }),
    );
  };

  return (
    <section className="micro-card react-card">
      <p className="eyebrow">React micro frontend</p>
      <h2>Hello from React</h2>
      <p className="lede">
        The Qwik shell passed this message through a custom element attribute:
      </p>
      <div className="message-box">{message || 'No message yet'}</div>
      <button type="button" onClick={sendMessage}>
        Send message to shell
      </button>
    </section>
  );
}
