const { useState, useEffect } = React;


function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || {};
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function seedAdmin() {
  const users = getUsers();
  users['admin@carrental.com'] = {
    name: 'Admin',
    password: 'admin123',
    role: 'admin',
    location: {
      name: 'Syracuse Downtown Center',
      address: '120 Genesee St, Syracuse, NY 13202',
      hours: 'Daily, 7:00 AM - 9:00 PM'
      
    },
  };
  saveUsers(users);
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


const CARS = [
  { id: 'C-101', name: 'Toyota Corolla', category: 'Sedan', plate: 'JKL-4821', rate: 45 },
  { id: 'C-102', name: 'Honda Civic', category: 'Sedan', plate: 'MNP-3390', rate: 48 },
  { id: 'C-103', name: 'Ford Explorer', category: 'SUV', plate: 'RTD-7712', rate: 85 },
  { id: 'C-104', name: 'Toyota RAV4', category: 'SUV', plate: 'WQX-1054', rate: 78 },
  { id: 'C-105', name: 'Nissan Versa', category: 'Economy', plate: 'BHG-2268', rate: 32 },
  { id: 'C-106', name: 'Hyundai Accent', category: 'Economy', plate: 'FZC-9043', rate: 30 },
  { id: 'C-107', name: 'Chevrolet Tahoe', category: 'SUV', plate: 'LKS-6617', rate: 110 },
  { id: 'C-108', name: 'Tesla Model 3', category: 'Electric', plate: 'EVN-5001', rate: 95 },
];

const INITIAL_STATUS = {
  'C-101': 'Available',
  'C-102': 'Rented',
  'C-103': 'Available',
  'C-104': 'Maintenance',
  'C-105': 'Rented',
  'C-106': 'Available',
  'C-107': 'Rented',
  'C-108': 'Available',
};

const BOOKINGS = [
  { id: 'B-2001', customer: 'Maria Lopez', car: 'Honda Civic', start: 'Oct 3', end: 'Oct 7', status: 'Active' },
  { id: 'B-2002', customer: 'James Carter', car: 'Nissan Versa', start: 'Oct 2', end: 'Oct 5', status: 'Active' },
  { id: 'B-2003', customer: 'Priya Nair', car: 'Chevrolet Tahoe', start: 'Oct 4', end: 'Oct 11', status: 'Active' },
  { id: 'B-2004', customer: 'Daniel Kim', car: 'Tesla Model 3', start: 'Oct 8', end: 'Oct 10', status: 'Pending' },
  { id: 'B-2005', customer: 'Sophie Martin', car: 'Ford Explorer', start: 'Oct 9', end: 'Oct 14', status: 'Pending' },
  { id: 'B-2006', customer: 'Omar Hassan', car: 'Toyota Corolla', start: 'Sep 26', end: 'Sep 30', status: 'Completed' },
  { id: 'B-2007', customer: 'Ella Brooks', car: 'Hyundai Accent', start: 'Sep 28', end: 'Oct 1', status: 'Cancelled' },
];

const PAYMENTS = [
  { id: 'P-9001', booking: 'B-2001', customer: 'Maria Lopez', amount: 192, method: 'Credit card', status: 'Paid' },
  { id: 'P-9002', booking: 'B-2002', customer: 'James Carter', amount: 96, method: 'Debit card', status: 'Paid' },
  { id: 'P-9003', booking: 'B-2003', customer: 'Priya Nair', amount: 770, method: 'Credit card', status: 'Paid' },
  { id: 'P-9004', booking: 'B-2004', customer: 'Daniel Kim', amount: 190, method: 'PayPal', status: 'Pending' },
  { id: 'P-9005', booking: 'B-2005', customer: 'Sophie Martin', amount: 425, method: 'Credit card', status: 'Pending' },
  { id: 'P-9006', booking: 'B-2006', customer: 'Omar Hassan', amount: 180, method: 'Debit card', status: 'Paid' },
  { id: 'P-9007', booking: 'B-2007', customer: 'Ella Brooks', amount: 90, method: 'PayPal', status: 'Refunded' },
];


function Badge({ text }) {
  const cls = text.toLowerCase();
  return <span className={`badge badge-${cls}`}>{text}</span>;
}

function Table({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}


function InventoryTab() {
  return (
    <div>
      <h3 className="tab-title">Manage car inventory</h3>
      <Table headers={['ID', 'Car', 'Category', 'Plate', 'Rate / day']}>
        {CARS.map((c) => (
          <tr key={c.id}>
            <td>{c.id}</td>
            <td>{c.name}</td>
            <td>{c.category}</td>
            <td>{c.plate}</td>
            <td>${c.rate}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function AvailabilityTab() {
  const [status, setStatus] = useState(INITIAL_STATUS);

  return (
    <div>
      <h3 className="tab-title">Manage vehicle availability</h3>
      <Table headers={['ID', 'Car', 'Category', 'Status', 'Change status']}>
        {CARS.map((c) => (
          <tr key={c.id}>
            <td>{c.id}</td>
            <td>{c.name}</td>
            <td>{c.category}</td>
            <td><Badge text={status[c.id]} /></td>
            <td>
              <select
                value={status[c.id]}
                onChange={(e) => setStatus({ ...status, [c.id]: e.target.value })}
              >
                <option>Available</option>
                <option>Rented</option>
                <option>Maintenance</option>
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function BookingsTab() {
  return (
    <div>
      <h3 className="tab-title">Manage bookings</h3>
      <Table headers={['Booking', 'Customer', 'Car', 'Start', 'End', 'Status']}>
        {BOOKINGS.map((b) => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.customer}</td>
            <td>{b.car}</td>
            <td>{b.start}</td>
            <td>{b.end}</td>
            <td><Badge text={b.status} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div>
      <h3 className="tab-title">Monitor payments</h3>
      <Table headers={['Payment', 'Booking', 'Customer', 'Amount', 'Method', 'Status']}>
        {PAYMENTS.map((p) => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.booking}</td>
            <td>{p.customer}</td>
            <td>${p.amount}</td>
            <td>{p.method}</td>
            <td><Badge text={p.status} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function DashboardTab() {
  const active = BOOKINGS.filter((b) => b.status === 'Active').length;
  const pending = BOOKINGS.filter((b) => b.status === 'Pending').length;
  const revenue = PAYMENTS.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h3 className="tab-title">Admin dashboard</h3>
      <div className="stats">
        <div className="stat"><span className="stat-num">{CARS.length}</span><span className="stat-label">Total cars</span></div>
        <div className="stat"><span className="stat-num">{active}</span><span className="stat-label">Active rentals</span></div>
        <div className="stat"><span className="stat-num">{pending}</span><span className="stat-label">Pending bookings</span></div>
        <div className="stat"><span className="stat-num">${revenue}</span><span className="stat-label">Revenue collected</span></div>
      </div>
      <h4 className="sub-title">Recent bookings</h4>
      <Table headers={['Booking', 'Customer', 'Car', 'Status']}>
        {BOOKINGS.slice(0, 4).map((b) => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.customer}</td>
            <td>{b.car}</td>
            <td><Badge text={b.status} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

const TABS = [
  { id: 'inventory', label: 'Manage car inventory', component: InventoryTab },
  { id: 'availability', label: 'Manage vehicle availability', component: AvailabilityTab },
  { id: 'bookings', label: 'Manage bookings', component: BookingsTab },
  { id: 'payments', label: 'Monitor payments', component: PaymentsTab },
  { id: 'dashboard', label: 'View admin dashboard', component: DashboardTab },
];

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



function AdminDashboard({ session }) {
  const [activeTab, setActiveTab] = useState('inventory');
  const location = (getUsers()[session.email] || {}).location || {};
  const ActiveComponent = TABS.find((t) => t.id === activeTab).component;

  function handleLogout() {
    logout();
    navigate('#/');
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <p className="side-label">Your location center</p>
        <h3 className="side-title">{location.name}</h3>
        <p className="side-text">{location.address}</p>
        <p className="side-text">{location.hours}</p>
        <p className="side-text">{location.phone}</p>

        <div className="side-user">
          <p className="side-label">Signed in as</p>
          <p className="side-text">{session.name}</p>
          <p className="side-text">{session.email}</p>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      <main className="main">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ActiveComponent />
      </main>
    </div>
  );
}


function App() {
  const hash = useHash();
  const session = getSession();

  if (hash === '#/customer') {
    if (!session || session.role !== 'user') return <Redirect to="#/" />;
    return <CustomerApp session={session} />;
  }

  if (hash === '#/admin') {
    if (!session || session.role !== 'admin') return <Redirect to="#/" />;
    return <AdminDashboard session={session} />;
  }

  return <Login />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
