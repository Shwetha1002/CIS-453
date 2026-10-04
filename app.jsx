const { useState, useEffect } = React;

/* ---------- auth (prototype only, localStorage) ---------- */
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || {};
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function seedAdmin() {
  const users = getUsers();
  if (!users['admin@carrental.com']) {
    users['admin@carrental.com'] = { name: 'Admin', password: 'admin123', role: 'admin' };
    saveUsers(users);
  }
}

function register(name, email, password) {
  const users = getUsers();
  const key = email.trim().toLowerCase();
  if (users[key]) return { ok: false, error: 'An account with this email already exists.' };
  users[key] = { name: name.trim(), password, role: 'user' };
  saveUsers(users);
  return { ok: true };
}

function login(email, password, role) {
  const key = email.trim().toLowerCase();
  const user = getUsers()[key];
  if (user && user.password === password && user.role === role) {
    const session = { email: key, name: user.name, role: user.role };
    localStorage.setItem('session', JSON.stringify(session));
    return { ok: true, session };
  }
  return { ok: false, error: 'Invalid email or password for this account type.' };
}

function getSession() {
  return JSON.parse(localStorage.getItem('session'));
}

function logout() {
  localStorage.removeItem('session');
}

seedAdmin();

/* ---------- tiny hash router ---------- */
function navigate(path) {
  window.location.hash = path;
}

function useHash() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function Redirect({ to }) {
  useEffect(() => {
    navigate(to);
  }, []);
  return null;
}

/* ---------- pages ---------- */
function Login() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  function switchMode(next) {
    setMode(next);
    setMessage(null);
  }

  function switchRole(next) {
    setRole(next);
    setMessage(null);
  }

  function handleLogin(e) {
    e.preventDefault();
    const result = login(loginForm.email, loginForm.password, role);
    if (result.ok) {
      navigate(result.session.role === 'admin' ? '#/admin' : '#/customer');
    } else {
      setMessage({ text: result.error, success: false });
    }
  }

  function handleSignup(e) {
    e.preventDefault();
    const result = register(signupForm.name, signupForm.email, signupForm.password);
    if (!result.ok) {
      setMessage({ text: result.error, success: false });
      return;
    }
    setMessage({ text: 'Account created successfully! Switching to login...', success: true });
    setSignupForm({ name: '', email: '', password: '' });
    setTimeout(() => switchMode('login'), 2000);
  }

  return (
    <div className="container">
      {mode === 'login' ? (
        <div>
          <h2>Login</h2>

          <div className="role-switch">
            <button
              type="button"
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => switchRole('user')}
            >
              Customer
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => switchRole('admin')}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <button type="submit">
              {role === 'admin' ? 'Sign In as Admin' : 'Sign In as Customer'}
            </button>
          </form>

          {role === 'user' && (
            <p className="toggle-text">
              Don't have an account? <a onClick={() => switchMode('signup')}>Sign Up</a>
            </p>
          )}
        </div>
      ) : (
        <div>
          <h2>Create Account</h2>
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="Create password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
              />
            </div>
            <button type="submit">Register</button>
          </form>
          <p className="toggle-text">
            Already have an account? <a onClick={() => switchMode('login')}>Login</a>
          </p>
        </div>
      )}

      {message && (
        <div className={`message ${message.success ? 'success' : 'error'}`}>{message.text}</div>
      )}
    </div>
  );
}

function CustomerDashboard({ session }) {
  function handleLogout() {
    logout();
    navigate('#/');
  }

  return (
    <div className="container dashboard">
      <h2>Welcome, {session.name}</h2>
      <p>Browse available cars, book a rental, and view your booking history here.</p>
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
}

function AdminDashboard({ session }) {
  function handleLogout() {
    logout();
    navigate('#/');
  }

  return (
    <div className="container dashboard">
      <h2>Admin Dashboard - {session.name}</h2>
      <p>Manage the car inventory, vehicle availability, bookings, and payments here.</p>
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
}

/* ---------- app / routing with role guards ---------- */
function App() {
  const hash = useHash();
  const session = getSession();

  if (hash === '#/customer') {
    if (!session || session.role !== 'user') return <Redirect to="#/" />;
    return <CustomerDashboard session={session} />;
  }

  if (hash === '#/admin') {
    if (!session || session.role !== 'admin') return <Redirect to="#/" />;
    return <AdminDashboard session={session} />;
  }

  return <Login />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
