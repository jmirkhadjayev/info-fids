import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import {BrowserRouter} from 'react-router-dom';
import { 
  Search, 
  RefreshCw, 
  Plane,
  Clock,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Filter,
  Info,
  MapPin,
  ArrowRight,
  PlaneTakeoff,
  PlaneLanding,
  X,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudSun,
  CloudFog,
  Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchFlights, fetchAllFlights, Flight, FlightType } from './services/airportService';
import { fetchTashkentWeather, WeatherData } from './services/weatherService';
import { AIRPORT_TRANSLATIONS } from './constants/airports';

type Language = 'UZ' | 'RU' | 'EN';

const translations = {
  EN: {
    welcome: 'WELCOME TO',
    airportName: 'TASHKENT',
    subtitle: 'International Airport Information Board',
    departures: 'DEPARTURES',
    arrivals: 'ARRIVALS',
    departuresSub: 'Flight departure information',
    arrivalsSub: 'Flight arrival information',
    viewSchedule: 'View Schedule',
    allBoard: 'All Board',
    localTime: 'Local (TAS)',
    weather: 'Weather',
    scheduled: 'Scheduled',
    actual: 'Actual',
    city: 'City',
    road: 'Road',
    flight: 'Flight',
    airline: 'Airline',
    status: 'Status',
    noFlights: 'No flights found',
    noFlightsSub: 'Try adjusting your search or filters',
    from: 'From',
    to: 'To',
    scheduledTime: 'Scheduled Time',
    actualTime: 'Actual Time',
    utcTimeLabel: 'UTC Time',
    terminal: 'Terminal',
    tailNumber: 'Tail Number',
    closeDetails: 'Close Details',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact Us',
    departure: 'Departure',
    arrival: 'Arrival',
    statuses: {
      'Scheduled': 'Scheduled',
      'Departed': 'Departed',
      'Cancelled': 'Cancelled',
      'Delayed': 'Delayed',
      'Arrived': 'Arrived',
      'Landed': 'Landed',
      'Boarding': 'Boarding',
      'Check-in': 'Check-in',
      'ARRIVAL': 'Arrival'
    }
  },
  RU: {
    welcome: 'ДОБРО ПОЖАЛОВАТЬ В',
    airportName: 'ТАШКЕНТ',
    subtitle: 'Информационное табло международного аэропорта',
    departures: 'ВЫЛЕТЫ',
    arrivals: 'ПРИЛЕТЫ',
    departuresSub: 'Информация о вылетах рейсов',
    arrivalsSub: 'Информация о прилетах рейсов',
    viewSchedule: 'Посмотреть расписание',
    allBoard: 'Все рейсы',
    localTime: 'Местное (TAS)',
    weather: 'Погода',
    scheduled: 'По расписанию',
    actual: 'Фактическое',
    city: 'Город',
    road: 'Путь',
    flight: 'Рейс',
    airline: 'Авиакомпания',
    status: 'Статус',
    noFlights: 'Рейсы не найдены',
    noFlightsSub: 'Попробуйте изменить поиск или фильтры',
    from: 'Откуда',
    to: 'Куда',
    scheduledTime: 'Время по расписанию',
    actualTime: 'Фактическое время',
    utcTimeLabel: 'Время UTC',
    terminal: 'Терминал',
    tailNumber: 'Бортовой номер',
    closeDetails: 'Закрыть детали',
    privacy: 'Политика конфиденциальности',
    terms: 'Условия использования',
    contact: 'Связаться с нами',
    departure: 'Вылет',
    arrival: 'Прилет',
    statuses: {
      'Scheduled': 'По расписанию',
      'Departed': 'Вылетел',
      'Cancelled': 'Отменен',
      'Delayed': 'Задерживается',
      'Arrived': 'Прибыл',
      'Landed': 'Приземлился',
      'Boarding': 'Посадка',
      'Check-in': 'Регистрация',
      'ARRIVAL': 'Прибытие'
    }
  },
  UZ: {
    welcome: 'XUSH KELIBSIZ',
    airportName: 'TOSHKENTGA',
    subtitle: 'Xalqaro aeroport maʼlumotlar paneli',
    departures: 'UCHIB KETISH',
    arrivals: 'UCHIB KELISH',
    departuresSub: 'Uchib ketish maʼlumotlari',
    arrivalsSub: 'Uchib kelish maʼlumotlari',
    viewSchedule: 'Jadvalni koʻrish',
    allBoard: 'Barcha reyslar',
    localTime: 'Mahalliy (TAS)',
    weather: 'Ob-havo',
    scheduled: 'Reja boʻyicha',
    actual: 'Aniq vaqt',
    city: 'Shahar',
    road: 'Yoʻnalish',
    flight: 'Reys',
    airline: 'Aviakompaniya',
    status: 'Holat',
    noFlights: 'Reyslar topilmadi',
    noFlightsSub: 'Qidiruv yoki filtrlarni oʻzgartirib koʻring',
    from: 'Qayerdan',
    to: 'Qayerga',
    scheduledTime: 'Reja vaqti',
    actualTime: 'Aniq vaqt',
    utcTimeLabel: 'UTC vaqti',
    terminal: 'Terminal',
    tailNumber: 'Bort raqami',
    closeDetails: 'Yopish',
    privacy: 'Maxfiylik siyosati',
    terms: 'Foydalanish shartlari',
    contact: 'Biz bilan bogʻlanish',
    departure: 'Ketish',
    arrival: 'Kelish',
    statuses: {
      'Scheduled': 'Reja boʻyicha',
      'Departed': 'Uchib ketgan',
      'Cancelled': 'Bekor qilingan',
      'Delayed': 'Kechikmoqda',
      'Arrived': 'Uchib keldi',
      'Landed': 'Qoʻngan',
      'Boarding': 'Chiqish',
      'Check-in': 'Roʻyxatdan oʻtish',
      'ARRIVAL': 'Uchib keldi'
    }
  }
};

function AirportBoard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filterType, setFilterType] = useState<FlightType | 'ALL'>('ALL');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('UZ');
  const flightRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // No longer derivation from URL, managed by state or simplified
  const activeTab = filterType;
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [modalTab, setModalTab] = useState<'INFO' | 'CARGO'>('INFO');
  const [isFidsMode, setIsFidsMode] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const t = translations[currentLanguage];

  // Automatic Language Rotation every 5 seconds
  useEffect(() => {
    const langs: Language[] = ['UZ', 'RU', 'EN'];
    const timer = setInterval(() => {
      setCurrentLanguage(prev => {
        const currentIndex = langs.indexOf(prev);
        const nextIndex = (currentIndex + 1) % langs.length;
        return langs[nextIndex];
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync state with URL path and mode
  useEffect(() => {
    const path = location.pathname;
    if (path === '/departures') setFilterType('DEPARTURE');
    else if (path === '/arrivals') setFilterType('ARRIVAL');
    else if (path === '/all') setFilterType('ALL');

    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'fids') {
      setIsFidsMode(true);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!selectedFlight) setModalTab('INFO');
  }, [selectedFlight]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadWeather = async () => {
    const data = await fetchTashkentWeather();
    if (data) setWeather(data);
  };

  useEffect(() => {
    loadWeather();
    const weatherTimer = setInterval(loadWeather, 600000); // 10 minutes
    return () => clearInterval(weatherTimer);
  }, []);

  const scrollToCurrentFlight = () => {
    if (flights.length === 0 || search) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let closestFlightId = '';
    let minDiff = Infinity;

    flights.forEach((f, idx) => {
      if (!f.scheduled_time) return;
      const [hours, minutes] = f.scheduled_time.split(':').map(Number);
      const flightMinutes = hours * 60 + minutes;
      const diff = Math.abs(currentMinutes - flightMinutes);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestFlightId = `${f.flight_number}-${idx}`;
      }
    });

    if (closestFlightId && flightRefs.current[closestFlightId]) {
      flightRefs.current[closestFlightId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const getAirlineLogo = (flight: Flight) => {
    if (!flight) return '';
    return flight.logo_url || `https://images.kiwi.com/airlines/64/${flight.airline_code}.png`;
  };

  const loadFlights = async (silent = false) => {
    if (!silent) setLoading(true);
    // Fetch all flights regardless of active tab
    const data = await fetchAllFlights();
    setFlights(data);
    if (!silent) {
        setLoading(false);
        setTimeout(scrollToCurrentFlight, 500);
    }
  };

  useEffect(() => {
    loadFlights();
    const interval = setInterval(() => loadFlights(true), 30000);
    return () => clearInterval(interval);
  }, []); // Remove dependency on activeTab

  const filteredFlights = useMemo(() => {
    const now = new Date();
    const minTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return flights.filter(f => {
      const matchesSearch = f.flight_number?.toLowerCase().includes(search.toLowerCase()) ||
                            f.destination_city?.toLowerCase().includes(search.toLowerCase()) ||
                            f.airline_name?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'ALL' || f.type === filterType;
      
      // Filter by time window: 2 hours before and 24 hours after
      let inTimeWindow = true;
      if (f.date && f.scheduled_time && f.scheduled_time !== '--:--') {
        const flightDate = new Date(`${f.date}T${f.scheduled_time}:00+05:00`);
        inTimeWindow = flightDate >= minTime && flightDate <= maxTime;
      }

      return matchesSearch && matchesFilter && inTimeWindow;
    });
  }, [flights, search, filterType, currentTime]);

  // Auto-scroll logic for FIDS mode
  useEffect(() => {
    if (!isFidsMode || loading || filteredFlights.length === 0) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    const scrollSpeed = 0.05; // Pixels per ms

    const scroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        
        if (scrollTop + clientHeight >= scrollHeight - 2) {
          // Reset to top with a pause
          setTimeout(() => {
            if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            startTime = null;
          }, 5000);
          return;
        }

        scrollContainerRef.current.scrollTop = progress * scrollSpeed;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isFidsMode, loading, filteredFlights.length]);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('cancelled') || s.includes('bekor') || s.includes('delayed')) {
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    }
    if (s.includes('arrival')) {
      return 'bg-[#03AC13]/10 text-[#03AC13] border-[#03AC13]/20';
    }
    if (s.includes('landed') || s.includes('qo\'ndi') || s.includes('departed') || s.includes('arrived')) {
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    }
    if (s.includes('air') || s.includes('воздухе') || s.includes('boarding')) {
      return 'bg-airport-navy/10 text-airport-navy border-airport-navy/20';
    }
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const isLandingPage = location.pathname === '/';

  return (
    <div className={`min-h-screen bg-airport-light font-sans text-white ${isFidsMode ? 'fids-mode overflow-hidden h-screen flex flex-col' : ''}`}>
      {/* Tashkent Airport Style Header */}
      <header className={`bg-airport-navy text-white px-4 md:px-6 sticky top-0 z-50 shadow-lg overflow-hidden border-b border-white/5 ${isFidsMode ? 'py-16 md:py-24' : 'py-1 md:py-1.5'}`}>

        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-airport-gold rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 px-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div 
                className="h-10 md:h-14 flex items-center cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => navigate('/')}
              >
                <img src="/logo1.png" alt="Uzbekistan Airports" className={`${isFidsMode ? 'h-32 md:h-48' : 'h-full'} w-auto object-contain`} />
              </div>
            </div>
            
            {!isLandingPage && (
              <button 
                onClick={loadFlights}
                className={`md:hidden p-1.5 bg-white/5 rounded-lg border border-white/10 ${loading ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={12} />
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-8">
            {/* Language Switcher Display */}
            <div className="flex gap-2">
              {(['UZ', 'RU', 'EN'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setCurrentLanguage(lang)}
                  className={`px-2 py-1 rounded text-[10px] font-black transition-all ${currentLanguage === lang ? 'bg-airport-gold text-airport-navy' : 'text-gray-400 hover:text-white bg-white/5'}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 md:gap-12">
              <div className="flex flex-col items-start md:items-end">
                <span className={`text-gray-400 uppercase font-black tracking-widest ${isFidsMode ? 'text-4xl' : 'text-[8px] md:text-[11px]'}`}>{t.localTime}</span>
                <span className={`font-black text-white leading-none ${isFidsMode ? 'text-9xl mt-4' : 'text-lg md:text-3xl'}`}>
                  {new Intl.DateTimeFormat('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Asia/Tashkent'
                  }).format(currentTime)}
                </span>
              </div>
              <div className={`bg-white/10 ${isFidsMode ? 'w-1 h-20' : 'w-px h-8'}`} />
              <div className="flex flex-col items-end">
                <span className={`text-gray-400 uppercase font-black tracking-widest ${isFidsMode ? 'text-xl' : 'text-[8px] md:text-[11px]'}`}>{(t as any).weather}</span>
                <div className="flex items-center gap-2">
                  {weather ? (
                    <>
                      {(() => {
                        const Icon = {
                          Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun, CloudFog
                        }[weather.icon] || Cloud;
                        return <Icon size={isFidsMode ? 96 : 20} className="text-airport-gold" />;
                      })()}
                      <span className={`font-black text-airport-gold leading-none ${isFidsMode ? 'text-8xl mt-4' : 'text-sm md:text-xl'}`}>
                        {weather.temp}°C
                      </span>
                    </>
                  ) : (
                    <span className={`font-black text-airport-gold leading-none ${isFidsMode ? 'text-5xl mt-1' : 'text-sm md:text-xl'}`}>
                      --°C
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isLandingPage && (
              <>
                {/* Ultra Compact Tabs */}
                <div className="flex bg-white/5 p-0.5 rounded-sm border border-white/10">
                  {[
                    { id: 'ALL', label: t.allBoard, icon: Filter },
                    { id: 'DEPARTURE', label: t.departures, icon: PlaneTakeoff },
                    { id: 'ARRIVAL', label: t.arrivals, icon: PlaneLanding },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        const path = tab.id === 'DEPARTURE' ? '/departures' : (tab.id === 'ARRIVAL' ? '/arrivals' : '/all');
                        navigate(path);
                      }}
                      className={`px-2.5 md:px-3.5 py-1 rounded-[1px] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                        filterType === tab.id 
                          ? 'bg-airport-gold text-airport-navy shadow-sm' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon size={11} className={filterType === tab.id ? 'text-airport-navy' : 'text-airport-gold'} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.id === 'ALL' ? 'ALL' : (tab.id === 'DEPARTURE' ? 'DEP' : 'ARR')}</span>
                    </button>
                  ))}
                </div>

                <div className="hidden lg:flex items-center gap-2">
                  <button 
                    onClick={() => setIsFidsMode(!isFidsMode)}
                    className={`p-1.5 transition-all border rounded-lg ${isFidsMode ? 'bg-airport-gold text-airport-navy border-airport-gold' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                    title={isFidsMode ? "Exit FIDS Mode" : "Enter FIDS Mode"}
                  >
                    <Info size={14} />
                  </button>
                  <button 
                    onClick={loadFlights}
                    className={`p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 ${loading ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

              </>
            )}
          </div>
        </div>

        {/* Flight List Header integrated into Blue Header */}
        {(location.pathname === '/all' || location.pathname === '/departures' || location.pathname === '/arrivals') && (
          <div className={`hidden md:grid mt-4 max-w-full mx-auto gap-2 px-6 py-2 font-black uppercase tracking-widest text-gray-300 border-t border-white/10 ${isFidsMode ? 'grid-cols-[1fr_1fr_1.5fr_1.5fr_3fr_1.3fr] text-4xl py-12 mb-4' : 'grid-cols-[0.8fr_0.8fr_1.5fr_1fr_2fr_1fr] text-[9px]'}`}>
            <div>{t.scheduled}</div>
            <div>{t.actual}</div>
            <div>{t.city}</div>
            <div>{t.flight}</div>
            <div>{t.airline}</div>
            <div className="text-left">{t.status}</div>
          </div>
        )}
      </header>

      <main 
        ref={scrollContainerRef}
        className={`max-w-full mx-auto px-6 py-6 ${isFidsMode ? 'flex-1 overflow-y-auto no-scrollbar pb-20' : ''}`}
      >

        <Routes>
          <Route path="/" element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-12 py-20">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center mb-8">
                  <div className="h-24 md:h-32 bg-airport-navy p-4 rounded-3xl shadow-2xl flex items-center justify-center">
                    <img src="/logo1.png" alt="Uzbekistan Airports Logo" className="h-full w-auto object-contain" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                  {t.welcome} <span className="text-airport-gold">{t.airportName}</span>
                </h2>
                <p className="text-gray-300 font-bold uppercase tracking-[0.3em] text-sm md:text-lg">
                  {t.subtitle}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-6">
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                  onClick={() => {
                    navigate('/departures');
                  }}
                  className="group relative overflow-hidden bg-white text-gray-900 border-2 border-airport-navy/5 rounded-[40px] p-12 flex flex-col items-center gap-6 shadow-xl hover:shadow-2xl hover:border-airport-gold/50 transition-all"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <PlaneTakeoff size={180} className="-rotate-12" />
                  </div>
                  <div className="w-24 h-24 bg-airport-navy rounded-3xl flex items-center justify-center shadow-lg group-hover:bg-airport-gold transition-colors">
                    <PlaneTakeoff size={48} className="text-airport-gold group-hover:text-airport-navy transition-colors" />
                  </div>
                  <div className="text-center relative z-10">
                    <h3 className="text-3xl font-black text-airport-navy mb-2">{t.departures}</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t.departuresSub}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-airport-navy font-black text-sm uppercase tracking-widest group-hover:text-airport-gold transition-colors">
                    {t.viewSchedule} <ChevronRight size={16} />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    navigate('/arrivals');
                  }}
                  className="group relative overflow-hidden bg-airport-navy rounded-[40px] p-12 flex flex-col items-center gap-6 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <PlaneLanding size={180} className="rotate-12" />
                  </div>
                  <div className="w-24 h-24 bg-airport-gold rounded-3xl flex items-center justify-center shadow-lg">
                    <PlaneLanding size={48} className="text-airport-navy" />
                  </div>
                  <div className="text-center relative z-10">
                    <h3 className="text-3xl font-black text-white mb-2">{t.arrivals}</h3>
                    <p className="text-gray-300/60 font-bold uppercase tracking-widest text-xs">{t.arrivalsSub}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-airport-gold font-black text-sm uppercase tracking-widest group-hover:text-white transition-colors">
                    {t.viewSchedule} <ChevronRight size={16} />
                  </div>
                </motion.button>
              </div>
            </div>
          } />
          {['/all', '/departures', '/arrivals'].map(path => (
            // @ts-ignore
            <Route key={path} path={path} element={
              <div className="space-y-2">
                {loading ? (
                  Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="bg-white h-16 rounded-xl animate-pulse border border-gray-100 shadow-sm"></div>
                  ))
                ) : filteredFlights.length > 0 ? (
                  filteredFlights.map((flight, idx) => {
                    const showDateSeparator = idx === 0 || flight.date !== filteredFlights[idx - 1].date;
                    
                    return (
                      <Fragment key={`${flight.flight_number}-${idx}`}>
                        {showDateSeparator && (
                          <div className="flex items-center gap-3 py-4 px-4">
                            <div className="flex-1 h-px bg-airport-navy/10" />
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-airport-navy text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md border border-white/5">
                              <Calendar size={12} className="text-airport-gold" />
                              {new Date(flight.date).toLocaleDateString(currentLanguage === 'UZ' ? 'uz-UZ' : (currentLanguage === 'RU' ? 'ru-RU' : 'en-GB'), { day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex-1 h-px bg-airport-navy/10" />
                          </div>
                        )}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => setSelectedFlight(flight)}
                          ref={el => flightRefs.current[`${flight.flight_number}-${idx}`] = el}
                          className={`bg-white text-gray-900 rounded-xl shadow-sm transition-all cursor-pointer group ${
                            isFidsMode ? 'p-10 mb-6 border-2 border-gray-200' : 'p-2 md:px-6 md:py-2 border'
                          } ${
                            // Highlight if within 15 minutes of current time in Tashkent
                            (() => {
                              const [h, m] = (flight.scheduled_time || "00:00").split(':').map(Number);
                              const fMin = h * 60 + m;
                              
                              // Get current time in Tashkent
                              const tasTimeStr = currentTime.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' });
                              const tasDate = new Date(tasTimeStr);
                              const curMin = tasDate.getHours() * 60 + tasDate.getMinutes();
                              
                              return Math.abs(fMin - curMin) <= 15 ? 'border-airport-gold ring-2 ring-airport-gold/20 scale-[1.01] z-10' : (isFidsMode ? 'border-gray-200 hover:border-airport-gold' : 'border-gray-100 hover:shadow-md hover:border-airport-navy/10');
                            })()
                          }`}
                        >
                          <div className={`grid grid-cols-1 gap-2 items-center ${isFidsMode ? 'grid-cols-[1fr_1fr_1.5fr_1.5fr_3fr_1.3fr]' : 'md:grid-cols-[0.8fr_0.8fr_1.5fr_1fr_2fr_1fr]'}`}>
                            {/* Scheduled */}
                            <div className="flex flex-col">
                              <span className={`font-black text-airport-navy ${isFidsMode ? 'text-9xl mb-4' : 'text-base'}`}>{flight.scheduled_time}</span>
                              <span className={`${isFidsMode ? 'text-2xl' : 'text-[8px]'} font-bold text-gray-400 uppercase leading-none`}>{t.scheduled}</span>
                            </div>

                            {/* Actual time */}
                            <div className="flex flex-col">
                              <span className={`font-black ${isFidsMode ? 'text-9xl mb-4' : 'text-base'} ${flight.fact ? 'text-airport-green' : 'text-airport-gold'}`}>
                                {flight.fact || flight.estimated_time || '--:--'}
                              </span>
                              <span className={`${isFidsMode ? 'text-2xl' : 'text-[8px]'} font-bold text-gray-400 uppercase leading-none`}>{t.actual}</span>
                            </div>

                            {/* City */}
                            <div className="flex flex-col">
                              <span className={`font-black text-airport-navy line-clamp-1 ${isFidsMode ? 'text-6xl' : 'text-[13px]'}`}>
                                {AIRPORT_TRANSLATIONS[flight.destination_code || '']?.[currentLanguage.toLowerCase() as 'uz' | 'ru' | 'en'] || flight.destination_city || '---'}
                              </span>
                              <span className={`${isFidsMode ? 'text-2xl' : 'text-[8px]'} font-bold text-gray-400 uppercase leading-none`}>{t.city}</span>
                            </div>

                            {/* Flight Number & Type */}
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <span className={`font-black text-airport-navy whitespace-nowrap ${isFidsMode ? 'text-6xl' : 'text-[13px]'}`}>{flight.flight_number}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {flight.type === 'DEPARTURE' ? (
                                  <>
                                    <PlaneTakeoff size={isFidsMode ? 48 : 12} className="text-blue-600" />
                                    <span className={`${isFidsMode ? 'text-2xl' : 'text-[8px]'} font-black uppercase text-blue-600 bg-blue-50 px-3 rounded`}>{t.departure}</span>
                                  </>
                                ) : (
                                  <>
                                    <PlaneLanding size={isFidsMode ? 48 : 12} className="text-green-600" />
                                    <span className={`${isFidsMode ? 'text-2xl' : 'text-[8px]'} font-black uppercase text-green-600 bg-green-50 px-3 rounded`}>{t.arrival}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-left">
                              <div className={`bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 ${isFidsMode ? 'w-48 h-48' : 'w-8 h-8'}`}>
                                <img 
                                  src={getAirlineLogo(flight)} 
                                  alt={flight.airline_name}
                                  className="w-full h-full object-contain p-2"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/plane/64/64';
                                  }}
                                />
                              </div>
                              <span className={`font-black text-gray-800 leading-tight line-clamp-1 ${isFidsMode ? 'text-5xl' : 'text-[10px]'}`}>{flight.airline_name}</span>
                            </div>

                            {/* Status */}
                            <div className="flex justify-start">
                                <div className={`rounded-full border font-black uppercase tracking-wider whitespace-nowrap ${isFidsMode ? 'px-12 py-6 text-4xl shadow-xl' : 'px-2 py-0.5 text-[8px]'} ${getStatusStyle(flight.status)}`}>
                                  {(t as any).statuses?.[flight.status] || flight.status}
                                </div>
                            </div>
                          </div>
                        </motion.div>
                      </Fragment>
                    );
                  })
                ) : (
                  <div className="bg-white text-gray-900 rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Info size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t.noFlights}</h3>
                    <p className="text-gray-400">{t.noFlightsSub}</p>
                  </div>
                )}
              </div>
            } />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Flight Detail Modal */}
      <AnimatePresence>
        {selectedFlight && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFlight(null)}
              className="absolute inset-0 bg-airport-navy/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="bg-airport-navy text-white p-10 md:p-16 pb-0 md:pb-0">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                      <img 
                        src={getAirlineLogo(selectedFlight)} 
                        alt={selectedFlight.airline_name}
                        className="w-full h-full object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="text-5xl font-black tracking-tighter">{selectedFlight.flight_number}</h3>
                      <p className="text-lg text-gray-300 font-bold uppercase tracking-widest">{selectedFlight.airline_name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedFlight(null)}
                    className="p-4 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={32} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-8 mb-12">
                  <div className="flex-1">
                    <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest mb-3">{selectedFlight.type === 'ARRIVAL' ? t.from : t.from}</p>
                    <h4 className="text-6xl font-black mb-2">{selectedFlight.type === 'ARRIVAL' ? selectedFlight.destination_code : 'TAS'}</h4>
                    <p className="text-xl font-bold text-gray-300">
                      {selectedFlight.type === 'ARRIVAL' 
                        ? (AIRPORT_TRANSLATIONS[selectedFlight.destination_code || '']?.[currentLanguage.toLowerCase() as 'uz' | 'ru' | 'en'] || selectedFlight.destination_city || '---')
                        : (currentLanguage === 'UZ' ? 'Toshkent' : currentLanguage === 'RU' ? 'Ташкент' : 'Tashkent')
                      }
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-4 px-8">
                    <ArrowRight className="text-airport-gold" size={48} />
                    <div className={`px-6 py-2 rounded-full border text-[12px] font-black uppercase ${getStatusStyle(selectedFlight.status)}`}>
                      {(t as any).statuses?.[selectedFlight.status] || selectedFlight.status}
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest mb-3">{selectedFlight.type === 'ARRIVAL' ? t.to : t.to}</p>
                    <h4 className="text-6xl font-black mb-2">{selectedFlight.type === 'ARRIVAL' ? 'TAS' : selectedFlight.destination_code}</h4>
                    <p className="text-xl font-bold text-gray-300 truncate">
                      {selectedFlight.type === 'ARRIVAL' 
                        ? (currentLanguage === 'UZ' ? 'Toshkent' : currentLanguage === 'RU' ? 'Ташкент' : 'Tashkent')
                        : (AIRPORT_TRANSLATIONS[selectedFlight.destination_code || '']?.[currentLanguage.toLowerCase() as 'uz' | 'ru' | 'en'] || selectedFlight.destination_city || '---')
                      }
                    </p>
                  </div>
                </div>

                {/* Modal Info Content only */}
              </div>

              <div className="p-10 md:p-16">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                  <div className="space-y-2">
                    <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest">{t.scheduledTime}</p>
                    <p className="text-3xl font-black text-airport-navy">{selectedFlight.scheduled_time}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest">{t.actualTime}</p>
                    <p className={`text-3xl font-black ${selectedFlight.fact ? 'text-airport-green' : 'text-airport-gold'}`}>
                      {selectedFlight.fact || selectedFlight.estimated_time || '--:--'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest">{t.utcTimeLabel}</p>
                    <p className="text-3xl font-black text-gray-600">{selectedFlight.utc_time || '--:--'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest">{t.terminal}</p>
                    <p className="text-3xl font-black text-gray-600">T2</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest">{t.tailNumber}</p>
                    <p className="text-3xl font-black text-gray-600">{selectedFlight.tail_number || '---'}</p>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-gray-50 flex justify-center">
                <button 
                  onClick={() => setSelectedFlight(null)}
                  className="bg-airport-navy text-white px-16 py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-airport-gold hover:text-airport-navy transition-all shadow-lg"
                >
                  {t.closeDetails}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-airport-navy text-white py-20 px-10">
        <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-6">
            <div className="h-16 md:h-20 flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo1.png" alt="Uzbekistan Airports" className="h-full w-auto object-contain" />
            </div>
          </div>
          <div className="flex gap-16 text-sm font-black uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-airport-gold transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-airport-gold transition-colors">{t.terms}</a>
            <a href="#" className="hover:text-airport-gold transition-colors">{t.contact}</a>
          </div>
          <p className="text-[12px] text-gray-500 font-black uppercase tracking-widest">created by <a href="http://mirkhadjayev.uz/" target="_blank" rel="noopener noreferrer" className="hover:text-airport-gold transition-colors underline decoration-airport-gold/30 underline-offset-4">Jamshid Mirkhadjayev</a></p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AirportBoard />
    </BrowserRouter>
  );
}
