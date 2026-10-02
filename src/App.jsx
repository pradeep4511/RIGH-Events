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
    RIGH Events
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
    RIGH Events
    <small>WE CREATE - YOU CELEBRATE !!</small>
  </div>
</div>

    <h3 className="location-address">
  <span className="map-icon">📍</span>
  <a
    href="https://www.google.com/maps/place/RiGh+Events/@14.4122535,77.7229417,67m/data=!3m1!1e3!4m14!1m7!3m6!1s0x3bb14adefe22d727:0x84788f626beea09d!2sDharmavaram+Head+Post+Office!8m2!3d14.4122152!4d77.7229378!16s%2Fg%2F11bcf0xw5x!3m5!1s0x3bb14390b1155f9d:0x6d40e4610a756f09!8m2!3d14.4120124!4d77.7230777!16s%2Fg%2F11s5k0dh6v"
    target="_blank"
    rel="noopener noreferrer"
  >
    RIGH EVENTS, Opposite Post Office, Market Street,
    Akkpedianera, Dharmavaram,
    Andhra Pradesh 515671, India.
  </a>
</h3>
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

function useCatalog(){

  const [events,setEvents] = React.useState(
    () => readLocal('righ_events', defaultEvents)
  );

  const [themes,setThemes] = React.useState(
    () => readLocal('righ_themes', defaultThemes)
  );

  const [loading,setLoading] = React.useState(supabaseConfigured);

  React.useEffect(() => {

    if(!supabaseConfigured){
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCatalog(){

      try{

        const [
          eventsResult,
          themesResult
        ] = await Promise.all([

          supabase
            .from('events')
            .select('*')
            .eq('active',true)
            .order('sort_order', { ascending: true }),

          supabase
            .from('themes')
            .select(`
              *,
              theme_images (
                url,
                sort_order
              )
            `)
            .eq('active',true)
            .order('created_at',{ascending:false})

        ]);

        if(cancelled) return;

        if(eventsResult.error){
          console.error(
            'Events loading error:',
            eventsResult.error
          );
        }

        if(themesResult.error){

          console.error(
            'Themes loading error:',
            themesResult.error
          );

        }

        if(eventsResult.data){

          setEvents(eventsResult.data);

        }

        if(themesResult.data){

          const formattedThemes =
            themesResult.data.map(theme => {

              const images =
                (theme.theme_images || [])
                  .sort(
                    (a,b) =>
                      (a.sort_order || 0) -
                      (b.sort_order || 0)
                  )
                  .map(image => image.url);

              return {

                ...theme,

                image_url:
                  theme.image_url ||
                  images[0] ||
                  '',

                images

              };

            });

          setThemes(formattedThemes);

        }

      } catch(error){

        console.error(
          'Catalog loading error:',
          error
        );

      } finally {

        if(!cancelled){
          setLoading(false);
        }

      }

    }

    loadCatalog();

    return () => {
      cancelled = true;
    };

  },[]);


  React.useEffect(() => {

    if(!supabaseConfigured){

      writeLocal(
        'righ_events',
        events
      );

      writeLocal(
        'righ_themes',
        themes
      );

    }

  },[events,themes]);


  return {
    events,
    themes,
    setEvents,
    setThemes,
    loading
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
/* =========================================================
   EVENT THEMES
========================================================= */

function EventThemes(){

  const { id } = useParams();
  

  const {
    events,
    themes,
    loading
  } = useCatalog();

  if(loading){

    return (
      <>
        <Header />

        <main className="container">
          <div className="loading">
            Loading themes...
          </div>
        </main>

        <Footer />
      </>
    );

  }

  const event = events.find(
    e => String(e.id) === String(id)
  );

  if(!event){

    return (
      <Navigate
        to="/events"
        replace
      />
    );

  }

  const eventThemes = themes.filter(
    theme =>
      String(theme.event_id) ===
      String(event.id)
  );

  return (
    <>
      <Header />

      <div className="page-head">

        <div className="container">

          <p className="eyebrow">
            {event.icon} RIGH EVENTS
          </p>

          <h1>
            {event.name} Themes
          </h1>

          <p>
            Choose a decoration theme for your{' '}
            {event.name.toLowerCase()} celebration.
          </p>

        </div>

      </div>

      <main className="section container">

        <div className="theme-grid">

          {eventThemes.map(theme => (

            <ThemeCard
              key={theme.id}
              t={theme}
              events={events}
            />

          ))}

        </div>

        {!eventThemes.length && (

          <Empty
            text="No themes available for this event yet."
          />

        )}

      </main>

      <Footer />

    </>
  );
}
function ThemeDetails(){

  const {id} = useParams();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const {
    events,
    themes,
    loading
  } = useCatalog();


  // Wait for Supabase data
  // before deciding that the theme doesn't exist.
  if(loading){

    return (

      <>

        <Header/>

        <main className="container">

          <div className="loading">
            Loading theme...
          </div>

        </main>

      </>

    );

  }


  const t =
    themes.find(
      x => String(x.id) === String(id)
    );


  if(!t){

    return <Navigate to="/themes" replace/>;

  }


  const event =
    events.find(
      e => String(e.id) === String(t.event_id)
    );


  const gallery = [
    t.image_url,
    ...(t.images || [])
  ].filter(Boolean);


  return (

    <>

      <Header/>

      <main className="container detail-page">

        <div className="breadcrumbs">

          <Link to="/events">
            Events
          </Link>

          {' / '}

          <Link to={`/events/${event?.id}`}>
            {event?.name}
          </Link>

          {' / '}

          {t.name}

        </div>


        <div className="detail-grid">

          {/* PHOTOS */}

<div>

  <img
    className="detail-main-img"
    src={gallery[selectedImage]}
    alt={t.name}
  />

  {gallery.length > 1 && (
    <div className="thumbs">

      {gallery
        .slice(0, 6)
        .map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${t.name} ${i + 1}`}
            onClick={() => setSelectedImage(i)}
            className={
              selectedImage === i
                ? 'active-thumb'
                : ''
            }
          />
        ))}

    </div>
  )}



          </div>


          {/* DETAILS */}

          <div className="detail-copy">

            <div className="detail-actions">

              <span className="badge">
                {t.tag || 'Theme'}
              </span>

              <span>
                <Heart size={19}/>
                <Share2 size={19}/>
              </span>

            </div>


            <p className="mini-event">
              {event?.icon} {event?.name}
            </p>


            <h1>
              {t.name}
            </h1>


            <p className="lead">
              {t.description || 'Beautifully designed decoration theme for your special event.'}
            </p>


            <div className="big-price">

              {money(t.price)}

              <small>
                Starting Price
              </small>

            </div>


            <h3>
              Decoration Includes
            </h3>


            <div className="include-grid">

              {(t.includes || []).map(
                item => (

                  <div key={item}>

                    <Check size={17}/>

                    {item}

                  </div>

                )
              )}

            </div>


            <div className="detail-meta">

              
              <span>
                <CalendarDays/>
                Customizable
              </span>

              <span>
                <MapPin/>
                Indoor / Outdoor
              </span>

            </div>


            <div className="actions full">

              <Link
                to={`/enquiry?theme=${t.id}`}
                className="btn btn-primary"
              >
                Request a Quote
              </Link>


              <Link
                to={`/enquiry?theme=${t.id}`}
                className="btn btn-outline"
              >
                Book This Theme
              </Link>

            </div>


            <a
              className="whatsapp"
              href={`https://wa.me/919346080480?text=${encodeURIComponent(
                `Hi Righ Events, I am interested in ${t.name} for ${event?.name}.`
              )}`}
              target="_blank"
              rel="noreferrer"
            >

              <MessageCircle size={18}/>

              Chat on WhatsApp

            </a>

          </div>

        </div>

      </main>

      <Footer/>

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

          <Link to="/admin/customers">
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

  const [loading, setLoading] = React.useState(true);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {

    let alive = true;

    async function checkAdmin() {

      // Supabase must be configured
      if (!supabaseConfigured || !supabase) {
        if (alive) {
          setOk(false);
          setLoading(false);
        }
        return;
      }

      try {

        // Get currently logged-in user
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {

          if (alive) {
            setOk(false);
            setLoading(false);
          }

          return;
        }

        // Check user's profile role
        const {
          data: profile,
          error: profileError
        } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {

          console.error(
            'ADMIN PROFILE ERROR:',
            profileError
          );

          if (alive) {
            setOk(false);
            setLoading(false);
          }

          return;
        }

        // Only role = admin can access
        if (alive) {
          setOk(profile?.role === 'admin');
          setLoading(false);
        }

      } catch (error) {

        console.error(
          'ADMIN AUTH CHECK ERROR:',
          error
        );

        if (alive) {
          setOk(false);
          setLoading(false);
        }
      }
    }

    checkAdmin();

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
      image_url: theme.image_url || ''
    };


    /* =====================================================
       SUPABASE
    ===================================================== */

    if (supabaseConfigured) {

      /* Generate ID for new theme */
      item.id =
        item.id ||
        crypto.randomUUID();


      /* ===================================================
         1. CREATE / UPDATE THEME
      =================================================== */

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


      /* ===================================================
         2. UPLOAD ALL NEW IMAGES
      =================================================== */

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


        /* Upload image to Storage */

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


        /* =================================================
           3. GET PUBLIC URL
        ================================================= */

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


        /* =================================================
           4. SAVE IMAGE IN theme_images
        ================================================= */

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


      /* ===================================================
         5. SET FIRST IMAGE AS MAIN IMAGE
      =================================================== */

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


      /* ===================================================
         6. RELOAD ALL THEMES + ALL IMAGES
      =================================================== */

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
          .eq(
            'active',
            true
          )
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


      /* ===================================================
         7. FORMAT ALL IMAGES
      =================================================== */

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

            /* First image = main image */
            image_url:
              themeRow.image_url ||
              sortedImages[0] ||
              '',

            /* All images */
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


    /* =====================================================
       CLOSE EDITOR
    ===================================================== */

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

  const [form, setForm] = React.useState({
    ...initial,
    includes: Array.isArray(initial.includes)
      ? initial.includes
      : [],
    images: Array.isArray(initial.images)
      ? initial.images
      : [],
    pendingFiles: initial.pendingFiles || []
  });

  const [previews, setPreviews] = React.useState([]);

  const update = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };


  /* =====================================================
     ADD MULTIPLE IMAGES
  ===================================================== */

  const addFiles = (e) => {

    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    files.forEach(file => {

      if (!file.type.startsWith('image/')) {
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {

        const preview = reader.result;

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

    /* Allow selecting same files again */
    e.target.value = '';

  };


  /* =====================================================
     EXISTING IMAGES
  ===================================================== */

  const existingImages = [
    form.image_url,
    ...(form.images || [])
  ]
    .filter(Boolean)
    .filter(
      (url, index, array) =>
        array.indexOf(url) === index
    );


  /* =====================================================
     ALL IMAGES
  ===================================================== */

  const allPhotos = [
    ...existingImages,
    ...previews
  ];


  /* =====================================================
     INCLUDED ITEMS
  ===================================================== */

  const includedText =
    (form.includes || []).join(', ');


 const updateIncludedItems = (value) => {
  setForm(prev => ({
    ...prev,
    includes: value.split(',').map(item => item.trim())
  }));
};


  return (

    <div className="modal-backdrop">

      <div className="theme-editor">

        {/* =================================================
            HEADER
        ================================================= */}

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


        {/* =================================================
            FORM
        ================================================= */}

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


          {/* =================================================
              THEME NAME / EVENT
          ================================================= */}

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


          {/* =================================================
              PRICE / TAG
          ================================================= */}

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


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <label>

            Description

            <textarea
              rows="4"
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


          {/* =================================================
              INCLUDED ITEMS
          ================================================= */}

  <label>
  Included Items

  <textarea
    rows="3"
    value={(form.includes || []).join(', ')}
    onChange={(e) => updateIncludedItems(e.target.value)}
    placeholder="Backdrop, Balloons, Cake table, Lights"
  />

  <small className="field-help">
    Separate each item with a comma.
    Example: Backdrop, Balloons, Cake Table, Lights
  </small>
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
                Select multiple JPG, PNG or WEBP images.
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

            <div className="photo-section">

              <div className="photo-section-head">

                <strong>
                  Theme Photos
                </strong>

                <span>
                  {allPhotos.length} image
                  {allPhotos.length !== 1 ? 's' : ''}
                </span>

              </div>


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
   ADMIN CUSTOMERS
========================================================= */

function AdminCustomers() {

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  async function loadCustomers() {

    setLoading(true);
    setError('');

    try {

      if (!supabaseConfigured) {
        throw new Error(
          'Supabase is not configured.'
        );
      }

      const {
        data,
        error: fetchError
      } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', {
          ascending: false
        });

      if (fetchError) {
        throw fetchError;
      }

      /*
       * Build unique customers.
       *
       * Phone number is used as the main
       * customer identifier.
       */

      const customerMap = new Map();

      (data || []).forEach(item => {

        const key =
          item.phone ||
          item.email ||
          item.name;

        if (!key) return;

        if (!customerMap.has(key)) {

          customerMap.set(
            key,
            {
              id: key,
              name: item.name,
              phone: item.phone,
              email: item.email,
              enquiries: 0,
              events: [],
              lastEnquiry: item.created_at
            }
          );

        }

        const customer =
          customerMap.get(key);

        customer.enquiries += 1;

        if (
          item.event_id &&
          !customer.events.includes(
            item.event_id
          )
        ) {

          customer.events.push(
            item.event_id
          );

        }

        if (
          item.created_at >
          customer.lastEnquiry
        ) {

          customer.lastEnquiry =
            item.created_at;

        }

      });

      setItems(
        Array.from(
          customerMap.values()
        )
      );

    } catch (err) {

      console.error(
        'CUSTOMERS LOAD ERROR:',
        err
      );

      setError(
        err.message ||
        'Could not load customers.'
      );

    } finally {

      setLoading(false);

    }

  }

  React.useEffect(() => {
    loadCustomers();
  }, []);

  return (

    <AdminLayout>

      <AdminTitle
        title="Customers"
        button={
          <button
            className="btn btn-primary"
            onClick={loadCustomers}
          >
            Refresh
          </button>
        }
      />

      {loading && (
        <div className="loading">
          Loading customers...
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!loading && !error && (

        <div className="panel table-panel">

          <table>

            <thead>

              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Events</th>
                <th>Enquiries</th>
                <th>Last Enquiry</th>
              </tr>

            </thead>

            <tbody>

              {items.map(customer => (

                <tr key={customer.id}>

                  <td>

                    <strong>
                      {customer.name}
                    </strong>

                  </td>

                  <td>
                    {customer.phone || '—'}
                  </td>

                  <td>
                    {customer.email || '—'}
                  </td>

                  <td>

                    {customer.events.length
                      ? customer.events.join(', ')
                      : '—'}

                  </td>

                  <td>

                    <strong>
                      {customer.enquiries}
                    </strong>

                  </td>

                  <td>

                    {customer.lastEnquiry
                      ? new Date(
                          customer.lastEnquiry
                        ).toLocaleString(
                          'en-IN'
                        )
                      : '—'}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {!items.length && (
            <Empty
              text="No customers yet. Customers will appear after they submit an enquiry."
            />
          )}

        </div>

      )}

    </AdminLayout>

  );

}

/* =========================================================
   ADMIN ENQUIRIES
========================================================= */

function AdminEnquiries() {

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  async function loadEnquiries() {

    setLoading(true);
    setError('');

    try {

      if (!supabaseConfigured) {
        throw new Error(
          'Supabase is not configured.'
        );
      }

      const {
        data,
        error: fetchError
      } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', {
          ascending: false
        });

      if (fetchError) {
        throw fetchError;
      }

      setItems(data || []);

    } catch (err) {

      console.error(
        'ENQUIRIES LOAD ERROR:',
        err
      );

      setError(
        err.message ||
        'Could not load enquiries.'
      );

    } finally {

      setLoading(false);

    }

  }

  React.useEffect(() => {
    loadEnquiries();
  }, []);

  async function updateStatus(id, status) {

    try {

      const {
        error: updateError
      } = await supabase
        .from('enquiries')
        .update({
          status
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                status
              }
            : item
        )
      );

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        'Could not update status.'
      );

    }

  }

  async function remove(id) {

    if (
      !confirm(
        'Delete this enquiry permanently?'
      )
    ) {
      return;
    }

    try {

      const {
        error: deleteError
      } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setItems(prev =>
        prev.filter(
          item => item.id !== id
        )
      );

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        'Could not delete enquiry.'
      );

    }

  }

  return (

    <AdminLayout>

      <AdminTitle
        title="Enquiries"
        button={
          <button
            className="btn btn-primary"
            onClick={loadEnquiries}
          >
            Refresh
          </button>
        }
      />

      {loading && (
        <div className="loading">
          Loading enquiries...
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!loading && !error && (

        <div className="panel table-panel">

          <table>

            <thead>

              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Event</th>
                <th>Theme</th>
                <th>Date</th>
                <th>Guests</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>

            </thead>

            <tbody>

              {items.map(item => (

                <tr key={item.id}>

                  <td>

                    <strong>
                      {item.name}
                    </strong>

                    {item.message && (
                      <small
                        style={{
                          display: 'block',
                          marginTop: '5px'
                        }}
                      >
                        {item.message}
                      </small>
                    )}

                  </td>

                  <td>

                    <div>
                      {item.phone}
                    </div>

                    {item.email && (
                      <small>
                        {item.email}
                      </small>
                    )}

                  </td>

                  <td>
                    {item.event_id || '—'}
                  </td>

                  <td>
                    {item.theme_id || '—'}
                  </td>

                  <td>
                    {item.event_date || '—'}
                  </td>

                  <td>
                    {item.guests || '—'}
                  </td>

                  <td>
                    {item.location || '—'}
                  </td>

                  <td>

                    <select
                      value={
                        item.status || 'New'
                      }
                      onChange={e =>
                        updateStatus(
                          item.id,
                          e.target.value
                        )
                      }
                    >

                      <option value="New">
                        New
                      </option>

                      <option value="Contacted">
                        Contacted
                      </option>

                      <option value="Quote Sent">
                        Quote Sent
                      </option>

                      <option value="Confirmed">
                        Confirmed
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>

                    </select>

                  </td>

                  <td>

                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString(
                          'en-IN'
                        )
                      : '—'}

                  </td>

                  <td>

                    <button
                      className="icon-btn"
                      onClick={() =>
                        remove(item.id)
                      }
                      title="Delete"
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
              text="No enquiries found."
            />
          )}

        </div>

      )}

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

      {/* =========================
          CUSTOMER WEBSITE
      ========================= */}

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


      {/* =========================
          ADMIN LOGIN
      ========================= */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =========================
          ADMIN DASHBOARD
      ========================= */}

      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <AdminDashboard />
          </ProtectedAdmin>
        }
      />


      {/* =========================
          ADMIN THEMES
      ========================= */}

      <Route
        path="/admin/themes"
        element={
          <ProtectedAdmin>
            <AdminThemes />
          </ProtectedAdmin>
        }
      />


      {/* =========================
          ADMIN CUSTOMERS
      ========================= */}

      <Route
        path="/admin/customers"
        element={
          <ProtectedAdmin>
            <AdminCustomers />
          </ProtectedAdmin>
        }
      />


      {/* =========================
          ADMIN ENQUIRIES
      ========================= */}

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