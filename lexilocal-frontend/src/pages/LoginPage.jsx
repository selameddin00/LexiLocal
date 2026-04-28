import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F9FAFB',
    padding: '16px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    color: '#1E3A5F',
    fontSize: '22px',
    fontWeight: 700,
    marginBottom: '24px',
    lineHeight: '1.3',
  },
  fieldset: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1F2937',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px 32px',
    background: '#1E3A5F',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hover, setHover] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('auth_token', 'mock_token_xyz');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Disleksi Karar Destek Sistemi</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.fieldset}>
            <label style={styles.label}>
              Kullanıcı Adı
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Şifre
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </label>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: hover ? 0.9 : 1,
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
