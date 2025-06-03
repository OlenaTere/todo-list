import { Link } from 'react-router';

export default function NotFound() {
  return (
    <section style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h2>Page Not Found</h2>
      <p>The page you are looking for Does Not Exist.</p>
      <Link to="/" style={{ color: '#8d6e63', textDecoration: 'underline' }}>
        Go back Home
      </Link>
    </section>
  );
}
