export interface Flight {
  flight_number: string;
  airline_name: string;
  airline_code: string;
  destination_city: string;
  scheduled_time: string;
  estimated_time: string;
  status: string;
  terminal?: string;
  stand?: string;
  cargo_weight?: number;
  mail_weight?: number;
  cargo_details?: string;
  aircraft_type?: string;
  tail_number?: string;
  actual_time?: string;
  utc_time?: string;
  destination_code?: string;
  delay_comment?: string;
  plan_opposite?: string;
  fact_opposite?: string;
  fact?: string;
  road?: string;
  date: string;
  type?: FlightType;
  logo_url?: string;
}

export type FlightType = 'DEPARTURE' | 'ARRIVAL';

const API_BASE_URL = 'https://bot.uzairports.com/api/awery/v2';
const KEY_TOKEN = 'lDLh3Wdawi7SLNtUn4iMA4QZn5SopdIZ';

const AIRLINE_MAPPING: Record<string, string> = {
  'HY': 'Uzbekistan Airways',
  'UH': 'Silk Avia',
  'C6': 'My Freighter',
  'HH': 'Qanot Sharq',
  'SU': 'Aeroflot',
  'KC': 'Air Astana',
  'TK': 'Turkish Airlines',
  'FZ': 'FlyDubai',
  'QR': 'Qatar Airways',
  'EY': 'Etihad Airways',
  'EK': 'Emirates',
  'S7': 'S7 Airlines',
  'U6': 'Ural Airlines',
  'UT': 'Utair',
  'DP': 'Pobeda',
  'J9': 'Jazeera Airways',
  'G9': 'Air Arabia',
  'XY': 'Flynas',
  'OD': 'Batik Air',
  'CZ': 'China Southern',
  'CA': 'Air China',
  'MU': 'China Eastern',
  'LO': 'LOT Polish Airlines',
  'FV': 'Rossiya Airlines',
  'J2': 'Azerbaijan Airlines',
  'KC ': 'Air Astana',
  'GJ': 'Zhejiang Loong Airlines',
  'KZ': 'TezJet Airlines',
  'ZZ': 'TezJet Airlines',
  '7Q': 'Fly One',
  'RED': 'Red Cross',
  'CC': 'Air Atlanta',
  '3S': 'AeroLogic',
};

// Map internal codes to IATA for logos if needed
const LOGO_CODE_MAPPING: Record<string, string> = {
  'UH': 'UH', 
  'C6': 'C6',
};

const CUSTOM_LOGOS: Record<string, string> = {
  'UH': 'https://silk-avia.com/img/logosilk.png',
  'C6': 'https://www.airfleets.net/cie/My%20Freighter.jpg',
};

const STATUS_MAPPING: Record<string, string> = {
  'SCH': 'Scheduled',
  'OFB': 'Departed',
  'CAN': 'Cancelled',
  'DELAYED': 'Delayed',
  'ARR': 'Arrived',
  'LND': 'Landed',
  'BOR': 'Boarding',
  'CKI': 'Check-in',
  'ONB': 'ARRIVAL',
};

const CITY_MAPPING: Record<string, string> = {
  'SSH': 'Sharm El Sheikh',
  'OQN': 'Zarafshan',
  'FRU': 'Bishkek',
  'TBS': 'Tbilisi',
  'NVI': 'Navoi',
  'TMJ': 'Termez',
  'BHK': 'Bukhara',
  'PAR': 'Paris',
  'ALA': 'Almaty',
  'MOW': 'Moscow',
  'UGC': 'Urgench',
  'LON': 'London',
  'DXB': 'Dubai',
  'RBZ': 'Muynak',
  'SIA': 'Xi\'an',
  'JED': 'Jeddah',
  'BAK': 'Baku',
  'TLV': 'Tel Aviv',
  'OVB': 'Novosibirsk',
  'TZX': 'Trabzon',
  'NMA': 'Namangan',
  'IST': 'Istanbul',
  'SZX': 'Shenzhen',
  'CGO': 'Zhengzhou',
  'URC': 'Urumqi',
  'CAN': 'Guangzhou',
  'ROM': 'Rome',
  'KZN': 'Kazan',
  'GOJ': 'Nizhny Novgorod',
  'SKD': 'Samarkand',
  'LED': 'Saint Petersburg',
  'SGC': 'Surgut',
  'NCU': 'Nukus',
  'SVX': 'Yekaterinburg',
  'MED': 'Medina',
  'URA': 'Uralsk',
  'HKG': 'Hong Kong',
  'NQZ': 'Astana',
  'SEL': 'Seoul',
  'BJS': 'Beijing',
  'VCA': 'Can Tho',
  'HKT': 'Phuket',
  'KJA': 'Krasnoyarsk',
  'NJC': 'Nizhnevartovsk',
  'KWI': 'Kuwait',
  'MSQ': 'Minsk',
  'EVN': 'Yerevan',
  'ESB': 'Ankara',
  'DAC': 'Dhaka',
  'KSQ': 'Karshi',
  'KRR': 'Krasnodar',
  'DYU': 'Dushanbe',
  'AZN': 'Andizhan',
  'DEL': 'Delhi',
  'LHE': 'Lahore',
  'RIX': 'Riga',
  'VVO': 'Vladivostok',
  'DWC': 'Dubai (DWC)',
  'IYO': 'SRS',
  'BKK': 'Bangkok',
  'THR': 'Tehran',
  'TFU': 'Chengdu',
  'FEG': 'Fergana',
  'MRV': 'Mineralnye Vody',
  'KUL': 'Kuala Lumpur',
  'ZIA': 'Zhukovsky',
  'WAW': 'Warsaw',
  'AER': 'Sochi',
  'OMN': 'Oman',
};

export async function fetchAllFlights(): Promise<Flight[]> {
  try {
    const [departures, arrivals] = await Promise.all([
      fetchFlights('DEPARTURE'),
      fetchFlights('ARRIVAL')
    ]);
    
    // Add a type flag to distinguish them
    const deps = departures.map(f => ({ ...f, type: 'DEPARTURE' as FlightType }));
    const arrs = arrivals.map(f => ({ ...f, type: 'ARRIVAL' as FlightType }));
    
    // Merge and sort by scheduled time
    return [...deps, ...arrs].sort((a, b) => {
      const timeA = a.date + 'T' + a.scheduled_time;
      const timeB = b.date + 'T' + b.scheduled_time;
      return timeA.localeCompare(timeB);
    });
  } catch (error) {
    console.error('Error fetching all flights:', error);
    return [];
  }
}

export async function fetchFlights(type: FlightType = 'DEPARTURE'): Promise<Flight[]> {
  const url = `${API_BASE_URL}?key_token=${KEY_TOKEN}&airport_code=TAS&flight_type=${type}&is_paxservice=0&is_local=0`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rawFlights = data.flights || [];

    return rawFlights.map((f: any) => {
      const airlineCode = (f.aircompany || '').trim().toUpperCase();
      const cityCode = (f.city_code || f.airport || '').trim().toUpperCase();

      const formatToTAS = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        try {
          const normalized = (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')) 
            ? dateStr + 'Z' 
            : dateStr;
          
          const date = new Date(normalized);
          if (isNaN(date.getTime())) throw new Error();

          return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Tashkent'
          }).format(date);
        } catch (e) {
          const parts = dateStr.split('T');
          return parts.length > 1 ? parts[1].substring(0, 5) : '';
        }
      };

      // Calculate UTC time for display in modal
      let utcTime = '--:--';
      if (f.sched) {
        try {
          const normalized = (f.sched.includes('T') && !f.sched.endsWith('Z') && !f.sched.includes('+')) 
            ? f.sched + 'Z' 
            : f.sched;
          const date = new Date(normalized);
          if (!isNaN(date.getTime())) {
            utcTime = new Intl.DateTimeFormat('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC'
            }).format(date);
          }
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }

      const airlineName = AIRLINE_MAPPING[airlineCode] || airlineCode;
      const logoCode = LOGO_CODE_MAPPING[airlineCode] || airlineCode;
      
      // Select the logo URL: Custom first, then fallback to Kiwi
      const logoUrl = CUSTOM_LOGOS[airlineCode] || `https://images.kiwi.com/airlines/64/${logoCode}.png`;

      return {
        flight_number: `${airlineCode} ${f.flightnumber}`,
        airline_name: airlineName,
        airline_code: logoCode,
        logo_url: logoUrl,
        destination_city: CITY_MAPPING[cityCode] || cityCode,
        destination_code: cityCode,
        scheduled_time: formatToTAS(f.sched) || '--:--',
        estimated_time: formatToTAS(f.estimated) || formatToTAS(f.plan) || '',
        actual_time: formatToTAS(f.actual) || '',
        utc_time: utcTime,
        status: STATUS_MAPPING[f.flight_status] || f.flight_status || 'Scheduled',
        terminal: f.terminal,
        stand: f.stand,
        cargo_weight: f.cargo_weight,
        mail_weight: f.mail_weight,
        cargo_details: f.cargo_weight ? `${f.cargo_weight} kg Cargo ${f.mail_weight ? `+ ${f.mail_weight} kg Mail` : ''}` : 'No cargo data',
        aircraft_type: f.aircraft_type || f.aircraft,
        tail_number: f.tail_number || f.registration,
        delay_comment: f.delay_comment || '',
        plan_opposite: formatToTAS(f.plan_opposite),
        fact_opposite: formatToTAS(f.fact_opposite),
        fact: formatToTAS(f.fact),
        road: type === 'DEPARTURE' ? `TAS - ${f.airport || ''}` : `${f.airport || ''} - TAS`,
        date: f.sched ? f.sched.split('T')[0] : '',
        type: type
      };
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
}
