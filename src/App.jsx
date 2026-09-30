import React from 'react';
import {
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  Navigate,
  useLocation
} from 'react-router-dom';

import {
  Heart,
  Share2,
  Search,
  Menu,
  X,
  ArrowRight,
  Phone,
  MessageCircle,
  CalendarDays,
  MapPin,
  Clock3,
  Check,
  LayoutDashboard,
  Images,
  Package,
  Inbox,
  Users,
  Settings,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Upload,
  ChevronLeft
} from 'lucide-react';

import { defaultEvents, defaultThemes } from './data';
import { supabase, supabaseConfigured } from './lib/supabase';


/* =========================================================
   HELPERS
========================================================= */

const money = n =>
  `₹${Number(n || 0).toLocaleString('en-IN')}`;

const readLocal = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));


/* =========================================================
   HEADER
========================================================= */

function Header({ admin = false }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className={admin ? 'header admin-header' : 'header'}>
      <div className="container nav">

        <Link to={admin ? '/admin' : '/'} className="brand">
  <span className="logo">
    <img src="https://cdn.phototourl.com/member/2026-09-30-1be61a56-3c2a-435f-9487-b369f39726ce.jpg" alt="Righ Events" />
  </span>

  <div>
    Righ Events
    <small>{admin ? 'Admin Panel' : 'WE CREATE - YOU CELEBRATE !! '}</small>
  </div>
</Link>

        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? 'navlinks open' : 'navlinks'}>

          {admin ? (
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/themes">Themes</Link>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/events">Events</Link>
              <Link to="/themes">Themes</Link>
              <Link to="/gallery">Gallery</Link>
              <a href="/#about">About</a>
              <a href="/#contact">Contact</a>
            </>
          )}

        </nav>

        {!admin && (
          <Link
            to="/enquiry"
            className="btn btn-primary top-quote"
          >
            Get a Quote
          </Link>
        )}

      </div>
    </header>
  );
}


/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer>
      <div className="container footer">

        <div>
          <div className="brand">
  <span className="logo">
    <img src="https://cdn.phototourl.com/member/2026-09-30-1be61a56-3c2a-435f-9487-b369f39726ce.jpg" alt="Righ Events" />
  </span>

  <div>
    Righ Events
    <small>WE CREATE - YOU CELEBRATE !!</small>
  </div>
</div>

          <p>
            Opposite Post Office, Market street,
            Akkpedianera, Dharmavaram,
            Andhra Pradesh 515671, India.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/events">Events</Link>
          <Link to="/themes">Themes</Link>
          <Link to="/gallery">Gallery</Link>
        </div>

        <div>
          <h4>Contact</h4>

          <a href="tel:+919346080840">
            +91 93460 80480
          </a>


          <a href="https://wa.me/919346080480">
            WhatsApp
          </a>
          <a href="https://www.instagram.com/righevents?stkn=YzJ1aW1iZ29vcjJ1">
            INSTAGRAM
          </a>

          <a href="mailto:rgeventdecors@gmail.com">
            rgeventdecors@gmail.com
          </a>
        </div>

      </div>

      <div className="copyright">
        © 2026 Righ Events. All rights reserved.
      </div>
    </footer>
  );
}


/* =========================================================
   CATALOG
========================================================= */

function useCatalog() {

  const [events, setEvents] = React.useState(() =>
    readLocal('righ_events', defaultEvents)
  );

  const [themes, setThemes] = React.useState(() =>
    readLocal('righ_themes', defaultThemes)
  );


  /* -----------------------------------------
     LOCAL MODE
  ----------------------------------------- */

  React.useEffect(() => {

    if (!supabaseConfigured) {

      writeLocal(
        'righ_events',
        events
      );

      writeLocal(
        'righ_themes',
        themes
      );

    }

  }, [events, themes]);


  /* -----------------------------------------
     SUPABASE MODE
  ----------------------------------------- */

  React.useEffect(() => {

    let cancelled = false;

    async function loadCatalog() {

      if (!supabaseConfigured) {
        return;
      }

      try {

        const [
          eventsResult,
          themesResult
        ] = await Promise.all([

          supabase
            .from('events')
            .select('*')
            .eq('active', true)
            .order('name'),

          supabase
            .from('themes')
            .select(`
              *,
              theme_images (
                url,
                sort_order
              )
            `)
            .eq('active', true)
            .order('created_at', {
              ascending: false
            })

        ]);


        if (cancelled) {
          return;
        }


        /* EVENTS */

        if (eventsResult.error) {

          console.error(
            'EVENT LOAD ERROR:',
            eventsResult.error
          );

        } else if (eventsResult.data?.length) {

          setEvents(eventsResult.data);

        }


        /* THEMES */

        if (themesResult.error) {

          console.error(
            'THEME LOAD ERROR:',
            themesResult.error
          );

          return;
        }


        if (themesResult.data) {

          const formattedThemes =
            themesResult.data.map(theme => {

              const sortedImages =
                (theme.theme_images || [])
                  .slice()
                  .sort(
                    (a, b) =>
                      (a.sort_order || 0) -
                      (b.sort_order || 0)
                  )
                  .map(image => image.url);


              return {
                ...theme,

                /*
                  Use database image_url first.
                  If empty, use first uploaded image.
                */
                image_url:
                  theme.image_url ||
                  sortedImages[0] ||
                  '',

                images: sortedImages
              };

            });


          setThemes(formattedThemes);

        }

      } catch (error) {

        console.error(
          'CATALOG LOAD ERROR:',
          error
        );

      }

    }


    loadCatalog();


    return () => {
      cancelled = true;
    };

  }, []);


  return {
    events,
    themes,
    setEvents,
    setThemes
  };

}


/* =========================================================
   HOME
========================================================= */

function Home() {

  const {
    events,
    themes
  } = useCatalog();

  return (
    <>
      <Header />

      <main>

        <section className="hero">

          <div className="hero-overlay" />

          <div className="container hero-content">

            <p className="eyebrow">
              RIGH EVENTS • EVENTS & DECORATIONS
            </p>

            <h1>
              WE CREATE 
              <br />
              <em>YOU CELEBRATE !!</em>
            </h1>

            <p>
              Choose your event, explore our decoration
              themes and find the perfect setup for your
              celebration.
            </p>

            <div className="actions">

              <Link
                to="/events"
                className="btn btn-primary"
              >
                Choose Your Event
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/enquiry"
                className="btn btn-light"
              >
                Get a Quote
              </Link>

            </div>

          </div>

        </section>


        <section className="trust">

          <div>✦ Creative Designs</div>
          <div>◈ Multiple Themes</div>
          <div>◉ Transparent Pricing</div>
          <div>♧ Professional Team</div>

        </section>


        <section className="section container">

          <SectionTitle
            title="Choose Your Event"
            sub="Select an event to explore its decoration themes"
          />

          <div className="event-grid">

            {events
              .slice(0, 6)
              .map(event => (
                <EventCard
                  key={event.id}
                  e={event}
                />
              ))}

          </div>

          <div className="center">

            <Link
              to="/events"
              className="text-link"
            >
              View all events
              <ArrowRight size={16} />
            </Link>

          </div>

        </section>


        <section className="dark-banner">

          <div className="container dark-inner">

            <div>

              <p className="eyebrow">
                YOUR VISION, OUR CREATION
              </p>

              <h2>
                One Event. Multiple Themes.
                <br />
                Choose What You Love.
              </h2>

            </div>

            <Link
              to="/events"
              className="btn btn-light"
            >
              Explore Events
            </Link>

          </div>

        </section>


        <section className="section container">

          <SectionTitle
            title="Popular Themes"
            sub="A few of our favourite decoration styles"
          />

          <div className="theme-grid">

            {themes
              .slice(0, 6)
              .map(theme => (
                <ThemeCard
                  key={theme.id}
                  t={theme}
                  events={events}
                />
              ))}

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}


/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ title, sub }) {

  return (
    <div className="section-title">

      <h2>{title}</h2>

      <p>{sub}</p>

    </div>
  );
}


/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({ e }) {

  const {
    themes
  } = useCatalog();

  const count =
    themes.filter(
      theme => theme.event_id === e.id
    ).length;

  return (
    <Link
      className="event-card"
      to={`/events/${e.id}`}
    >

      <img
        src={e.image}
        alt={e.name}
      />

      <div>

        <h3>
          {e.icon} {e.name}
        </h3>

        <p>
          {count} Themes Available
        </p>

      </div>

    </Link>
  );
}


/* =========================================================
   THEME CARD
========================================================= */

function ThemeCard({ t, events }) {

  const event =
    events?.find(
      e => e.id === t.event_id
    );

  return (
    <div className="theme-card">

      <Link
        to={`/themes/${t.id}`}
        className="theme-image"
      >

        {t.image_url ? (
          <img
            src={t.image_url}
            alt={t.name}
          />
        ) : (
          <div className="empty-image">
            No Image
          </div>
        )}

        <span className="badge">
          {t.tag || event?.name}
        </span>

      </Link>


      <div className="theme-info">

        <p className="mini-event">
          {event?.icon} {event?.name}
        </p>

        <h3>{t.name}</h3>

        <div className="price">

          {money(t.price)}

          <small>
            Starting Price
          </small>

        </div>

        <Link
          to={`/themes/${t.id}`}
          className="btn btn-primary btn-small"
        >
          View Theme
        </Link>

      </div>

    </div>
  );
}


/* =========================================================
   EVENTS
========================================================= */

function Events() {

  const {
    events
  } = useCatalog();

  return (
    <>
      <Header />

      <div className="page-head">

        <div className="container">

          <p className="eyebrow">
            RIGH EVENTS
          </p>

          <h1>
            What Are You Celebrating?
          </h1>

          <p>
            Choose the event type to see the
            themes available for it.
          </p>

        </div>

      </div>


      <main className="section container">

        <div className="event-grid large">

          {events.map(event => (
            <EventCard
              key={event.id}
              e={event}
            />
          ))}

        </div>

      </main>

      <Footer />
    </>
  );
}


/* =========================================================
   THEMES
========================================================= */

function Themes() {

  const {
    events,
    themes
  } = useCatalog();

  const [q, setQ] =
    React.useState('');

  const [event, setEvent] =
    React.useState('');


  const filtered =
    themes.filter(theme =>
      (!event ||
        theme.event_id === event) &&
      (!q ||
        theme.name
          .toLowerCase()
          .includes(q.toLowerCase()))
    );


  return (
    <>
      <Header />

      <div className="page-head">

        <div className="container">

          <p className="eyebrow">
            THEME GALLERY
          </p>

          <h1>
            All Decoration Themes
          </h1>

          <p>
            Browse themes and compare
            starting prices.
          </p>

        </div>

      </div>


      <main className="section container">

        <div className="filterbar">

          <div className="search">

            <Search size={18} />

            <input
              value={q}
              onChange={e =>
                setQ(e.target.value)
              }
              placeholder="Search themes..."
            />

          </div>


          <select
            value={event}
            onChange={e =>
              setEvent(e.target.value)
            }
          >

            <option value="">
              All Events
            </option>

            {events.map(e => (
              <option
                value={e.id}
                key={e.id}
              >
                {e.name}
              </option>
            ))}

          </select>

        </div>


        <div className="theme-grid">

          {filtered.map(theme => (
            <ThemeCard
              key={theme.id}
              t={theme}
              events={events}
            />
          ))}

        </div>


        {!filtered.length && (
          <Empty
            text="No themes found for this selection."
          />
        )}

      </main>

      <Footer />
    </>
  );
}


/* =========================================================
   EVENT THEMES
========================================================= */

function EventThemes() {

  const { id } = useParams();

  const {
    events,
    themes
  } = useCatalog();

  const event =
    events.find(
      e => e.id === id
    );

  const list =
    themes.filter(
      theme => theme.event_id === id
    );


  if (!event) {
    return (
      <Navigate
        to="/events"
      />
    );
  }


  return (
    <>
      <Header />

      <div
        className="event-hero"
        style={{
          backgroundImage:
            `linear-gradient(
              90deg,
              rgba(20,14,20,.72),
              rgba(20,14,20,.25)
            ),
            url(${event.image})`
        }}
      >

        <div className="container">

          <Link
            to="/events"
            className="back-link"
          >
            <ChevronLeft size={16} />
            All Events
          </Link>

          <div>

            <span className="event-icon">
              {event.icon}
            </span>

            <p className="eyebrow">
              RIGH EVENTS
            </p>

            <h1>
              {event.name} Decorations
            </h1>

            <p>
              {list.length} themes available.
              Choose a style that suits your
              celebration.
            </p>

          </div>

        </div>

      </div>


      <main className="section container">

        <div className="theme-grid">

          {list.map(theme => (
            <ThemeCard
              key={theme.id}
              t={theme}
              events={events}
            />
          ))}

        </div>


        {!list.length && (
          <Empty
            text="No themes have been added for this event yet."
          />
        )}

      </main>

      <Footer />
    </>
  );
}


/* =========================================================
   THEME DETAILS
========================================================= */

function ThemeDetails() {

  const { id } =
    useParams();

  const {
    events,
    themes
  } = useCatalog();


  const theme =
    themes.find(
      item => String(item.id) === String(id)
    );


  /*
    Important:
    If the ID doesn't exist, go back to themes
    instead of rendering a broken white page.
  */

  if (!theme) {

    return (
      <Navigate
        to="/themes"
        replace
      />
    );

  }


  const event =
    events.find(
      e => e.id === theme.event_id
    );


  const gallery = [
    theme.image_url,
    ...(theme.images || [])
  ]
    .filter(Boolean)
    .filter(
      (url, index, array) =>
        array.indexOf(url) === index
    );


  return (
    <>
      <Header />

      <main className="container detail-page">

        <div className="breadcrumbs">

          <Link to="/events">
            Events
          </Link>

          {' / '}

          <Link
            to={`/events/${event?.id}`}
          >
            {event?.name}
          </Link>

          {' / '}

          {theme.name}

        </div>


        <div className="detail-grid">

          <div>

            {gallery.length > 0 ? (

              <img
                className="detail-main-img"
                src={gallery[0]}
                alt={theme.name}
              />

            ) : (

              <div className="detail-main-img empty-image">
                No Image Available
              </div>

            )}


            <div className="thumbs">

              {gallery
                .slice(0, 6)
                .map((src, i) => (

                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt={`${theme.name} ${i + 1}`}
                  />

                ))}

            </div>

          </div>


          <div className="detail-copy">

            <div className="detail-actions">

              <span className="badge">
                {theme.tag || 'Theme'}
              </span>

              <span>
                <Heart size={19} />
                <Share2 size={19} />
              </span>

            </div>


            <p className="mini-event">
              {event?.icon} {event?.name}
            </p>


            <h1>
              {theme.name}
            </h1>


            <p className="lead">
              {theme.description}
            </p>


            <div className="big-price">

              {money(theme.price)}

              <small>
                Starting Price
              </small>

            </div>


            <h3>
              Decoration Includes
            </h3>


            <div className="include-grid">

              {(theme.includes || [])
                .map(item => (

                  <div key={item}>
                    <Check size={17} />
                    {item}
                  </div>

                ))}

            </div>


            <div className="detail-meta">

              <span>
                <Clock3 />
                3–4 hours
              </span>

              <span>
                <CalendarDays />
                Customizable
              </span>

              <span>
                <MapPin />
                Indoor / Outdoor
              </span>

            </div>


            <div className="actions full">

              <Link
                to={`/enquiry?theme=${theme.id}`}
                className="btn btn-primary"
              >
                Request a Quote
              </Link>

              <Link
                to={`/enquiry?theme=${theme.id}`}
                className="btn btn-outline"
              >
                Book This Theme
              </Link>

            </div>


            <a
              className="whatsapp"
              href={`https://wa.me/919999999999?text=${encodeURIComponent(
                `Hi Righ Events, I am interested in ${theme.name} for ${event?.name}.`
              )}`}
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}


/* =========================================================
   ENQUIRY
========================================================= */

function Enquiry(){
  const {events,themes}=useCatalog();

  const params=new URLSearchParams(useLocation().search);
  const initial=params.get('theme')||'';

  const [done,setDone]=React.useState(false);
  const [saving,setSaving]=React.useState(false);
  const [error,setError]=React.useState('');

  const [form,setForm]=React.useState({
    name:'',
    phone:'',
    email:'',
    event:'',
    theme:initial,
    date:'',
    guests:'',
    location:'',
    message:''
  });

  const update=e=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  async function submitEnquiry(e){
    e.preventDefault();

    setSaving(true);
    setError('');

    try{

      if(!supabaseConfigured){
        throw new Error(
          'Supabase is not configured. Please check your environment variables.'
        );
      }

      const {error}=await supabase
        .from('enquiries')
        .insert({
          name:form.name.trim(),
          phone:form.phone.trim(),
          email:form.email.trim() || null,
          event_id:form.event || null,
          theme_id:form.theme || null,
          event_date:form.date || null,
          guests:form.guests ? Number(form.guests) : null,
          location:form.location.trim(),
          message:form.message.trim() || null,
          status:'New'
        });

      if(error) throw error;

      /*
       * Send email notification
       */
      const {error:emailError}=await supabase.functions.invoke(
        'send-enquiry-email',
        {
          body:{
            name:form.name,
            phone:form.phone,
            email:form.email,
            event_id:form.event,
            theme_id:form.theme,
            date:form.date,
            guests:form.guests,
            location:form.location,
            message:form.message
          }
        }
      );

      /*
       * We don't block the customer confirmation if
       * email delivery has a temporary problem.
       */
      if(emailError){
        console.error('Email notification error:',emailError);
      }

      setDone(true);

    }catch(err){

      console.error(err);

      setError(
        err.message || 'Could not submit your enquiry. Please try again.'
      );

    }finally{

      setSaving(false);

    }
  }

  if(done){

    return (
      <main className="form-page">

        <div className="form-card success">

          <div className="success-icon">
            ✓
          </div>

          <h1>Enquiry Received</h1>

          <p>
            Thank you. Your quotation request has been received.
            The Righ Events team will contact you shortly.
          </p>

          <Link
            to="/events"
            className="btn btn-primary"
          >
            Explore More Themes
          </Link>

        </div>

      </main>
    );
  }

  return (
    <>
      <Header/>

      <main className="form-page">

        <div className="form-card">

          <p className="eyebrow">
            LET'S PLAN IT
          </p>

          <h1>
            Request a Quote
          </h1>

          <p>
            Tell us about your event and preferred decoration.
          </p>

          <form onSubmit={submitEnquiry}>

            <label>
              Your Name *

              <input
                name="name"
                value={form.name}
                onChange={update}
                required
                placeholder="Enter your name"
              />
            </label>


            <label>
              Phone Number *

              <input
                name="phone"
                value={form.phone}
                onChange={update}
                required
                type="tel"
                placeholder="Enter your phone number"
              />
            </label>


            <label>
              Email

              <input
                name="email"
                value={form.email}
                onChange={update}
                type="email"
                placeholder="Enter your email"
              />
            </label>


            <div className="two">

              <label>
                Event Type *

                <select
                  name="event"
                  value={form.event}
                  onChange={update}
                  required
                >

                  <option value="">
                    Select event
                  </option>

                  {events.map(e=>(
                    <option
                      value={e.id}
                      key={e.id}
                    >
                      {e.name}
                    </option>
                  ))}

                </select>

              </label>


              <label>
                Selected Theme

                <select
                  name="theme"
                  value={form.theme}
                  onChange={update}
                >

                  <option value="">
                    Select a theme
                  </option>

                  {themes
                    .filter(
                      t=>!form.event || t.event_id===form.event
                    )
                    .map(t=>(
                      <option
                        value={t.id}
                        key={t.id}
                      >
                        {t.name}
                      </option>
                    ))
                  }

                </select>

              </label>

            </div>


            <div className="two">

              <label>
                Event Date *

                <input
                  name="date"
                  value={form.date}
                  onChange={update}
                  type="date"
                  required
                />
              </label>


              <label>
                Expected Guests

                <input
                  name="guests"
                  value={form.guests}
                  onChange={update}
                  type="number"
                  min="1"
                  placeholder="Number of guests"
                />
              </label>

            </div>


            <label>
              Event Location *

              <input
                name="location"
                value={form.location}
                onChange={update}
                required
                placeholder="Enter event location"
              />
            </label>


            <label>
              Additional Requirements

              <textarea
                name="message"
                value={form.message}
                onChange={update}
                rows="4"
                placeholder="Tell us about your requirements..."
              />
            </label>


            {error && (
              <div className="error-box">
                {error}
              </div>
            )}


            <button
              className="btn btn-primary submit"
              type="submit"
              disabled={saving}
            >

              {saving
                ? 'Sending...'
                : 'Send Enquiry'
              }

              {!saving && <ArrowRight size={17}/>}

            </button>

          </form>

        </div>

      </main>
    </>
  );
}

/* =========================================================
   GALLERY
========================================================= */

function Gallery() {

  const {
    themes
  } = useCatalog();


  const imgs =
    themes
      .flatMap(theme => [
        theme.image_url,
        ...(theme.images || [])
      ])
      .filter(Boolean)
      .filter(
        (url, index, array) =>
          array.indexOf(url) === index
      );


  return (
    <>
      <Header />

      <div className="page-head">

        <div className="container">

          <p className="eyebrow">
            OUR WORK
          </p>

          <h1>
            Decoration Gallery
          </h1>

          <p>
            Real theme photos and decoration ideas.
          </p>

        </div>

      </div>


      <main className="section container">

        <div className="gallery">

          {imgs.map((src, i) => (

            <img
              key={`${src}-${i}`}
              src={src}
              alt={`Righ Events decoration ${i + 1}`}
            />

          ))}

        </div>

      </main>

      <Footer />
    </>
  );
}


/* =========================================================
   ADMIN LAYOUT
========================================================= */

function AdminLayout({ children }) {

  const nav =
    useNavigate();


  async function logout() {

    sessionStorage.removeItem(
      'righ_demo_admin'
    );

    if (supabaseConfigured) {
      await supabase.auth.signOut();
    }

    nav('/admin/login');
  }


  return (
    <>
      <Header admin />

      <div className="admin-layout">

        <aside className="sidebar">

          <Link to="/admin">
            <LayoutDashboard />
            Dashboard
          </Link>

          <Link to="/admin/themes">
            <Images />
            Themes
          </Link>

          <Link to="/events">
            <CalendarDays />
            View Website
          </Link>

          <Link to="/admin/enquiries">
            <Inbox />
            Enquiries
          </Link>

          <Link>
            <Package />
            Packages
          </Link>

          <Link>
            <Users />
            Customers
          </Link>

          <Link>
            <Settings />
            Settings
          </Link>

          <button
            onClick={logout}
            className="sidebar-logout"
          >
            <LogOut />
            Logout
          </button>

        </aside>


        <main className="admin-main">
          {children}
        </main>

      </div>
    </>
  );
}


/* =========================================================
   PROTECTED ADMIN
========================================================= */

function ProtectedAdmin({ children }) {

  const [loading, setLoading] =
    React.useState(
      supabaseConfigured
    );


  const [ok, setOk] =
    React.useState(
      !supabaseConfigured ||
      sessionStorage.getItem(
        'righ_demo_admin'
      ) === '1'
    );


  React.useEffect(() => {

    if (!supabaseConfigured) {
      return;
    }


    let alive = true;


    supabase.auth
      .getUser()
      .then(async ({ data }) => {

        if (!alive) {
          return;
        }


        if (!data.user) {

          setOk(false);
          setLoading(false);

          return;
        }


        const {
          data: profile,
          error
        } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();


        if (error) {

          console.error(
            'ADMIN PROFILE ERROR:',
            error
          );

        }


        setOk(
          profile?.role === 'admin'
        );

        setLoading(false);

      });


    return () => {
      alive = false;
    };

  }, []);


  if (loading) {

    return (
      <div className="loading">
        Checking admin access…
      </div>
    );

  }


  if (!ok) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }


  return children;
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function AdminLogin() {

  const nav =
    useNavigate();


  const [email, setEmail] =
    React.useState('');

  const [password, setPassword] =
    React.useState('');

  const [error, setError] =
    React.useState('');


  async function submit(e) {

    e.preventDefault();

    setError('');


    if (!supabaseConfigured) {

      sessionStorage.setItem(
        'righ_demo_admin',
        '1'
      );

      nav('/admin');

      return;
    }


    const {
      error: loginError
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password
        });


    if (loginError) {

      setError(
        loginError.message
      );

      return;
    }


    nav('/admin');
  }


  return (
    <main className="form-page">

      <div className="form-card login-card">

        <div className="brand center-brand">

          <span>✿</span>

          <div>
            Righ Events
            <small>
              Admin Panel
            </small>
          </div>

        </div>


        <p className="eyebrow">
          SECURE LOGIN
        </p>

        <h1>
          Admin Login
        </h1>

        <p>
          Manage events, themes,
          photos and prices.
        </p>


        <form onSubmit={submit}>

          <label>
            Email

            <input
              value={email}
              onChange={e =>
                setEmail(e.target.value)
              }
              type="email"
              required
            />

          </label>


          <label>
            Password

            <input
              value={password}
              onChange={e =>
                setPassword(e.target.value)
              }
              type="password"
              required
            />

          </label>


          {error && (
            <div className="error-box">
              {error}
            </div>
          )}


          <button
            className="btn btn-primary submit"
          >
            Login
            <ArrowRight size={17} />
          </button>


          {!supabaseConfigured && (
            <p className="demo-note">
              Supabase is not configured yet,
              so this opens a local demo admin.
              Add the Supabase environment
              variables before deploying.
            </p>
          )}

        </form>


        <Link
          to="/"
          className="back-link dark"
        >
          ← Back to website
        </Link>

      </div>

    </main>
  );
}


/* =========================================================
   ADMIN TITLE
========================================================= */

function AdminTitle({
  title,
  button
}) {

  return (
    <div className="admin-title">

      <div>

        <h1>
          {title}
        </h1>

        <p>
          Righ Events management panel.
        </p>

      </div>

      {button}

    </div>
  );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {

  const {
    events,
    themes
  } = useCatalog();


  const enquiries =
    readLocal(
      'righ_enquiries',
      []
    );


  return (
    <AdminLayout>

      <AdminTitle
        title="Dashboard"
        button={
          <Link
            to="/admin/themes"
            className="btn btn-primary"
          >
            <Plus size={17} />
            Add Theme
          </Link>
        }
      />


      <div className="stats">

        <Stat
          icon="◉"
          title="Total Themes"
          value={themes.length}
        />

        <Stat
          icon="✉"
          title="Enquiries"
          value={enquiries.length}
        />

        <Stat
          icon="▣"
          title="Event Types"
          value={events.length}
        />

        <Stat
          icon="✦"
          title="Published Themes"
          value={themes.length}
        />

      </div>


      <div className="admin-panels">

        <div className="panel">

          <h3>
            Event Types
          </h3>

          <div className="event-admin-list">

            {events.map(event => (

              <div key={event.id}>

                <span>
                  {event.icon}
                </span>

                <strong>
                  {event.name}
                </strong>

                <small>
                  {
                    themes.filter(
                      theme =>
                        theme.event_id ===
                        event.id
                    ).length
                  } themes
                </small>

              </div>

            ))}

          </div>

        </div>


        <div className="panel">

          <h3>
            Recent Enquiries
          </h3>

          {enquiries
            .slice(0, 5)
            .map(item => (

              <div
                className="enquiry-row"
                key={item.id}
              >

                <strong>
                  {item.name}
                </strong>

                <span>
                  {item.event || '—'}
                </span>

                <b>
                  {item.status}
                </b>

              </div>

            ))}


          {!enquiries.length && (
            <Empty
              text="No enquiries yet."
            />
          )}

        </div>

      </div>

    </AdminLayout>
  );
}


/* =========================================================
   STAT
========================================================= */

function Stat({
  icon,
  title,
  value
}) {

  return (
    <div className="stat">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <strong>
          {value}
        </strong>

        <span>
          {title}
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   ADMIN THEMES
========================================================= */

function AdminThemes() {

  const {
    events,
    themes,
    setThemes
  } = useCatalog();


  const [editing, setEditing] =
    React.useState(null);

  const [eventFilter, setEventFilter] =
    React.useState('');

  const [q, setQ] =
    React.useState('');


  const list =
    themes.filter(theme =>
      (!eventFilter ||
        theme.event_id === eventFilter) &&
      (!q ||
        theme.name
          .toLowerCase()
          .includes(q.toLowerCase()))
    );


  /* =======================================================
     SAVE THEME
  ======================================================= */

  async function saveTheme(theme) {

    try {

      let item = {
        ...theme,
        price: Number(theme.price),
        image_url:
          theme.image_url || ''
      };


      /* =====================================================
         SUPABASE
      ===================================================== */

      if (supabaseConfigured) {

        /*
          Generate ID for a NEW theme.
        */

        item.id =
          item.id ||
          crypto.randomUUID();


        /* -----------------------------------------------
           1. CREATE / UPDATE THEME
        ----------------------------------------------- */

        const {
          error: themeError
        } =
          await supabase
            .from('themes')
            .upsert(
              {
                id: item.id,

                event_id:
                  item.event_id,

                name:
                  item.name,

                description:
                  item.description || '',

                price:
                  item.price,

                tag:
                  item.tag || '',

                includes:
                  item.includes || [],

                image_url:
                  item.image_url || '',

                active: true
              },
              {
                onConflict: 'id'
              }
            );


        if (themeError) {
          throw new Error(
            `Theme save failed: ${themeError.message}`
          );
        }


        /* -----------------------------------------------
           2. UPLOAD IMAGES
        ----------------------------------------------- */

        const uploadedImages = [];


        for (
          let i = 0;
          i < (theme.pendingFiles || []).length;
          i++
        ) {

          const file =
            theme.pendingFiles[i].file;


          const safeName =
            file.name.replace(
              /[^a-zA-Z0-9._-]/g,
              '_'
            );


          const path =
            `${item.id}/${Date.now()}-${i}-${safeName}`;


          console.log(
            'Uploading image:',
            path
          );


          const {
            error: uploadError
          } =
            await supabase
              .storage
              .from('theme-images')
              .upload(
                path,
                file
              );


          if (uploadError) {

            throw new Error(
              `Image upload failed: ${uploadError.message}`
            );

          }


          /* ---------------------------------------------
             3. GET PUBLIC URL
          --------------------------------------------- */

          const {
            data: publicData
          } =
            supabase
              .storage
              .from('theme-images')
              .getPublicUrl(path);


          const imageUrl =
            publicData?.publicUrl;


          if (!imageUrl) {

            throw new Error(
              'Could not create public image URL.'
            );

          }


          uploadedImages.push(
            imageUrl
          );


          console.log(
            'Image URL:',
            imageUrl
          );


          /* ---------------------------------------------
             4. INSERT theme_images RECORD
          --------------------------------------------- */

          const {
            error: imageError
          } =
            await supabase
              .from('theme_images')
              .insert({
                theme_id:
                  item.id,

                url:
                  imageUrl,

                sort_order:
                  i
              });


          if (imageError) {

            throw new Error(
              `Image database save failed: ${imageError.message}`
            );

          }

        }


        /* -----------------------------------------------
           5. SET FIRST IMAGE AS MAIN IMAGE
        ----------------------------------------------- */

        if (
          !item.image_url &&
          uploadedImages.length > 0
        ) {

          item.image_url =
            uploadedImages[0];


          const {
            error: imageUpdateError
          } =
            await supabase
              .from('themes')
              .update({
                image_url:
                  item.image_url
              })
              .eq(
                'id',
                item.id
              );


          if (imageUpdateError) {

            throw new Error(
              `Main image update failed: ${imageUpdateError.message}`
            );

          }

        }


        /* -----------------------------------------------
           6. RELOAD THEMES
        ----------------------------------------------- */

        const {
          data: rows,
          error: fetchError
        } =
          await supabase
            .from('themes')
            .select(`
              *,
              theme_images (
                url,
                sort_order
              )
            `)
            .eq('active', true)
            .order(
              'created_at',
              {
                ascending: false
              }
            );


        if (fetchError) {

          throw new Error(
            `Theme reload failed: ${fetchError.message}`
          );

        }


        const formattedRows =
          (rows || []).map(themeRow => {

            const sortedImages =
              (themeRow.theme_images || [])
                .slice()
                .sort(
                  (a, b) =>
                    (a.sort_order || 0) -
                    (b.sort_order || 0)
                )
                .map(
                  image => image.url
                );


            return {
              ...themeRow,

              image_url:
                themeRow.image_url ||
                sortedImages[0] ||
                '',

              images:
                sortedImages
            };

          });


        setThemes(
          formattedRows
        );

      }


      /* =====================================================
         LOCAL MODE
      ===================================================== */

      else {

        const previews =
          (theme.pendingFiles || [])
            .map(
              file =>
                file.preview
            );


        item.images = [
          ...(item.images || []),
          ...previews
        ];


        if (!item.image_url) {

          item.image_url =
            previews[0] || '';

        }


        setThemes(prev => {

          if (theme.id) {

            return prev.map(
              existing =>
                existing.id === theme.id
                  ? item
                  : existing
            );

          }


          return [
            item,
            ...prev
          ];

        });

      }


      /* -----------------------------------------------
         CLOSE EDITOR
      ----------------------------------------------- */

      setEditing(null);


      alert(
        theme.id
          ? 'Theme updated successfully!'
          : 'Theme added successfully!'
      );


    } catch (error) {

      console.error(
        'SAVE THEME ERROR:',
        error
      );


      alert(
        error?.message ||
        'Could not save theme.'
      );

    }

  }


  /* =======================================================
     DELETE THEME
  ======================================================= */

  async function remove(id) {

    if (
      !confirm(
        'Delete this theme?'
      )
    ) {
      return;
    }


    if (supabaseConfigured) {

      const {
        error
      } =
        await supabase
          .from('themes')
          .update({
            active: false
          })
          .eq(
            'id',
            id
          );


      if (error) {

        alert(
          error.message
        );

        return;
      }

    }


    setThemes(prev =>
      prev.filter(
        theme =>
          theme.id !== id
      )
    );

  }


  return (
    <AdminLayout>

      <AdminTitle
        title="Themes"
        button={
          <button
            onClick={() =>
              setEditing({
                name: '',
                event_id:
                  events[0]?.id || '',
                price: '',
                tag: '',
                description: '',
                image_url: '',
                images: [],
                includes: [],
                pendingFiles: []
              })
            }
            className="btn btn-primary"
          >
            <Plus size={17} />
            Add New Theme
          </button>
        }
      />


      <div className="panel table-panel">

        <div className="toolbar">

          <div className="search">

            <Search size={17} />

            <input
              value={q}
              onChange={e =>
                setQ(e.target.value)
              }
              placeholder="Search themes..."
            />

          </div>


          <select
            value={eventFilter}
            onChange={e =>
              setEventFilter(
                e.target.value
              )
            }
          >

            <option value="">
              All Events
            </option>

            {events.map(event => (

              <option
                value={event.id}
                key={event.id}
              >
                {event.name}
              </option>

            ))}

          </select>

        </div>


        <table>

          <thead>

            <tr>
              <th>Theme</th>
              <th>Event</th>
              <th>Price</th>
              <th>Photos</th>
              <th>Actions</th>
            </tr>

          </thead>


          <tbody>

            {list.map(theme => (

              <tr key={theme.id}>

                <td>

                  <div className="table-theme">

                    {theme.image_url ? (

                      <img
                        src={theme.image_url}
                        alt={theme.name}
                      />

                    ) : (

                      <div className="table-empty-image">
                        No Image
                      </div>

                    )}

                    <strong>
                      {theme.name}
                    </strong>

                  </div>

                </td>


                <td>
                  {
                    events.find(
                      event =>
                        event.id ===
                        theme.event_id
                    )?.name
                  }
                </td>


                <td>
                  {money(theme.price)}
                </td>


                <td>
                  {
                    1 +
                    (theme.images?.length || 0)
                  }
                </td>


                <td>

                  <button
                    className="icon-btn"
                    onClick={() =>
                      setEditing({
                        ...theme,
                        pendingFiles: []
                      })
                    }
                  >
                    <Pencil size={16} />
                  </button>


                  <button
                    className="icon-btn"
                    onClick={() =>
                      remove(theme.id)
                    }
                  >
                    <Trash2 size={16} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>


        {!list.length && (
          <Empty
            text="No themes in this event yet."
          />
        )}

      </div>


      {editing && (

        <ThemeEditor
          events={events}
          initial={editing}
          onSave={saveTheme}
          onClose={() =>
            setEditing(null)
          }
        />

      )}

    </AdminLayout>
  );
}


/* =========================================================
   THEME EDITOR
========================================================= */

function ThemeEditor({
  events,
  initial,
  onSave,
  onClose
}) {

  const [form, setForm] =
    React.useState({
      ...initial,
      includes:
        initial.includes || [],
      images:
        initial.images || [],
      pendingFiles:
        initial.pendingFiles || []
    });


  const [previews, setPreviews] =
    React.useState([]);


  const update = (
    key,
    value
  ) => {

    setForm(prev => ({
      ...prev,
      [key]: value
    }));

  };


  /* =======================================================
     ADD IMAGES
  ======================================================= */

  const addFiles = e => {

    const files =
      [...e.target.files];


    files.forEach(file => {

      const reader =
        new FileReader();


      reader.onload = () => {

        const preview =
          reader.result;


        setForm(prev => ({
          ...prev,

          pendingFiles: [
            ...(prev.pendingFiles || []),

            {
              name: file.name,
              file,
              preview
            }
          ]
        }));


        setPreviews(prev => [
          ...prev,
          preview
        ]);

      };


      reader.readAsDataURL(file);

    });


    /*
      Allows selecting the same file again.
    */

    e.target.value = '';

  };


  const existing = [
    form.image_url,
    ...(form.images || [])
  ]
    .filter(Boolean)
    .filter(
      (url, index, array) =>
        array.indexOf(url) === index
    );


  const allPhotos = [
    ...existing,
    ...previews
  ];


  return (
    <div className="modal-backdrop">

      <div className="theme-editor">

        <div className="editor-head">

          <div>

            <p className="eyebrow">
              ADMIN
            </p>

            <h2>
              {form.id
                ? 'Edit Theme'
                : 'Add New Theme'}
            </h2>

          </div>


          <button
            onClick={onClose}
            type="button"
            className="icon-btn"
          >
            <X />
          </button>

        </div>


        <form
          onSubmit={e => {

            e.preventDefault();

            if (!form.name.trim()) {

              alert(
                'Please enter a theme name.'
              );

              return;
            }


            if (!form.event_id) {

              alert(
                'Please select an event.'
              );

              return;
            }


            onSave(form);

          }}
          className="editor-form"
        >


          <div className="two">

            <label>

              Theme Name *

              <input
                required
                value={form.name}
                onChange={e =>
                  update(
                    'name',
                    e.target.value
                  )
                }
                placeholder="Royal Wedding Theme"
              />

            </label>


            <label>

              Event Type *

              <select
                value={form.event_id}
                onChange={e =>
                  update(
                    'event_id',
                    e.target.value
                  )
                }
              >

                {events.map(event => (

                  <option
                    value={event.id}
                    key={event.id}
                  >
                    {event.icon} {event.name}
                  </option>

                ))}

              </select>

            </label>

          </div>


          <div className="two">

            <label>

              Price *

              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={e =>
                  update(
                    'price',
                    e.target.value
                  )
                }
                placeholder="25000"
              />

            </label>


            <label>

              Theme Tag

              <input
                value={form.tag || ''}
                onChange={e =>
                  update(
                    'tag',
                    e.target.value
                  )
                }
                placeholder="Luxury / Kids / Floral"
              />

            </label>

          </div>


          <label>

            Description

            <textarea
              rows="3"
              value={
                form.description || ''
              }
              onChange={e =>
                update(
                  'description',
                  e.target.value
                )
              }
              placeholder="Describe this decoration theme..."
            />

          </label>


          <label>

            Included Items

            <input
              value={
                (form.includes || [])
                  .join(', ')
              }
              onChange={e =>
                update(
                  'includes',
                  e.target.value
                    .split(',')
                    .map(x =>
                      x.trim()
                    )
                    .filter(Boolean)
                )
              }
              placeholder="Backdrop, Balloons, Cake table, Lights"
            />

          </label>


          {/* =================================================
              IMAGE UPLOAD
          ================================================= */}

          <div className="upload-box">

            <div>

              <Upload size={24} />

              <strong>
                Theme Photos
              </strong>

              <p>
                Upload multiple JPG,
                PNG or WEBP images.
              </p>

            </div>


            <label className="btn btn-outline upload-btn">

              + Choose Photos

              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                multiple
                onChange={addFiles}
              />

            </label>

          </div>


          {/* =================================================
              PHOTO PREVIEW
          ================================================= */}

          {allPhotos.length > 0 && (

            <div className="photo-grid">

              {allPhotos.map(
                (src, index) => (

                  <div
                    className="photo-thumb"
                    key={`${src}-${index}`}
                  >

                    <img
                      src={src}
                      alt={`Theme photo ${index + 1}`}
                    />

                    {index === 0 && (
                      <span>
                        Main
                      </span>
                    )}

                  </div>

                )
              )}

            </div>

          )}


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="editor-actions">

            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>


            <button
              className="btn btn-primary"
              type="submit"
            >
              Save Theme
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   ADMIN ENQUIRIES
========================================================= */

function AdminEnquiries() {

  const [items, setItems] =
    React.useState(() =>
      readLocal(
        'righ_enquiries',
        []
      )
    );


  function remove(id) {

    setItems(current => {

      const next =
        current.filter(
          item =>
            item.id !== id
        );

      writeLocal(
        'righ_enquiries',
        next
      );

      return next;

    });

  }


  return (
    <AdminLayout>

      <AdminTitle
        title="Enquiries"
      />


      <div className="panel table-panel">

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Event</th>
              <th>Date</th>
              <th>Location</th>
              <th>Status</th>
              <th></th>
            </tr>

          </thead>


          <tbody>

            {items.map(item => (

              <tr key={item.id}>

                <td>
                  {item.name}
                </td>

                <td>
                  {item.phone}
                </td>

                <td>
                  {item.event}
                </td>

                <td>
                  {item.date}
                </td>

                <td>
                  {item.location}
                </td>

                <td>

                  <span className="status new">
                    {item.status}
                  </span>

                </td>

                <td>

                  <button
                    className="icon-btn"
                    onClick={() =>
                      remove(item.id)
                    }
                  >
                    <Trash2 size={15} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>


        {!items.length && (
          <Empty
            text="No enquiries yet. Customer enquiries will appear here."
          />
        )}

      </div>

    </AdminLayout>
  );
}


/* =========================================================
   EMPTY
========================================================= */

function Empty({ text }) {

  return (
    <div className="empty">
      {text}
    </div>
  );
}


/* =========================================================
   ROUTES
========================================================= */

export default function App() {

  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/events"
        element={<Events />}
      />

      <Route
        path="/events/:id"
        element={<EventThemes />}
      />

      <Route
        path="/themes"
        element={<Themes />}
      />

      <Route
        path="/themes/:id"
        element={<ThemeDetails />}
      />

      <Route
        path="/enquiry"
        element={<Enquiry />}
      />

      <Route
        path="/gallery"
        element={<Gallery />}
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <AdminDashboard />
          </ProtectedAdmin>
        }
      />

      <Route
        path="/admin/themes"
        element={
          <ProtectedAdmin>
            <AdminThemes />
          </ProtectedAdmin>
        }
      />

      <Route
        path="/admin/enquiries"
        element={
          <ProtectedAdmin>
            <AdminEnquiries />
          </ProtectedAdmin>
        }
      />

    </Routes>
  );
}