

const CENTERS = [
  { name: 'Syracuse Downtown Center', address: '120 Genesee St, Syracuse, NY 13202', hours: 'Daily, 7:00 AM - 9:00 PM', lat: 43.0481, lng: -76.1474 },
  { name: 'Syracuse Airport Center', address: '1000 Col Eileen Collins Blvd, Syracuse, NY 13212', hours: 'Daily, 5:00 AM - 11:00 PM', lat: 43.1112, lng: -76.1063 },
  { name: 'Destiny USA Center', address: '9090 Destiny USA Dr, Syracuse, NY 13204', hours: 'Daily, 9:00 AM - 8:00 PM', lat: 43.0698, lng: -76.1675 },
  { name: 'Fayetteville Center', address: '400 E Genesee St, Fayetteville, NY 13066', hours: 'Mon-Sat, 8:00 AM - 6:00 PM', lat: 43.0298, lng: -75.9707 },
];

function distKm(a, b) {
  const r = (d) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

const getBookings = () => JSON.parse(localStorage.getItem('bookings')) || [];
const saveBookings = (b) => localStorage.setItem('bookings', JSON.stringify(b));
const todayStr = () => new Date().toISOString().slice(0, 10);
const dayCount = (s, e) => Math.max(1, Math.round((new Date(e) - new Date(s)) / 864e5));
const carById = (id) => CARS.find((c) => c.id === id);

function isFree(carId, s, e, ignoreId) {
  if (INITIAL_STATUS[carId] === 'Maintenance') return false;
  return !getBookings().some((b) => b.carId === carId && b.id !== ignoreId && b.status !== 'Cancelled' && s < b.end && b.start < e);
}

function validDates(s, e) {
  if (!s || !e) return 'Choose pickup and return dates.';
  if (s < todayStr()) return 'Pickup date cannot be in the past.';
  if (e <= s) return 'Return date must be after pickup.';
  return null;
}

function CarCard({ car, onOpen }) {
  return (
    <div className="car-card">
      <h4>{car.name}</h4>
      <p className="side-text">{car.category}</p>
      <p>${car.rate} / day</p>
      <button onClick={() => onOpen(car)}>View details</button>
    </div>
  );
}

function BrowsePage({ onOpen }) {
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('All');
  const [maxRate, setMaxRate] = React.useState('');
  const [s, setS] = React.useState('');
  const [e, setE] = React.useState('');
  const cats = ['All', ...new Set(CARS.map((c) => c.category))];
  const datesOk = s && e && !validDates(s, e);

  const list = CARS.filter((c) =>
    (cat === 'All' || c.category === cat) &&
    c.name.toLowerCase().includes(q.toLowerCase()) &&
    (!maxRate || c.rate <= Number(maxRate)) &&
    (!datesOk || isFree(c.id, s, e))
  );

  return (
    <div>
      <div className="filters">
        <input placeholder="Search cars..." value={q} onChange={(x) => setQ(x.target.value)} />
        <input type="number" placeholder="Max $/day" value={maxRate} onChange={(x) => setMaxRate(x.target.value)} />
        <input type="date" min={todayStr()} value={s} onChange={(x) => setS(x.target.value)} />
        <input type="date" min={s || todayStr()} value={e} onChange={(x) => setE(x.target.value)} />
      </div>
      <select value={cat} onChange={(x) => setCat(x.target.value)}>
        {cats.map((c) => <option key={c}>{c}</option>)}
      </select>
      {list.length === 0 ? <p className="side-text">No cars match your filters.</p> : (
        <div className="car-grid">{list.map((c) => <CarCard key={c.id} car={c} onOpen={onOpen} />)}</div>
      )}
    </div>
  );
}

function DetailsPage({ car, center, onBack, onBook }) {
  const status = INITIAL_STATUS[car.id];
  return (
    <div>
      <a className="back" onClick={onBack}>← Back to cars</a>
      <h3 className="tab-title">{car.name}</h3>
      <Table headers={['Category', 'Plate', 'Rate / day', 'Pickup center', 'Status']}>
        <tr><td>{car.category}</td><td>{car.plate}</td><td>${car.rate}</td><td>{center.name}</td><td><Badge text={status === 'Maintenance' ? 'Maintenance' : 'Available'} /></td></tr>
      </Table>
      <button style={{ maxWidth: 220 }} disabled={status === 'Maintenance'} onClick={onBook}>Book this car</button>
    </div>
  );
}

function BookPage({ car, center, onBack, onNext }) {
  const [s, setS] = React.useState('');
  const [e, setE] = React.useState('');
  const [err, setErr] = React.useState(null);
  const total = s && e && e > s ? dayCount(s, e) * car.rate : 0;

  function next() {
    const v = validDates(s, e) || (!isFree(car.id, s, e) && 'This car is not available for those dates.');
    if (v) return setErr(v);
    onNext({ start: s, end: e, total });
  }

  return (
    <div className="narrow">
      <a className="back" onClick={onBack}>← Back</a>
      <h3 className="tab-title">Book {car.name}</h3>
      <p className="side-text">Pickup & return at {center.name}</p>
      <div className="form-group"><label>Pickup date</label><input type="date" min={todayStr()} value={s} onChange={(x) => setS(x.target.value)} /></div>
      <div className="form-group"><label>Return date</label><input type="date" min={s || todayStr()} value={e} onChange={(x) => setE(x.target.value)} /></div>
      {total > 0 && <p>{dayCount(s, e)} day(s) × ${car.rate} = <b>${total}</b></p>}
      {err && <div className="message error">{err}</div>}
      <button onClick={next}>Continue to payment</button>
    </div>
  );
}

function PayPage({ car, center, draft, session, onBack, onDone }) {
  const [f, setF] = React.useState({ name: '', number: '', exp: '', cvc: '' });
  const [err, setErr] = React.useState(null);
  const set = (k) => (x) => setF({ ...f, [k]: x.target.value });

  function pay(x) {
    x.preventDefault();
    const digits = f.number.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) return setErr('Enter a 16-digit card number.');
    if (!/^\d{3,4}$/.test(f.cvc)) return setErr('Enter a valid CVC.');
    if (!isFree(car.id, draft.start, draft.end)) return setErr('Sorry, this car was just booked for those dates.');
    const booking = {
      id: 'B-' + Date.now().toString().slice(-6), email: session.email, carId: car.id, center: center.name,
      start: draft.start, end: draft.end, total: draft.total, status: 'Confirmed', card: digits.slice(-4), refund: 0,
    };
    saveBookings([...getBookings(), booking]); /* only last 4 digits are kept */
    onDone(booking);
  }

  return (
    <form className="narrow" onSubmit={pay}>
      <a className="back" onClick={onBack}>← Back</a>
      <h3 className="tab-title">Payment</h3>
      <p className="side-text">{car.name}, {draft.start} to {draft.end}</p>
      <p>Total due: <b>${draft.total}</b></p>
      <div className="form-group"><label>Name on card</label><input required value={f.name} onChange={set('name')} /></div>
      <div className="form-group"><label>Card number</label><input required inputMode="numeric" placeholder="1234 5678 9012 3456" value={f.number} onChange={set('number')} /></div>
      <div className="form-group"><label>Expiry (MM/YY)</label><input required placeholder="MM/YY" value={f.exp} onChange={set('exp')} /></div>
      <div className="form-group"><label>CVC</label><input required inputMode="numeric" value={f.cvc} onChange={set('cvc')} /></div>
      {err && <div className="message error">{err}</div>}
      <button type="submit">Pay ${draft.total}</button>
      <p className="side-text">Prototype only: no real payment is processed.</p>
    </form>
  );
}

function MyBookings({ session, onChange }) {
  const [, force] = React.useState(0);
  const [editId, setEditId] = React.useState(null);
  const [d, setD] = React.useState({ s: '', e: '' });
  const [msg, setMsg] = React.useState(null);
  const mine = getBookings().filter((b) => b.email === session.email).reverse();

  const update = (id, patch) => { saveBookings(getBookings().map((b) => (b.id === id ? { ...b, ...patch } : b))); force((n) => n + 1); };

  function cancel(b) {
    if (!window.confirm('Cancel this booking? Your payment will be refunded.')) return;
    update(b.id, { status: 'Cancelled', refund: b.total });
    setMsg({ text: `Booking ${b.id} cancelled. $${b.total} will be refunded to the card ending ${b.card}.`, success: true });
  }

  function saveEdit(b) {
    const v = validDates(d.s, d.e) || (!isFree(b.carId, d.s, d.e, b.id) && 'Car not available for those dates.');
    if (v) return setMsg({ text: v, success: false });
    const total = dayCount(d.s, d.e) * carById(b.carId).rate;
    const diff = total - b.total;
    update(b.id, { start: d.s, end: d.e, total });
    setEditId(null);
    setMsg({ text: diff === 0 ? 'Booking updated.' : diff > 0 ? `Booking updated. Additional $${diff} will be charged to the card ending ${b.card}.` : `Booking updated. $${-diff} will be refunded.`, success: true });
  }

  if (!mine.length) return <p className="side-text">You have no bookings yet.</p>;
  return (
    <div>
      {msg && <div className={`message ${msg.success ? 'success' : 'error'}`}>{msg.text}</div>}
      <Table headers={['Booking', 'Car', 'Dates', 'Total', 'Status', 'Actions']}>
        {mine.map((b) => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{carById(b.carId).name}</td>
            <td>
              {editId === b.id ? (
                <span className="inline-dates">
                  <input type="date" min={todayStr()} value={d.s} onChange={(x) => setD({ ...d, s: x.target.value })} />
                  <input type="date" min={d.s || todayStr()} value={d.e} onChange={(x) => setD({ ...d, e: x.target.value })} />
                </span>
              ) : `${b.start} to ${b.end}`}
            </td>
            <td>${b.total}</td>
            <td><Badge text={b.status} /></td>
            <td>
              {b.status === 'Confirmed' && (editId === b.id ? (
                <span className="row-actions"><button onClick={() => saveEdit(b)}>Save</button><button className="logout-btn" onClick={() => setEditId(null)}>Discard</button></span>
              ) : (
                <span className="row-actions"><button onClick={() => { setEditId(b.id); setD({ s: b.start, e: b.end }); setMsg(null); }}>Modify</button><button className="logout-btn" onClick={() => cancel(b)}>Cancel</button></span>
              ))}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function CustomerApp({ session }) {
  const [center, setCenter] = React.useState(CENTERS[0]);
  const [located, setLocated] = React.useState(false);
  const [tab, setTab] = React.useState('browse');
  const [page, setPage] = React.useState('list'); /* list | details | book | pay | done */
  const [car, setCar] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [done, setDone] = React.useState(null);

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => {
      const me = { lat: p.coords.latitude, lng: p.coords.longitude };
      setCenter([...CENTERS].sort((a, b) => distKm(me, a) - distKm(me, b))[0]);
      setLocated(true);
    });
  }, []);

  const goTab = (t) => { setTab(t); setPage('list'); };

  let body;
  if (tab === 'bookings') body = <MyBookings session={session} />;
  else if (page === 'details') body = <DetailsPage car={car} center={center} onBack={() => setPage('list')} onBook={() => setPage('book')} />;
  else if (page === 'book') body = <BookPage car={car} center={center} onBack={() => setPage('details')} onNext={(x) => { setDraft(x); setPage('pay'); }} />;
  else if (page === 'pay') body = <PayPage car={car} center={center} draft={draft} session={session} onBack={() => setPage('book')} onDone={(b) => { setDone(b); setPage('done'); }} />;
  else if (page === 'done') body = (
    <div className="narrow">
      <div className="message success">Booking {done.id} confirmed! You can modify or cancel it under My bookings.</div>
      <button onClick={() => goTab('bookings')}>Go to my bookings</button>
    </div>
  );
  else body = <BrowsePage onOpen={(c) => { setCar(c); setPage('details'); }} />;

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <p className="side-label">{located ? 'Closest center to you' : 'Your pickup center'}</p>
        <h3 className="side-title">{center.name}</h3>
        <p className="side-text">{center.address}</p>
        <p className="side-text">{center.hours}</p>
        <p className="side-text">{center.phone}</p>
        <select value={center.name} onChange={(x) => setCenter(CENTERS.find((c) => c.name === x.target.value))} style={{ marginTop: 10 }}>
          {CENTERS.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
        <div className="side-user">
          <p className="side-label">Signed in as</p>
          <p className="side-text">{session.name}</p>
          <button className="logout-btn" onClick={() => { logout(); navigate('#/'); }}>Log Out</button>
        </div>
      </aside>
      <main className="main">
        <div className="tabs">
          <button className={`tab-btn ${tab === 'browse' ? 'active' : ''}`} onClick={() => goTab('browse')}>Search & browse cars</button>
          <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => goTab('bookings')}>My bookings</button>
        </div>
        {body}
      </main>
    </div>
  );
}
