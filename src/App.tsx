import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'framer-motion'
import {
  Award,
  Bell,
  Bookmark,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Coffee,
  Compass,
  Filter,
  Flame,
  Heart,
  Home,
  Leaf,
  MapPinned,
  MapPin,
  MessageCircle,
  Navigation,
  Plus,
  Search,
  Send,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import './App.css'

type City = 'Mumbai' | 'Bangalore'
type Tab = 'discover' | 'book' | 'feed'
type FilterKey = 'Friends' | 'Top rated' | 'Work friendly' | 'Matcha' | 'New drops'

type Drink = {
  id: string
  name: string
  style: string
  score: number
  notes: string[]
  price: string
}

type Cafe = {
  id: string
  name: string
  city: City
  neighborhood: string
  coords: [number, number]
  rating: number
  roaster: string
  vibe: string
  image: string
  friendSignal: string
  distance: string
  open: string
  tags: string[]
  drinks: Drink[]
}

type FriendPost = {
  id: string
  friend: string
  handle: string
  city: City
  avatar: string
  cafeId: string
  drink: string
  rating: number
  caption: string
  time: string
  image: string
  likes: number
  comments: number
  plan?: string
}

type BookEntry = {
  id: string
  cafeId: string
  drink: string
  rating: number
  date: string
  note: string
  flavor: string
}

const cityCenters: Record<City, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
}

const cafes: Cafe[] = [
  {
    id: 'm1',
    name: 'Subko Loop',
    city: 'Mumbai',
    neighborhood: 'Bandra West',
    coords: [19.0607, 72.8295],
    rating: 4.8,
    roaster: 'House roast',
    vibe: 'Leafy lane, serious bar',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85',
    friendSignal: 'Nisha and 8 friends saved this',
    distance: '1.8 km',
    open: 'Open until 11 PM',
    tags: ['Friends', 'Top rated', 'Matcha', 'New drops'],
    drinks: [
      {
        id: 'm1d1',
        name: 'Sea Salt Cold Brew',
        style: 'Cold brew',
        score: 4.9,
        notes: ['cacao', 'saline', 'round'],
        price: 'INR 290',
      },
      {
        id: 'm1d2',
        name: 'Ceremonial Matcha Cloud',
        style: 'Matcha',
        score: 4.7,
        notes: ['umami', 'silky', 'vanilla'],
        price: 'INR 310',
      },
    ],
  },
  {
    id: 'm2',
    name: 'Kala Ghoda Pour',
    city: 'Mumbai',
    neighborhood: 'Fort',
    coords: [18.9275, 72.832],
    rating: 4.6,
    roaster: 'Rotating micro-lots',
    vibe: 'Gallery crawl fuel',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
    friendSignal: 'Arjun checked in yesterday',
    distance: '6.4 km',
    open: 'Open until 9 PM',
    tags: ['Work friendly', 'Top rated'],
    drinks: [
      {
        id: 'm2d1',
        name: 'Ratnagiri V60',
        style: 'Pour over',
        score: 4.6,
        notes: ['jammy', 'floral', 'clean'],
        price: 'INR 340',
      },
      {
        id: 'm2d2',
        name: 'Oat Cortado',
        style: 'Milk coffee',
        score: 4.5,
        notes: ['silky', 'nutty', 'short'],
        price: 'INR 230',
      },
    ],
  },
  {
    id: 'm3',
    name: 'Byculla Brew Room',
    city: 'Mumbai',
    neighborhood: 'Byculla',
    coords: [18.9778, 72.8347],
    rating: 4.5,
    roaster: 'Single estate bar',
    vibe: 'Quiet booths, plant wall',
    image:
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85',
    friendSignal: '3 friends want to go',
    distance: '4.2 km',
    open: 'Open until 10 PM',
    tags: ['Friends', 'Work friendly', 'Matcha'],
    drinks: [
      {
        id: 'm3d1',
        name: 'Monsoon Malabar Flat White',
        style: 'Milk coffee',
        score: 4.5,
        notes: ['caramel', 'low acid', 'velvet'],
        price: 'INR 250',
      },
      {
        id: 'm3d2',
        name: 'Iced Matcha Lemonade',
        style: 'Matcha',
        score: 4.4,
        notes: ['grassy', 'bright', 'cold'],
        price: 'INR 280',
      },
    ],
  },
  {
    id: 'm4',
    name: 'Versova Manual Bar',
    city: 'Mumbai',
    neighborhood: 'Versova',
    coords: [19.1351, 72.8146],
    rating: 4.7,
    roaster: 'Coastal ferments',
    vibe: 'Post-surf social spot',
    image:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=85',
    friendSignal: 'Dev is going tonight',
    distance: '7.1 km',
    open: 'Open until midnight',
    tags: ['Friends', 'Matcha', 'New drops'],
    drinks: [
      {
        id: 'm4d1',
        name: 'Koji Ferment Espresso',
        style: 'Espresso',
        score: 4.8,
        notes: ['funky', 'plum', 'syrupy'],
        price: 'INR 320',
      },
      {
        id: 'm4d2',
        name: 'Coconut Matcha Cloud',
        style: 'Matcha',
        score: 4.6,
        notes: ['creamy', 'tropical', 'green'],
        price: 'INR 310',
      },
    ],
  },
  {
    id: 'b1',
    name: 'Indiranagar Dial-In',
    city: 'Bangalore',
    neighborhood: 'Indiranagar',
    coords: [12.9719, 77.6412],
    rating: 4.8,
    roaster: 'Weekly calibration',
    vibe: 'Bar seats, fast pours',
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=85',
    friendSignal: 'Meera and 6 friends loved this',
    distance: '900 m',
    open: 'Open until 11 PM',
    tags: ['Friends', 'Top rated'],
    drinks: [
      {
        id: 'b1d1',
        name: 'Anaerobic Cappuccino',
        style: 'Milk coffee',
        score: 4.9,
        notes: ['berry', 'custard', 'sweet'],
        price: 'INR 280',
      },
      {
        id: 'b1d2',
        name: 'Mango Espresso Fizz',
        style: 'Signature',
        score: 4.7,
        notes: ['mango', 'zingy', 'summer'],
        price: 'INR 310',
      },
    ],
  },
  {
    id: 'b2',
    name: 'Church Street Cupping Club',
    city: 'Bangalore',
    neighborhood: 'Church Street',
    coords: [12.9744, 77.6073],
    rating: 4.6,
    roaster: 'Guest roasters',
    vibe: 'Loud, social, central',
    image:
      'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=900&q=85',
    friendSignal: 'Asha posted 2 drinks here',
    distance: '2.7 km',
    open: 'Open until 10 PM',
    tags: ['Friends', 'Matcha', 'New drops'],
    drinks: [
      {
        id: 'b2d1',
        name: 'Washed V60 Flight',
        style: 'Tasting flight',
        score: 4.6,
        notes: ['orange', 'honey', 'clear'],
        price: 'INR 390',
      },
      {
        id: 'b2d2',
        name: 'Strawberry Matcha',
        style: 'Matcha',
        score: 4.4,
        notes: ['berry', 'creamy', 'layered'],
        price: 'INR 300',
      },
    ],
  },
  {
    id: 'b3',
    name: 'Koramangala Bloom',
    city: 'Bangalore',
    neighborhood: 'Koramangala',
    coords: [12.9352, 77.6245],
    rating: 4.7,
    roaster: 'Natural process lab',
    vibe: 'Laptop-light, patio-loud',
    image:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=85',
    friendSignal: '4 friends worked from here',
    distance: '3.5 km',
    open: 'Open until 11:30 PM',
    tags: ['Work friendly', 'Top rated', 'Matcha'],
    drinks: [
      {
        id: 'b3d1',
        name: 'Bloom Batch Brew',
        style: 'Batch brew',
        score: 4.7,
        notes: ['peach', 'floral', 'juicy'],
        price: 'INR 210',
      },
      {
        id: 'b3d2',
        name: 'Sesame Matcha Cold Foam',
        style: 'Matcha',
        score: 4.6,
        notes: ['toasty', 'creamy', 'savory'],
        price: 'INR 330',
      },
    ],
  },
  {
    id: 'b4',
    name: 'Lalbagh Roast Cart',
    city: 'Bangalore',
    neighborhood: 'Basavanagudi',
    coords: [12.9507, 77.5848],
    rating: 4.4,
    roaster: 'Small-batch blends',
    vibe: 'Morning walk ritual',
    image:
      'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=900&q=85',
    friendSignal: 'Rohan starts Sundays here',
    distance: '5.9 km',
    open: 'Open until 8 PM',
    tags: ['Friends', 'Work friendly'],
    drinks: [
      {
        id: 'b4d1',
        name: 'South Filter Foam',
        style: 'Filter inspired',
        score: 4.5,
        notes: ['jaggery', 'bold', 'comfort'],
        price: 'INR 190',
      },
      {
        id: 'b4d2',
        name: 'Iced Americano',
        style: 'Iced black',
        score: 4.2,
        notes: ['snappy', 'lean', 'clean'],
        price: 'INR 190',
      },
    ],
  },
]

const feed: FriendPost[] = [
  {
    id: 'f1',
    friend: 'Nisha',
    handle: '@nishadrinks',
    city: 'Mumbai',
    avatar: 'NS',
    cafeId: 'm1',
    drink: 'Sea Salt Cold Brew',
    rating: 4.9,
    caption: 'Salty finish, chocolate body, dangerous repeat order.',
    time: '18 min',
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85',
    likes: 38,
    comments: 7,
    plan: 'Going again Friday',
  },
  {
    id: 'f2',
    friend: 'Meera',
    handle: '@meera.cups',
    city: 'Bangalore',
    avatar: 'MR',
    cafeId: 'b1',
    drink: 'Anaerobic Cappuccino',
    rating: 4.9,
    caption: 'Berry note actually came through the milk. Rare win.',
    time: '42 min',
    image:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85',
    likes: 44,
    comments: 12,
    plan: 'Saved for weekend',
  },
  {
    id: 'f3',
    friend: 'Arjun',
    handle: '@arjunmanual',
    city: 'Mumbai',
    avatar: 'AJ',
    cafeId: 'm2',
    drink: 'Ratnagiri V60',
    rating: 4.6,
    caption: 'Clean cup after a museum sprint. Fort needs more of this.',
    time: '2 h',
    image:
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=900&q=85',
    likes: 26,
    comments: 4,
  },
  {
    id: 'f4',
    friend: 'Asha',
    handle: '@ashapours',
    city: 'Bangalore',
    avatar: 'AK',
    cafeId: 'b2',
    drink: 'Washed V60 Flight',
    rating: 4.6,
    caption: 'Three cups, one table, zero regrets.',
    time: '4 h',
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
    likes: 31,
    comments: 5,
    plan: 'Cupping at 6 PM',
  },
]

const initialBook: BookEntry[] = [
  {
    id: 'r1',
    cafeId: 'm1',
    drink: 'Sea Salt Cold Brew',
    rating: 4.9,
    date: 'Today',
    note: 'Balanced and glossy. Saved as Mumbai cold brew benchmark.',
    flavor: 'Cacao',
  },
  {
    id: 'r2',
    cafeId: 'b3',
    drink: 'Bloom Batch Brew',
    rating: 4.7,
    date: 'Yesterday',
    note: 'Juicy, bright, easy to finish before calls.',
    flavor: 'Peach',
  },
  {
    id: 'r3',
    cafeId: 'm4',
    drink: 'Koji Ferment Espresso',
    rating: 4.8,
    date: 'Sat',
    note: 'Wild but polished. Needs a second tasting.',
    flavor: 'Plum',
  },
]

const filters: FilterKey[] = ['Friends', 'Top rated', 'Work friendly', 'Matcha', 'New drops']

const basePinCounts: Record<string, number> = {
  m1: 186,
  m2: 92,
  m3: 74,
  m4: 129,
  b1: 171,
  b2: 118,
  b3: 144,
  b4: 68,
}

const matchScores: Record<string, number> = {
  m1: 96,
  m2: 89,
  m3: 84,
  m4: 92,
  b1: 97,
  b2: 88,
  b3: 93,
  b4: 81,
}

function cafeById(id: string) {
  return cafes.find((cafe) => cafe.id === id)!
}

function ratingLabel(value: number) {
  if (value >= 4.8) return 'Elite'
  if (value >= 4.5) return 'Loved'
  return 'Solid'
}

function rankInCity(cafe: Cafe) {
  return (
    cafes
      .filter((candidate) => candidate.city === cafe.city)
      .sort((a, b) => b.rating - a.rating)
      .findIndex((candidate) => candidate.id === cafe.id) + 1
  )
}

function MapSync({ city, selectedCafe }: { city: City; selectedCafe?: Cafe }) {
  const map = useMap()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const nextCenter = selectedCafe?.coords ?? cityCenters[city]
    map.flyTo(nextCenter, selectedCafe ? 13 : 12, {
      animate: !reduceMotion,
      duration: reduceMotion ? 0 : 0.8,
    })
  }, [city, map, reduceMotion, selectedCafe])

  return null
}

function CoffeeMarker({
  cafe,
  active,
  pinned,
  onSelect,
}: {
  cafe: Cafe
  active: boolean
  pinned: boolean
  onSelect: (cafe: Cafe) => void
}) {
  const icon = useMemo(
    () =>
      divIcon({
        className: '',
        html: `<button class="map-pin ${active ? 'is-active' : ''} ${pinned ? 'is-pinned' : ''}" aria-label="${cafe.name}"><span>${cafe.rating.toFixed(
          1,
        )}</span></button>`,
        iconSize: active ? [62, 62] : [52, 52],
        iconAnchor: active ? [31, 31] : [26, 26],
      }),
    [active, cafe.name, cafe.rating, pinned],
  )

  return (
    <Marker
      icon={icon}
      position={cafe.coords}
      eventHandlers={{ click: () => onSelect(cafe) }}
    >
      <Popup>
        <strong>{cafe.name}</strong>
        <span>{cafe.neighborhood}</span>
      </Popup>
    </Marker>
  )
}

function Stars({
  value,
  onChange,
  compact = false,
}: {
  value: number
  onChange?: (value: number) => void
  compact?: boolean
}) {
  return (
    <div className={compact ? 'stars compact' : 'stars'} aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value)
        return (
          <button
            className={filled ? 'star is-filled' : 'star'}
            disabled={!onChange}
            key={star}
            onClick={() => onChange?.(star)}
            title={`${star} stars`}
            type="button"
          >
            <Star size={compact ? 14 : 18} strokeWidth={filled ? 0 : 2.2} />
          </button>
        )
      })}
    </div>
  )
}

function App() {
  const [city, setCity] = useState<City>('Mumbai')
  const [tab, setTab] = useState<Tab>('discover')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Friends')
  const [selectedCafeId, setSelectedCafeId] = useState('m1')
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(['m1', 'b1']))
  const [pinnedShops, setPinnedShops] = useState<Set<string>>(
    () => new Set(['m1', 'b3']),
  )
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => new Set(['f1']))
  const [bookEntries, setBookEntries] = useState<BookEntry[]>(initialBook)
  const [ratingCafe, setRatingCafe] = useState<Cafe | null>(null)
  const [draftDrink, setDraftDrink] = useState('')
  const [draftRating, setDraftRating] = useState(5)

  const visibleCafes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return cafes
      .filter((cafe) => cafe.city === city)
      .filter((cafe) => cafe.tags.includes(activeFilter))
      .filter((cafe) => {
        if (!normalizedQuery) return true
        return [
          cafe.name,
          cafe.neighborhood,
          cafe.roaster,
          cafe.vibe,
          ...cafe.tags,
          ...cafe.drinks.flatMap((drink) => [drink.name, drink.style, ...drink.notes]),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((a, b) => b.rating - a.rating)
  }, [activeFilter, city, query])

  const selectedCafe = useMemo(() => {
    const current = cafes.find((cafe) => cafe.id === selectedCafeId)
    if (current?.city === city && visibleCafes.some((cafe) => cafe.id === current.id)) {
      return current
    }
    return visibleCafes[0] ?? cafes.find((cafe) => cafe.city === city)
  }, [city, selectedCafeId, visibleCafes])

  const cityFeed = feed.filter((post) => post.city === city)
  const cityBook = bookEntries.filter((entry) => cafeById(entry.cafeId).city === city)
  const topCityCafe = cafes
    .filter((cafe) => cafe.city === city)
    .sort((a, b) => b.rating - a.rating)[0]
  const matchaDrops = cafes.filter(
    (cafe) => cafe.city === city && cafe.tags.includes('Matcha'),
  ).length
  const friendsOut = cityFeed.length * 3 + (city === 'Mumbai' ? 5 : 7)

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function togglePinnedShop(id: string) {
    setPinnedShops((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleLike(id: string) {
    setLikedPosts((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function shareCafe(cafe: Cafe) {
    const shareData = {
      title: cafe.name,
      text: `Meet me at ${cafe.name} in ${cafe.neighborhood}. Top pick: ${cafe.drinks[0].name}.`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      }
    } catch {
      return
    }
  }

  function openRating(cafe: Cafe, drinkName = cafe.drinks[0].name) {
    setRatingCafe(cafe)
    setDraftDrink(drinkName)
    setDraftRating(5)
  }

  function saveRating() {
    if (!ratingCafe) return
    setBookEntries((current) => [
      {
        id: crypto.randomUUID(),
        cafeId: ratingCafe.id,
        drink: draftDrink,
        rating: draftRating,
        date: 'Now',
        note: `${ratingLabel(draftRating)} cup at ${ratingCafe.neighborhood}.`,
        flavor: ratingCafe.drinks[0].notes[0],
      },
      ...current,
    ])
    setRatingCafe(null)
    setTab('book')
  }

  function selectCity(nextCity: City) {
    setCity(nextCity)
    const nextCafe = cafes.find((cafe) => cafe.city === nextCity && cafe.tags.includes(activeFilter))
    setSelectedCafeId(nextCafe?.id ?? cafes.find((cafe) => cafe.city === nextCity)!.id)
  }

  function primaryDrink(cafe: Cafe) {
    if (activeFilter === 'Matcha') {
      return (
        cafe.drinks.find(
          (drink) => drink.style === 'Matcha' || drink.name.includes('Matcha'),
        ) ?? cafe.drinks[0]
      )
    }

    return cafe.drinks[0]
  }

  return (
    <main className="app-shell">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="phone"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="topbar glass-panel">
          <div>
            <p className="eyebrow">Koffee beta</p>
            <h1>Find the cup your friends would detour for.</h1>
          </div>
          <div className="top-actions">
            <button aria-label="Notifications" className="icon-button" title="Notifications" type="button">
              <Bell size={18} />
            </button>
            <button aria-label="Add rating" className="icon-button primary" title="Add rating" type="button" onClick={() => selectedCafe && openRating(selectedCafe)}>
              <Plus size={19} />
            </button>
          </div>
        </header>

        <section className="controls glass-panel" aria-label="Discovery controls">
          <LayoutGroup>
            <div className="city-switcher">
              {(['Mumbai', 'Bangalore'] as City[]).map((option) => (
                <button
                  className={city === option ? 'city-pill is-active' : 'city-pill'}
                  key={option}
                  onClick={() => selectCity(option)}
                  type="button"
                >
                  {city === option && <motion.span className="pill-motion" layoutId="city-pill" />}
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>

          <label className="search-box">
            <Search size={18} />
            <input
              aria-label="Search cafes and coffees"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cafes, drinks, notes"
              type="search"
              value={query}
            />
            <SlidersHorizontal size={17} />
          </label>

          <div className="filter-row" aria-label="Cafe filters">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter ? 'filter-chip is-active' : 'filter-chip'}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter === 'Friends' && <Users size={14} />}
                {filter === 'Top rated' && <Star size={14} />}
                {filter === 'Work friendly' && <Coffee size={14} />}
                {filter === 'Matcha' && <Leaf size={14} />}
                {filter === 'New drops' && <Sparkles size={14} />}
                <span>{filter}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="trend-rail" aria-label={`${city} trends`}>
          <button className="trend-pill" type="button" onClick={() => {
            setSelectedCafeId(topCityCafe.id)
            setTab('discover')
          }}>
            <Trophy size={16} />
            <span>
              <strong>#{rankInCity(topCityCafe)} in {city}</strong>
              {topCityCafe.name}
            </span>
          </button>
          <button className="trend-pill" type="button" onClick={() => setActiveFilter('Matcha')}>
            <Leaf size={16} />
            <span>
              <strong>{matchaDrops} matcha drops</strong>
              Pulled from cafe menus
            </span>
          </button>
          <button className="trend-pill" type="button" onClick={() => setTab('feed')}>
            <Users size={16} />
            <span>
              <strong>{friendsOut} friends out</strong>
              Plans and check-ins
            </span>
          </button>
        </section>

        <AnimatePresence mode="wait">
          {tab === 'discover' && (
            <motion.section
              animate={{ opacity: 1, x: 0 }}
              className="screen discover-screen"
              exit={{ opacity: 0, x: -18 }}
              initial={{ opacity: 0, x: 18 }}
              key="discover"
              transition={{ duration: 0.28 }}
            >
              <section className="map-card" aria-label={`${city} cafe map`}>
                <div className="map-art" aria-hidden="true">
                  <span className="district district-a">
                    {city === 'Mumbai' ? 'Bandra' : 'Indiranagar'}
                  </span>
                  <span className="district district-b">
                    {city === 'Mumbai' ? 'Fort' : 'Church St'}
                  </span>
                  <span className="district district-c">
                    {city === 'Mumbai' ? 'Versova' : 'Koramangala'}
                  </span>
                  <span className="route route-main" />
                  <span className="route route-loop" />
                  <span className="route route-side" />
                  <span className="waterline" />
                </div>
                <MapContainer
                  attributionControl={false}
                  center={cityCenters[city]}
                  className="coffee-map"
                  scrollWheelZoom={false}
                  zoom={12}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <CircleMarker
                    center={cityCenters[city]}
                    pathOptions={{
                      color: '#0c6b63',
                      fillColor: '#28c7b1',
                      fillOpacity: 0.16,
                      opacity: 0.4,
                    }}
                    radius={42}
                  />
                  <MapSync city={city} selectedCafe={selectedCafe} />
                  {visibleCafes.map((cafe) => (
                    <CoffeeMarker
                      active={selectedCafe?.id === cafe.id}
                      cafe={cafe}
                      key={cafe.id}
                      pinned={pinnedShops.has(cafe.id)}
                      onSelect={(nextCafe) => setSelectedCafeId(nextCafe.id)}
                    />
                  ))}
                </MapContainer>
                <div className="map-tools">
                  <button className="map-tool" type="button">
                    <Search size={14} />
                    Search map
                  </button>
                  {selectedCafe && (
                    <button
                      className={pinnedShops.has(selectedCafe.id) ? 'map-tool is-pinned' : 'map-tool'}
                      onClick={() => togglePinnedShop(selectedCafe.id)}
                      type="button"
                    >
                      <MapPinned size={14} />
                      {pinnedShops.has(selectedCafe.id) ? 'Pinned' : 'Pin shop'}
                    </button>
                  )}
                </div>
                <div className="map-overlay glass-panel">
                  <span>
                    <Navigation size={14} />
                    Community map
                  </span>
                  <strong>{visibleCafes.length} finds - {pinnedShops.size} pinned</strong>
                </div>
              </section>

              {selectedCafe && (
                <motion.article
                  className="selected-cafe"
                  layout
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="selected-image">
                    <img alt={`${selectedCafe.name} coffee`} src={selectedCafe.image} />
                    <div className="rating-badge">
                      <Star size={15} fill="currentColor" strokeWidth={0} />
                      {selectedCafe.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="selected-copy">
                    <div className="section-row">
                      <div>
                        <p className="eyebrow">{selectedCafe.neighborhood}</p>
                        <h2>{selectedCafe.name}</h2>
                      </div>
                      <button
                        aria-label={favorites.has(selectedCafe.id) ? 'Remove favorite' : 'Save favorite'}
                        className={favorites.has(selectedCafe.id) ? 'icon-button saved' : 'icon-button'}
                        onClick={() => toggleFavorite(selectedCafe.id)}
                        title="Save"
                        type="button"
                      >
                        <Bookmark size={18} fill={favorites.has(selectedCafe.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <p className="vibe">{selectedCafe.vibe}</p>
                    <div className="meta-grid">
                      <span>
                        <Trophy size={14} />
                        #{rankInCity(selectedCafe)} in {city}
                      </span>
                      <span>
                        <Sparkles size={14} />
                        {matchScores[selectedCafe.id]}% match
                      </span>
                      <span>
                        <MapPin size={14} />
                        {selectedCafe.distance}
                      </span>
                      <span>
                        <CalendarDays size={14} />
                        {selectedCafe.open}
                      </span>
                    </div>
                    <p className="friend-signal">
                      {selectedCafe.friendSignal} - {basePinCounts[selectedCafe.id] + (pinnedShops.has(selectedCafe.id) ? 1 : 0)} community pins
                    </p>

                    <div className="drink-strip" aria-label="Top drinks">
                      {selectedCafe.drinks.map((drink) => (
                        <button className="drink-pill" key={drink.id} type="button" onClick={() => {
                          openRating(selectedCafe, drink.name)
                        }}>
                          <span>{drink.name}</span>
                          <strong>{drink.score.toFixed(1)}</strong>
                        </button>
                      ))}
                    </div>

                    <div className="action-row">
                      <button className="command-button primary-command" onClick={() => openRating(selectedCafe)} type="button">
                        <Coffee size={17} />
                        Rate drink
                      </button>
                      <button className="command-button" onClick={() => shareCafe(selectedCafe)} type="button">
                        <Share2 size={17} />
                        Share
                      </button>
                    </div>
                  </div>
                </motion.article>
              )}

              <section className="section-list">
                <div className="section-row">
                  <div>
                    <p className="eyebrow">Live board</p>
                    <h2>Trending in {city}</h2>
                  </div>
                  <button className="text-icon-button" type="button">
                    <Filter size={16} />
                    Filters
                  </button>
                </div>

                <div className="cafe-list">
                  {visibleCafes.map((cafe) => (
                    <motion.button
                      className={selectedCafe?.id === cafe.id ? 'cafe-row is-active' : 'cafe-row'}
                      key={cafe.id}
                      layout
                      onClick={() => setSelectedCafeId(cafe.id)}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                    >
                      <img alt="" src={cafe.image} />
                      <span className="cafe-main">
                        <strong>{cafe.name}</strong>
                        <small>{primaryDrink(cafe).name} - {cafe.roaster}</small>
                      </span>
                      <span className="mini-score">
                        <Star size={13} fill="currentColor" strokeWidth={0} />
                        {cafe.rating.toFixed(1)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.section>
          )}

          {tab === 'book' && (
            <motion.section
              animate={{ opacity: 1, x: 0 }}
              className="screen book-screen"
              exit={{ opacity: 0, x: 18 }}
              initial={{ opacity: 0, x: -18 }}
              key="book"
              transition={{ duration: 0.28 }}
            >
              <section className="stats-band glass-panel">
                <div>
                  <p className="eyebrow">Coffee book</p>
                  <h2>{cityBook.length} ratings in {city}</h2>
                  <p>Your recent cups, notes, and favorite flavors.</p>
                </div>
                <button className="icon-button primary" onClick={() => selectedCafe && openRating(selectedCafe)} title="Add rating" type="button">
                  <Plus size={19} />
                </button>
              </section>

              <div className="stat-grid" aria-label="Coffee book stats">
                <div className="stat-tile">
                  <Flame size={18} />
                  <strong>8</strong>
                  <span>day streak</span>
                </div>
                <div className="stat-tile">
                  <Award size={18} />
                  <strong>4.8</strong>
                  <span>avg score</span>
                </div>
                <div className="stat-tile">
                  <TrendingUp size={18} />
                  <strong>12</strong>
                  <span>new notes</span>
                </div>
              </div>

              <section className="timeline" aria-label="Recent ratings">
                {cityBook.map((entry) => {
                  const cafe = cafeById(entry.cafeId)
                  return (
                    <motion.article className="book-entry" key={entry.id} layout>
                      <div className="book-cover">
                        <img alt="" src={cafe.image} />
                      </div>
                      <div className="entry-copy">
                        <div className="section-row tight">
                          <span>{entry.date}</span>
                          <span className="mini-score">
                            <Star size={13} fill="currentColor" strokeWidth={0} />
                            {entry.rating.toFixed(1)}
                          </span>
                        </div>
                        <h3>{entry.drink}</h3>
                        <p>{cafe.name} - {entry.note}</p>
                        <div className="flavor-row">
                          <span>{entry.flavor}</span>
                          <span>{cafe.neighborhood}</span>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </section>
            </motion.section>
          )}

          {tab === 'feed' && (
            <motion.section
              animate={{ opacity: 1, x: 0 }}
              className="screen feed-screen"
              exit={{ opacity: 0, x: 18 }}
              initial={{ opacity: 0, x: -18 }}
              key="feed"
              transition={{ duration: 0.28 }}
            >
              <section className="stories" aria-label="Friends">
                {cityFeed.map((post) => (
                  <button className="story" key={post.id} type="button" onClick={() => setSelectedCafeId(post.cafeId)}>
                    <span>{post.avatar}</span>
                    <small>{post.friend}</small>
                  </button>
                ))}
              </section>

              <section className="feed-list" aria-label="Friend coffee feed">
                {cityFeed.map((post) => {
                  const cafe = cafeById(post.cafeId)
                  const liked = likedPosts.has(post.id)
                  return (
                    <motion.article className="feed-card" key={post.id} layout>
                      <div className="feed-head">
                        <span className="avatar">{post.avatar}</span>
                        <div>
                          <h3>{post.friend}</h3>
                          <p>{post.handle} - {post.time}</p>
                        </div>
                        <button className="icon-button" title="More" type="button">
                          <ChevronDown size={18} />
                        </button>
                      </div>

                      <button
                        className="feed-image"
                        onClick={() => {
                          setSelectedCafeId(cafe.id)
                          setTab('discover')
                        }}
                        type="button"
                      >
                        <img alt={`${post.drink} at ${cafe.name}`} src={post.image} />
                        {post.plan && <span className="plan-badge">{post.plan}</span>}
                      </button>

                      <div className="feed-body">
                        <div className="section-row tight">
                          <div>
                            <h3>{post.drink}</h3>
                            <p>{cafe.name}, {cafe.neighborhood}</p>
                          </div>
                          <span className="large-score">
                            <Star size={15} fill="currentColor" strokeWidth={0} />
                            {post.rating.toFixed(1)}
                          </span>
                        </div>
                        <p>{post.caption}</p>
                        <div className="feed-actions">
                          <button
                            className={liked ? 'social-action is-liked' : 'social-action'}
                            onClick={() => toggleLike(post.id)}
                            type="button"
                          >
                            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                            {post.likes + (liked ? 1 : 0)}
                          </button>
                          <button className="social-action" type="button">
                            <MessageCircle size={18} />
                            {post.comments}
                          </button>
                          <button className="social-action" type="button" onClick={() => shareCafe(cafe)}>
                            <Send size={18} />
                            Send
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </section>
            </motion.section>
          )}
        </AnimatePresence>

        <nav className="bottom-nav glass-panel" aria-label="Primary navigation">
          {[
            { id: 'discover' as Tab, label: 'Map', icon: Compass },
            { id: 'book' as Tab, label: 'Book', icon: BookOpen },
            { id: 'feed' as Tab, label: 'Feed', icon: Home },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                className={tab === item.id ? 'nav-item is-active' : 'nav-item'}
                key={item.id}
                onClick={() => setTab(item.id)}
                type="button"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </motion.section>

      <AnimatePresence>
        {ratingCafe && (
          <motion.div
            animate={{ opacity: 1 }}
            className="modal-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.section
              animate={{ y: 0 }}
              className="rating-sheet glass-panel"
              exit={{ y: 420 }}
              initial={{ y: 420 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grabber" />
              <div className="section-row">
                <div>
                  <p className="eyebrow">Rate a coffee</p>
                  <h2>{ratingCafe.name}</h2>
                </div>
                <button aria-label="Close rating" className="icon-button" onClick={() => setRatingCafe(null)} title="Close" type="button">
                  <X size={18} />
                </button>
              </div>

              <div className="rating-preview">
                <img alt="" src={ratingCafe.image} />
                <div>
                  <label htmlFor="drink-select">Coffee</label>
                  <select
                    id="drink-select"
                    onChange={(event) => setDraftDrink(event.target.value)}
                    value={draftDrink}
                  >
                    {ratingCafe.drinks.map((drink) => (
                      <option key={drink.id} value={drink.name}>
                        {drink.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rating-scale">
                <span>Your score</span>
                <Stars value={draftRating} onChange={setDraftRating} />
              </div>

              <div className="note-cloud">
                {ratingCafe.drinks[0].notes.map((note) => (
                  <span key={note}>{note}</span>
                ))}
              </div>

              <button className="command-button primary-command full" onClick={saveRating} type="button">
                <Check size={18} />
                Save to Coffee Book
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
