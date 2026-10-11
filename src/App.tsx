import { useMemo, useState, type FormEvent } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Select from "@radix-ui/react-select";
import { DayPicker } from "react-day-picker";
import {
  ArrowDownUp, ArrowRight, Bot, CalendarDays, Check, ChevronDown, ChevronRight, CircleHelp, Compass, Hotel, Menu, MessageCircle, Minus, Plane,
  Plus, Search, Send, ShieldCheck, Sparkles, Ticket, Users, X, MoonStar, Globe2
} from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { airports, airportLabel, type Airport } from "./lib/airports";
import { getCopilotStatus, sendTravelMessage } from "./lib/copilot";

type Service = "flights" | "travel" | "visa" | "umrah" | "hotels";
type TripType = "round-trip" | "one-way" | "multi-city";
const serviceMeta: Record<Service, { title: string; subtitle: string; icon: typeof Plane; prompt: string }> = {
  flights: { title: "Flights", subtitle: "Find your next flight", icon: Plane, prompt: "Help me find flights for my trip" },
  travel: { title: "Travel planning", subtitle: "Build a trip around you", icon: Compass, prompt: "Help me plan a trip for my family" },
  visa: { title: "Visa assistance", subtitle: "Understand your next steps", icon: Ticket, prompt: "Help me understand visa requirements" },
  umrah: { title: "Umrah packages", subtitle: "Plan your pilgrimage", icon: MoonStar, prompt: "Help me plan Umrah for my family" },
  hotels: { title: "Hotels & stays", subtitle: "Find a comfortable stay", icon: Hotel, prompt: "I need a family-friendly hotel" },
};

function AirportPicker({ label, value, onChange, exclude }: { label: string; value: Airport; onChange: (airport: Airport) => void; exclude?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => airports.filter((a) => a.code !== exclude && (a.city + " " + a.name + " " + a.country + " " + a.code).toLowerCase().includes(query.toLowerCase())).slice(0, 8), [query, exclude]);
  return <div className="field">
    <label>{label}</label>
    <Popover.Root open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(""); }}>
      <Popover.Trigger asChild>
        <button className="airport-trigger" type="button" aria-label={label + ": " + airportLabel(value)}>
          <span className="airport-code">{value.code}</span>
          <span className="airport-current"><strong>{value.city}</strong><small>{value.name}</small></span>
          <ChevronDown size={17} className="muted-icon" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="airport-popover" sideOffset={8} align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="airport-search"><Search size={17}/><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city, airport or code…" aria-label="Search airports" /></div>
          <div className="airport-results">
            {filtered.map((airport) => <button type="button" className="airport-option" key={airport.code} onClick={() => { onChange(airport); setOpen(false); setQuery(""); }}>
              <span className="airport-code">{airport.code}</span><span className="airport-current"><strong>{airport.city}</strong><small>{airport.name} · {airport.country}</small></span>{value.code === airport.code && <Check size={16}/>}
            </button>)}
            {filtered.length === 0 && <p className="empty-results">No matching airport in this starter dataset.</p>}
          </div>
          <div className="popover-foot">Popular airports · curated reference data</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </div>;
}

function DatePicker({ label, value, onChange, minDate, placeholder }: { label: string; value?: Date; onChange: (date: Date | undefined) => void; minDate?: Date; placeholder: string }) {
  const [open, setOpen] = useState(false);
  return <div className="field">
    <label>{label}</label>
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild><button type="button" className={"date-trigger " + (!value ? "date-empty" : "")}><CalendarDays size={18}/><span>{value ? format(value, "EEE, d MMM yyyy") : placeholder}</span><ChevronDown size={15} className="muted-icon"/></button></Popover.Trigger>
      <Popover.Portal><Popover.Content className="calendar-popover" sideOffset={8} align="start">
        <DayPicker mode="single" selected={value} onSelect={(day) => { onChange(day); if (day) setOpen(false); }} disabled={minDate ? { before: minDate } : { before: startOfDay(new Date()) }} startMonth={new Date()} defaultMonth={value ?? minDate ?? new Date()} showOutsideDays fixedWeeks />
        <div className="calendar-foot"><button type="button" onClick={() => { onChange(undefined); setOpen(false); }}>Clear date</button><button type="button" onClick={() => { onChange(addDays(new Date(), 7)); setOpen(false); }}>Next week</button></div>
      </Popover.Content></Popover.Portal>
    </Popover.Root>
  </div>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="field"><label>{label}</label><Select.Root value={value} onValueChange={onChange}>
    <Select.Trigger className="select-trigger"><Select.Value/><Select.Icon><ChevronDown size={16} className="muted-icon"/></Select.Icon></Select.Trigger>
    <Select.Portal><Select.Content className="select-content" position="popper" sideOffset={6}><Select.Viewport>{options.map((option) => <Select.Item key={option} value={option} className="select-item"><Select.ItemText>{option}</Select.ItemText><Select.ItemIndicator><Check size={15}/></Select.ItemIndicator></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal>
  </Select.Root></div>;
}

export default function App() {
  const [service, setService] = useState<Service>("flights");
  const [requestType, setRequestType] = useState("Family holiday");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trip, setTrip] = useState<TripType>("round-trip");
  const [origin, setOrigin] = useState(airports.find((a) => a.code === "KHI")!);
  const [destination, setDestination] = useState(airports.find((a) => a.code === "JED")!);
  const [depart, setDepart] = useState<Date | undefined>(addDays(new Date(), 30));
  const [returnDate, setReturnDate] = useState<Date | undefined>(addDays(new Date(), 37));
  const [cabin, setCabin] = useState("Economy");
  const [airline, setAirline] = useState("Any airline");
  const [passengers, setPassengers] = useState({ adults: 2, children: 0, infants: 0 });
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Assalamu alaikum! I can help you shape your travel inquiry. What are you planning?" }
  ]);
  const [chatBusy, setChatBusy] = useState(false);
  const active = serviceMeta[service];

  function selectService(next: Service) {
    setService(next); setDrawerOpen(false); setNotice("");
    setRequestType(next === "umrah" ? "Umrah pilgrimage" : next === "visa" ? "Visa guidance" : next === "hotels" ? "Accommodation" : next === "travel" ? "Family holiday" : "Round trip");
  }
  function changePassenger(key: keyof typeof passengers, delta: number) {
    setPassengers((p) => ({ ...p, [key]: Math.max(key === "adults" ? 1 : 0, Math.min(key === "infants" ? p.adults : 9, p[key] + delta)) }));
  }
  async function sendMessage(message?: string) {
    const value = (message ?? chatInput).trim();
    if (!value || chatBusy) return;
    setChatMessages((m) => [...m, { role: "user", content: value }]);
    setChatInput(""); setChatBusy(true);
    try {
      const reply = await sendTravelMessage(value, { surface: "kamal-express-pwa", service, locale: "en-PK" }, chatMessages);
      setChatMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (error) {
      setChatMessages((m) => [...m, { role: "assistant", content: error instanceof Error ? error.message : "The assistant is unavailable. Please try again." }]);
    } finally { setChatBusy(false); }
  }
  function submitInquiry(e: FormEvent) {
    e.preventDefault();
    if (service === "flights") {
      if (origin.code === destination.code) { setNotice("Choose different departure and destination airports."); return; }
      if (!depart) { setNotice("Please select a departure date."); return; }
      if (trip === "round-trip" && (!returnDate || returnDate < depart)) { setNotice("Choose a return date on or after your departure."); return; }
    }
    const ref = "KE-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setNotice("Demo inquiry prepared · " + ref + ". Nothing has been booked or sent to the travel team.");
  }

  const navItems: Service[] = ["travel", "flights", "visa", "umrah", "hotels"];
  const renderNav = (mobile = false) => navItems.map((id) => {
    const meta = serviceMeta[id]; const Icon = meta.icon;
    return <button key={id} className={"nav-item " + (service === id ? "nav-active" : "")} onClick={() => selectService(id)}><Icon size={19}/><span>{id === "travel" ? "Travel assistant" : id === "flights" ? "Flights" : id === "visa" ? "Visa services" : id === "umrah" ? "Umrah packages" : "Hotels & stays"}</span>{mobile && service === id && <span className="nav-dot"/>}</button>;
  });

  return <div className="app-shell">
    {drawerOpen && <button className="drawer-scrim" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}/>}
    <aside className={"sidebar " + (drawerOpen ? "sidebar-open" : "")}>
      <div className="brand"><img className="brand-logo" src="https://kamalexpress.com.pk/logo.jpeg" alt="Kamal Express" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span className="brand-tagline">Travel, thoughtfully planned</span><button className="icon-button drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><X size={21}/></button></div>
      <div className="nav-section-label">YOUR JOURNEY</div><nav className="nav-list">{renderNav(true)}</nav>
      <div className="sidebar-spacer"/>
      <div className="support-card"><span className="support-icon"><MessageCircle size={18}/></span><strong>Prefer personal help?</strong><p>Our team can help you choose the right next step.</p><button onClick={() => sendMessage("I'd like to speak with a travel expert.")}>Talk to our team <ArrowRight size={15}/></button></div>
      <div className="sidebar-footer"><ShieldCheck size={15}/> Secure, guided travel inquiries</div>
    </aside>

    <main className="main-shell">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button menu-button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation"><Menu size={22}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><strong>{active.title}</strong></div></div>
        <div className="topbar-right"><span className="demo-pill"><span/> Review build</span><button className="help-button" onClick={() => sendMessage("Can you help me plan my trip?")}><CircleHelp size={17}/><span>Help</span></button><span className="profile-avatar">KE</span></div>
      </header>

      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> YOUR JOURNEY STARTS HERE</div><h1>Where would you like to go?</h1><p>Thoughtful travel planning starts with a few details. We’ll help you take it from there.</p></div><div className="welcome-art"><Globe2 size={26}/><span>Made for your journey</span></div></section>

        <section className="inspiration-strip" aria-label="Travel inspiration">
          <button type="button" className="inspiration-card inspiration-flight" onClick={() => selectService("flights")}>
            <img src="https://images.pexels.com/photos/12955787/pexels-photo-12955787.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Airplane seen through airport terminal windows" loading="lazy" />
            <span className="inspiration-overlay"><small>YOUR NEXT ADVENTURE</small><strong>Find your flight</strong><span>Explore routes <ArrowRight size={14}/></span></span>
          </button>
          <button type="button" className="inspiration-card inspiration-umrah" onClick={() => selectService("umrah")}>
            <img src="https://images.pexels.com/photos/35564285/pexels-photo-35564285/free-photo-of-kaaba-during-hajj-pilgrimage-at-masjid-al-haram.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Pilgrims gathered around the Kaaba in Makkah" loading="lazy" />
            <span className="inspiration-overlay"><small>A MEANINGFUL JOURNEY</small><strong>Plan your Umrah</strong><span>Explore options <ArrowRight size={14}/></span></span>
          </button>
          <button type="button" className="inspiration-card inspiration-holiday" onClick={() => selectService("travel")}>
            <img src="https://images.pexels.com/photos/17159660/pexels-photo-17159660/free-photo-of-people-enjoying-vacation-on-exotic-beach.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Tropical beach with palm trees" loading="lazy" />
            <span className="inspiration-overlay"><small>MAKE TIME FOR YOU</small><strong>Discover somewhere new</strong><span>Plan a getaway <ArrowRight size={14}/></span></span>
          </button>
        </section>
        <div className="photo-credit">Travel inspiration photos from <a href="https://www.pexels.com/photo/an-airplane-departing-from-the-airport-12955787/" target="_blank" rel="noreferrer">Atlantic Ambience</a>, <a href="https://www.pexels.com/photo/kaaba-during-hajj-pilgrimage-at-masjid-al-haram-35564285/" target="_blank" rel="noreferrer">Fatih Turan</a> and <a href="https://www.pexels.com/photo/people-enjoying-vacation-on-exotic-beach-17159660/" target="_blank" rel="noreferrer">Kraken Media</a> on <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">Pexels</a>.</div>
        <section className="service-grid" aria-label="Travel services">
          {(["flights", "visa", "umrah", "hotels", "travel"] as Service[]).map((id) => {
            const meta = serviceMeta[id]; const Icon = meta.icon;
            return <button key={id} className={"service-card " + (service === id ? "service-card-active" : "")} onClick={() => selectService(id)}><span className={"service-icon icon-" + id}><Icon size={21}/></span><span className="service-copy"><strong>{id === "travel" ? "Travel assistant" : meta.title}</strong><small>{meta.subtitle}</small></span><ArrowRight size={16} className="service-arrow"/></button>;
          })}
        </section>

        <div className="workspace-grid">
          <section className="booking-card">
            <div className="card-heading"><div><span className="card-eyebrow">PLAN WITH CONFIDENCE</span><h2>{service === "flights" ? "Find your flight" : service === "travel" ? "Plan your journey" : service === "visa" ? "Visa assistance" : service === "umrah" ? "Plan your Umrah" : "Find your stay"}</h2><p>{service === "flights" ? "Tell us where and when you want to travel." : "Share a few details so we can guide you to the right next step."}</p></div><span className="step-chip"><span/> Your inquiry</span></div>

            <form className="booking-form" onSubmit={submitInquiry}>
              {service === "flights" ? <>
                <div className="trip-switch" role="group" aria-label="Trip type">{([{id:"round-trip",label:"Round trip"},{id:"one-way",label:"One way"},{id:"multi-city",label:"Multi-city"}] as {id:TripType;label:string}[]).map((item) => <button type="button" key={item.id} className={trip === item.id ? "trip-selected" : ""} onClick={() => setTrip(item.id)}>{item.label}</button>)}</div>
                <div className="route-fields"><AirportPicker label="FROM" value={origin} onChange={setOrigin} exclude={destination.code}/><button type="button" className="swap-button" aria-label="Swap airports" onClick={() => {setOrigin(destination);setDestination(origin);}}><ArrowDownUp size={17}/></button><AirportPicker label="TO" value={destination} onChange={setDestination} exclude={origin.code}/></div>
                <div className="form-row"><DatePicker label="DEPARTURE" value={depart} onChange={(d) => {setDepart(d); if (d && returnDate && returnDate < d) setReturnDate(addDays(d, 7));}} placeholder="Select departure" /><div className={trip === "one-way" ? "hidden-field" : ""}><DatePicker label="RETURN" value={returnDate} onChange={setReturnDate} minDate={depart} placeholder="Select return" /></div></div>
                <div className="form-row"><SelectField label="CABIN CLASS" value={cabin} onChange={setCabin} options={["Economy", "Premium economy", "Business", "First class"]}/><SelectField label="PREFERRED AIRLINE" value={airline} onChange={setAirline} options={["Any airline", "PIA", "Saudia", "Emirates", "Qatar Airways", "Etihad Airways", "Airblue", "Fly Jinnah", "Flynas"]}/></div>
                <div className="field"><label>TRAVELLERS</label><div className="passenger-grid">{([{id:"adults" as const,label:"Adults",detail:"12+ years"},{id:"children" as const,label:"Children",detail:"2–11 years"},{id:"infants" as const,label:"Infants",detail:"Under 2"}]).map((p) => <div className="passenger-item" key={p.id}><div><strong>{p.label}</strong><small>{p.detail}</small></div><div className="stepper"><button type="button" aria-label={"Remove " + p.label} disabled={passengers[p.id] <= (p.id === "adults" ? 1 : 0)} onClick={() => changePassenger(p.id, -1)}><Minus size={14}/></button><span>{passengers[p.id]}</span><button type="button" aria-label={"Add " + p.label} disabled={passengers[p.id] >= 9 || (p.id === "infants" && passengers.infants >= passengers.adults)} onClick={() => changePassenger(p.id, 1)}><Plus size={14}/></button></div></div>)}</div></div>
              </> : <>
                <div className="form-row"><SelectField label="DESTINATION" value={destination.country} onChange={(country) => {const match = airports.find((a) => a.country === country); if (match) setDestination(match);}} options={Array.from(new Set(airports.map((a) => a.country))).sort()}/><SelectField label="REQUEST TYPE" value={requestType} onChange={setRequestType} options={service === "umrah" ? ["Umrah pilgrimage", "Ramadan Umrah", "Family Umrah"] : service === "visa" ? ["Visa guidance", "Appointment guidance", "Document checklist"] : service === "hotels" ? ["Accommodation", "Family room", "Near Haram"] : ["Family holiday", "Business trip", "Honeymoon", "Custom itinerary"]}/></div>
                <div className="form-row"><DatePicker label="PREFERRED START DATE" value={depart} onChange={setDepart} placeholder="Choose a date"/><DatePicker label="PREFERRED END DATE" value={returnDate} onChange={setReturnDate} minDate={depart} placeholder="Choose a date"/></div>
                <div className="field"><label>TRAVELLERS</label><div className="passenger-grid">{([{id:"adults" as const,label:"Adults",detail:"12+ years"},{id:"children" as const,label:"Children",detail:"2–11 years"},{id:"infants" as const,label:"Infants",detail:"Under 2"}]).map((p) => <div className="passenger-item" key={p.id}><div><strong>{p.label}</strong><small>{p.detail}</small></div><div className="stepper"><button type="button" disabled={passengers[p.id] <= (p.id === "adults" ? 1 : 0)} onClick={() => changePassenger(p.id,-1)}><Minus size={14}/></button><span>{passengers[p.id]}</span><button type="button" disabled={passengers[p.id] >= 9} onClick={() => changePassenger(p.id,1)}><Plus size={14}/></button></div></div>)}</div></div>
              </>}
              <div className="field"><label>ADDITIONAL DETAILS <span className="optional">(OPTIONAL)</span></label><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Budget, preferred timings, hotel preferences or any special requirements…"/></div>
              {notice && <div className={"notice " + (notice.startsWith("Choose") || notice.startsWith("Please") ? "notice-error" : "")} role="status">{notice}</div>}
              <button className="primary-button" type="submit"><span>Prepare inquiry</span><ArrowRight size={18}/></button>
              <p className="form-disclaimer"><ShieldCheck size={14}/> Demo only — no booking is made and no inquiry is sent.</p>
            </form>
          </section>

          <aside className="right-column">
            <section className="copilot-card"><div className="copilot-top"><span className="copilot-icon"><Bot size={21}/></span><span className="ai-label"><span/> {getCopilotStatus()}</span></div><h2>Your travel copilot</h2><p>Need a little inspiration? Start with a question and shape your plans as you go.</p><div className="suggestions">{[serviceMeta[service].prompt, "What should I prepare before travelling?", "Help me compare my options"].map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}<ArrowRight size={15}/></button>)}</div></section>
            <section className="chat-card"><div className="chat-heading"><span className="chat-avatar"><Sparkles size={17}/></span><div><strong>Ask a travel question</strong><small>Assistant preview</small></div><span className="online-dot"/></div><div className="chat-messages">{chatMessages.slice(-4).map((m, i) => <div key={i} className={"chat-message " + m.role}><span>{m.content}</span></div>)}{chatBusy && <div className="chat-message assistant"><span className="typing-dots">Thinking…</span></div>}</div><form className="chat-composer" onSubmit={(e) => {e.preventDefault();void sendMessage();}}><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about your trip…" aria-label="Ask a travel question"/><button type="submit" disabled={!chatInput.trim() || chatBusy} aria-label="Send message"><Send size={17}/></button></form><p className="chat-privacy">Avoid entering passport, payment or other sensitive details in this demo.</p></section>
            <div className="trust-row"><span><ShieldCheck size={17}/><b>Guided support</b></span><span><Users size={17}/><b>Human assistance</b></span></div>
          </aside>
        </div>
        <footer className="page-footer">Kamal Express <span>·</span> Travel, thoughtfully planned <span>·</span> Demo review build</footer>
      </div>
    </main>
  </div>;
}
