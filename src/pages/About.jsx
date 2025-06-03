export default function About() {
  return (
    <section style={{ maxWidth: 600, margin: '2rem auto', lineHeight: 1.7 }}>
      <h2>About This App</h2>
      <p>
        This simple Todo App lets you add, update, and organize your tasks
        efficiently. It uses React with Hooks and Reducer patterns for state
        management and connects to Airtable as a backend.
      </p>
      <p>
        Built as part of the Code the Dream React course, this project
        demonstrates practical use of Reducers, API integration, and React
        Router for navigation.
      </p>
      <p>
        <strong>Author:</strong> Olena Tereshchenko <br />
        <strong>Credits:</strong> Code the Dream
      </p>
    </section>
  );
}
