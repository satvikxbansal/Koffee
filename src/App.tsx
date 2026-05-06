import mapboxgl from 'mapbox-gl'
import type { CircleLayerSpecification, GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection, Point } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  Coffee,
  Compass,
  Crosshair,
  ExternalLink,
  Frown,
  Heart,
  ImagePlus,
  Lock,
  LogOut,
  MapPin,
  Meh,
  Navigation,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Star,
  User,
  X,
} from 'lucide-react'
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type City = 'Mumbai' | 'Bangalore'
type Tab = 'discover' | 'feed' | 'book' | 'you'
type FilterKey = 'Top rated' | 'Work-friendly' | 'Matcha' | 'New drops'

type MapMode = 'city' | 'place'
type Sentiment = 'Loved' | 'Fine' | "Didn't like"

type Cafe = {
  id: string
  name: string
  city: City
  neighborhood: string
  coords: [number, number]
  rating: number
  image: string
  tags: FilterKey[]
  notes: string[]
  drinks: string[]
}

type CafeMapProperties = {
  cafeId: string
  name: string
  ratingLabel: string
}

type Rating = {
  id: string
  cafeId: string
  drink: string
  title?: string
  sentiment?: Sentiment
  isPublic?: boolean
  photoCount?: number
  rating: number
  date: string
}

type ActivityPayload = {
  cafeId: string
  description: string
  isPublic: boolean
  order: string
  photoCount: number
  sentiment: Sentiment
  title: string
}

type FeedPost = {
  id: string
  name: string
  handle: string
  cafeId: string
  drink: string
  rating: number
  note: string
  time: string
}

const cityCenters: Record<City, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
}

const filters: FilterKey[] = ['Top rated', 'Work-friendly', 'Matcha', 'New drops']

const cafes: Cafe[] = [
  {
    id: 'm-blue-tokai-bandra',
    name: 'Blue Tokai Coffee Roasters',
    city: 'Mumbai',
    neighborhood: 'Bandra West',
    coords: [19.0607, 72.8295],
    rating: 9.2,
    image:
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=600&q=85',
    tags: ['Top rated', 'Work-friendly'],
    notes: ['specialty', 'pour-over'],
    drinks: ['Iced Pour Over', 'Cappuccino', 'Cold Brew'],
  },
  {
    id: 'm-blue-tokai-kamala',
    name: 'Blue Tokai - Kamala Mills',
    city: 'Mumbai',
    neighborhood: 'Lower Parel',
    coords: [19.0022, 72.8295],
    rating: 8.8,
    image:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=85',
    tags: ['Work-friendly', 'New drops'],
    notes: ['espresso', 'laptop-friendly'],
    drinks: ['Sea Salt Mocha', 'Flat White', 'Batch Brew'],
  },
  {
    id: 'm-subko-bandra',
    name: 'Subko Coffee Roasters',
    city: 'Mumbai',
    neighborhood: 'Bandra West',
    coords: [19.0665, 72.8299],
    rating: 9.4,
    image:
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=85',
    tags: ['Top rated', 'New drops'],
    notes: ['croissants', 'specialty'],
    drinks: ['Cortado', 'Koji Ferment Espresso', 'Cold Brew'],
  },
  {
    id: 'm-subko-colaba',
    name: 'Subko - Colaba',
    city: 'Mumbai',
    neighborhood: 'Colaba',
    coords: [18.9152, 72.8268],
    rating: 8.9,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=85',
    tags: ['Top rated', 'Matcha'],
    notes: ['matcha', 'desserts'],
    drinks: ['Coconut Matcha Cloud', 'Espresso Tonic', 'Macchiato'],
  },
  {
    id: 'm-kala-ghoda',
    name: 'Kala Ghoda Cafe',
    city: 'Mumbai',
    neighborhood: 'Fort',
    coords: [18.9275, 72.832],
    rating: 8.6,
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=85',
    tags: ['Top rated', 'Work-friendly'],
    notes: ['fort', 'brunch'],
    drinks: ['Americano', 'Cappuccino', 'Mocha'],
  },
  {
    id: 'm-nutcracker',
    name: 'The Nutcracker',
    city: 'Mumbai',
    neighborhood: 'Fort',
    coords: [18.9357, 72.8338],
    rating: 8.4,
    image:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=85',
    tags: ['Work-friendly'],
    notes: ['breakfast', 'central'],
    drinks: ['Latte', 'Filter Coffee', 'Iced Americano'],
  },
  {
    id: 'b-third-wave',
    name: 'Third Wave Coffee',
    city: 'Bangalore',
    neighborhood: 'Indiranagar',
    coords: [12.9784, 77.6408],
    rating: 8.7,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=85',
    tags: ['Work-friendly', 'Top rated'],
    notes: ['wifi', 'espresso'],
    drinks: ['Vienna Roast Cappuccino', 'Cold Brew', 'Mocha'],
  },
  {
    id: 'b-araku',
    name: 'ARAKU Coffee',
    city: 'Bangalore',
    neighborhood: 'Indiranagar',
    coords: [12.9709, 77.6411],
    rating: 9.3,
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=85',
    tags: ['Top rated', 'New drops'],
    notes: ['origin-led', 'design'],
    drinks: ['Microclimate Pour Over', 'Espresso', 'Iced Latte'],
  },
  {
    id: 'b-maverick',
    name: 'Maverick & Farmer',
    city: 'Bangalore',
    neighborhood: 'Ulsoor',
    coords: [12.9815, 77.6192],
    rating: 9.1,
    image:
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=85',
    tags: ['Top rated', 'Matcha'],
    notes: ['experimental', 'matcha'],
    drinks: ['Parama Cappuccino', 'Strawberry Matcha', 'Cold Smoked Coffee'],
  },
  {
    id: 'b-humblebean',
    name: 'Humblebean Coffee',
    city: 'Bangalore',
    neighborhood: 'Church Street',
    coords: [12.9744, 77.6073],
    rating: 8.5,
    image:
      'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=600&q=85',
    tags: ['Work-friendly', 'New drops'],
    notes: ['central', 'manual brew'],
    drinks: ['Aeropress', 'Cortado', 'Batch Brew'],
  },
  {
    id: 'b-dyu',
    name: 'Dyu Art Cafe',
    city: 'Bangalore',
    neighborhood: 'Koramangala',
    coords: [12.9349, 77.6229],
    rating: 8.3,
    image:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=85',
    tags: ['Matcha', 'Work-friendly'],
    notes: ['courtyard', 'slow'],
    drinks: ['Iced Matcha', 'Cappuccino', 'Vietnamese Coffee'],
  },
  {
    id: 'b-blue-tokai',
    name: 'Blue Tokai - Koramangala',
    city: 'Bangalore',
    neighborhood: 'Koramangala',
    coords: [12.9355, 77.6145],
    rating: 8.8,
    image:
      'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=600&q=85',
    tags: ['Top rated', 'Work-friendly'],
    notes: ['specialty', 'reliable'],
    drinks: ['Pour Over', 'Flat White', 'Cold Brew'],
  },
]

const initialRatings: Rating[] = [
  {
    id: 'r1',
    cafeId: 'm-subko-bandra',
    drink: 'Espresso',
    rating: 9.2,
    date: '2 days ago',
  },
  {
    id: 'r2',
    cafeId: 'm-blue-tokai-bandra',
    drink: 'Pour Over',
    rating: 8.5,
    date: 'Last week',
  },
]

const feed: FeedPost[] = [
  {
    id: 'f1',
    name: 'Nisha',
    handle: '@nishadrinks',
    cafeId: 'm-blue-tokai-bandra',
    drink: 'Iced Pour Over',
    rating: 9.1,
    note: 'Clean, bright and worth the Bandra detour.',
    time: '18 min',
  },
  {
    id: 'f2',
    name: 'Meera',
    handle: '@meera.cups',
    cafeId: 'b-araku',
    drink: 'Microclimate Pour Over',
    rating: 9.4,
    note: 'The most polished cup I have had this month.',
    time: '42 min',
  },
  {
    id: 'f3',
    name: 'Arjun',
    handle: '@arjunmanual',
    cafeId: 'm-kala-ghoda',
    drink: 'Cappuccino',
    rating: 8.6,
    note: 'Solid reset after a Fort walk.',
    time: '2 h',
  },
]

const profile = {
  name: 'Satvik Bansal',
  handle: '@bsatvik99',
  city: 'Mumbai',
}

const cityCamera: Record<City, { bearing: number; pitch: number; zoom: number }> = {
  Mumbai: { bearing: 0, pitch: 0, zoom: 11.12 },
  Bangalore: { bearing: 0, pitch: 0, zoom: 11.18 },
}

const placeCamera: Record<City, { bearing: number; pitch: number; zoom: number }> = {
  Mumbai: { bearing: -18, pitch: 62, zoom: 15.75 },
  Bangalore: { bearing: 22, pitch: 62, zoom: 15.8 },
}

function toLngLat(coords: [number, number]): [number, number] {
  return [coords[1], coords[0]]
}

function cafeFeatureCollection(cafesForMap: Cafe[]): FeatureCollection<Point, CafeMapProperties> {
  return {
    type: 'FeatureCollection',
    features: cafesForMap.map((cafe) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: toLngLat(cafe.coords),
      },
      properties: {
        cafeId: cafe.id,
        name: cafe.name,
        ratingLabel: cafe.rating.toFixed(1),
      },
    })),
  }
}

function cafeLayerPaint<T>(value: T) {
  return value
}

function syncCafeSource(
  map: mapboxgl.Map,
  sourceId: string,
  data: FeatureCollection<Point, CafeMapProperties>,
) {
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data,
    })
  } else {
    const source = map.getSource(sourceId) as GeoJSONSource
    source.setData(data)
  }
}

function ensureCafeLayers(map: mapboxgl.Map, data: FeatureCollection<Point, CafeMapProperties>) {
  syncCafeSource(map, 'brew-cafes', data)

  const layers: Array<CircleLayerSpecification> = [
    {
      id: 'brew-cafe-glow',
      source: 'brew-cafes',
      type: 'circle',
      paint: cafeLayerPaint({
        'circle-blur': 0.5,
        'circle-color': '#ef7422',
        'circle-opacity': 0.1,
        'circle-radius': 17,
      }),
    } as CircleLayerSpecification,
    {
      id: 'brew-cafe-ring',
      source: 'brew-cafes',
      type: 'circle',
      paint: cafeLayerPaint({
        'circle-color': '#fffdf9',
        'circle-opacity': 0.98,
        'circle-radius': 13,
        'circle-stroke-color': 'rgba(75, 51, 38, 0.12)',
        'circle-stroke-width': 1,
      }),
    } as CircleLayerSpecification,
    {
      id: 'brew-cafe-dot',
      source: 'brew-cafes',
      type: 'circle',
      paint: cafeLayerPaint({
        'circle-color': '#ef7422',
        'circle-radius': 8,
        'circle-stroke-color': '#fffaf5',
        'circle-stroke-width': 1.5,
      }),
    } as CircleLayerSpecification,
    {
      id: 'brew-cafe-core',
      source: 'brew-cafes',
      type: 'circle',
      paint: cafeLayerPaint({
        'circle-color': '#fffaf5',
        'circle-opacity': 0.95,
        'circle-radius': 3.2,
      }),
    } as CircleLayerSpecification,
    {
      id: 'brew-cafe-hit',
      source: 'brew-cafes',
      type: 'circle',
      paint: cafeLayerPaint({
        'circle-color': '#000',
        'circle-opacity': 0,
        'circle-radius': 22,
      }),
    } as CircleLayerSpecification,
  ]

  layers.forEach((layer) => {
    if (!map.getLayer(layer.id)) {
      map.addLayer(layer)
    }
  })
}

function findCafe(cafeList: Cafe[], id: string) {
  return cafeList.find((cafe) => cafe.id === id) ?? cafes.find((cafe) => cafe.id === id) ?? cafeList[0]
}

function sentimentScore(sentiment: Sentiment) {
  if (sentiment === 'Loved') return 9.2
  if (sentiment === 'Fine') return 7.4
  return 4.8
}

function cityFromSearch(query: string, fallback: City): City {
  const normalized = query.trim().toLowerCase()
  if (normalized.includes('bangalore') || normalized.includes('bengaluru')) return 'Bangalore'
  if (normalized.includes('mumbai') || normalized.includes('bombay')) return 'Mumbai'
  return fallback
}

function BrewMap({
  activeCafe,
  city,
  cafesForMap,
  onSelect,
}: {
  activeCafe?: Cafe
  city: City
  cafesForMap: Cafe[]
  onSelect: (cafe: Cafe) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  useEffect(() => {
    if (!containerRef.current || !token || mapRef.current) return

    mapboxgl.accessToken = token
    const container = containerRef.current
    const map = new mapboxgl.Map({
      antialias: true,
      attributionControl: false,
      center: toLngLat(cityCenters[city]),
      container,
      bearing: cityCamera[city].bearing,
      maxZoom: 18,
      minZoom: 8.2,
      pitch: cityCamera[city].pitch,
      projection: 'mercator',
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: cityCamera[city].zoom,
    })

    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    resizeObserver.observe(container)

    map.on('style.load', () => {
      const layers = map.getStyle().layers ?? []
      const labelLayer = layers.find(
        (layer) =>
          layer.type === 'symbol' &&
          typeof layer.layout?.['text-field'] !== 'undefined',
      )

      if (!map.getLayer('brew-3d-buildings')) {
        map.addLayer(
          {
            id: 'brew-3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-color': '#d8ccc2',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-opacity': 0.72,
            },
          },
          labelLayer?.id,
        )
      }
    })

    map.on('load', () => {
      map.resize()
    })

    mapRef.current = map

    return () => {
      activeMarkerRef.current?.remove()
      activeMarkerRef.current = null
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [city, token])

  useEffect(() => {
    const mapInstance = mapRef.current
    if (!mapInstance) return
    const map = mapInstance

    function applyCamera() {
      if (!activeCafe && cafesForMap.length > 1) {
        const bounds = cafesForMap.reduce((nextBounds, cafe) => (
          nextBounds.extend(toLngLat(cafe.coords))
        ), new mapboxgl.LngLatBounds(toLngLat(cafesForMap[0].coords), toLngLat(cafesForMap[0].coords)))

        map.fitBounds(bounds, {
          bearing: cityCamera[city].bearing,
          duration: 800,
          essential: true,
          maxZoom: 12.15,
          padding: { top: 170, right: 70, bottom: 340, left: 70 },
          pitch: cityCamera[city].pitch,
        })
        return
      }

      const camera = activeCafe ? placeCamera[city] : cityCamera[city]

      map.flyTo({
        bearing: camera.bearing,
        center: toLngLat(activeCafe?.coords ?? cityCenters[city]),
        duration: 800,
        essential: true,
        pitch: camera.pitch,
        zoom: camera.zoom,
      })
    }

    if (map.loaded()) {
      applyCamera()
    } else {
      map.once('load', applyCamera)
    }

    return () => {
      map.off('load', applyCamera)
    }
  }, [activeCafe, cafesForMap, city])

  useEffect(() => {
    const mapInstance = mapRef.current as mapboxgl.Map | null
    if (!mapInstance) return
    const map = mapInstance

    const data = cafeFeatureCollection(cafesForMap.filter((cafe) => cafe.id !== activeCafe?.id))

    function syncCafePins() {
      ensureCafeLayers(map, data)
    }

    if (map.loaded()) {
      syncCafePins()
    } else {
      map.once('load', syncCafePins)
    }

    function handleCafeClick(event: mapboxgl.MapLayerMouseEvent) {
      const cafeId = event.features?.[0]?.properties?.cafeId as string | undefined
      const cafe = cafesForMap.find((nextCafe) => nextCafe.id === cafeId)
      if (cafe) onSelect(cafe)
    }

    function handleCafeEnter() {
      map.getCanvas().style.cursor = 'pointer'
    }

    function handleCafeLeave() {
      map.getCanvas().style.cursor = ''
    }

    activeMarkerRef.current?.remove()
    activeMarkerRef.current = null

    if (activeCafe) {
      const markerButton = document.createElement('button')
      markerButton.className = 'brew-active-pin'
      markerButton.type = 'button'
      markerButton.setAttribute('aria-label', activeCafe.name)
      markerButton.innerHTML = `<span>${activeCafe.rating.toFixed(1)}</span>`
      markerButton.addEventListener('click', () => onSelect(activeCafe))

      activeMarkerRef.current = new mapboxgl.Marker({
        anchor: 'center',
        element: markerButton,
      }).setLngLat(toLngLat(activeCafe.coords)).addTo(map)
    }

    const hitLayers = ['brew-cafe-hit']

    if (hitLayers.every((layerId) => map.getLayer(layerId))) {
      hitLayers.forEach((layerId) => {
        map.on('click', layerId, handleCafeClick)
        map.on('mouseenter', layerId, handleCafeEnter)
        map.on('mouseleave', layerId, handleCafeLeave)
      })
    } else {
      map.once('load', () => {
        if (!hitLayers.every((layerId) => map.getLayer(layerId))) return
        hitLayers.forEach((layerId) => {
          map.on('click', layerId, handleCafeClick)
          map.on('mouseenter', layerId, handleCafeEnter)
          map.on('mouseleave', layerId, handleCafeLeave)
        })
      })
    }

    return () => {
      activeMarkerRef.current?.remove()
      activeMarkerRef.current = null
      hitLayers.forEach((layerId) => {
        map.off('click', layerId, handleCafeClick)
        map.off('mouseenter', layerId, handleCafeEnter)
        map.off('mouseleave', layerId, handleCafeLeave)
      })
    }
  }, [activeCafe, cafesForMap, onSelect])

  if (!token) {
    return <div className="token-message">Add VITE_MAPBOX_TOKEN to load the map.</div>
  }

  return <div className="brew-map" ref={containerRef} />
}

function App() {
  const [tab, setTab] = useState<Tab>('discover')
  const [city, setCity] = useState<City>('Mumbai')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('Top rated')
  const [selectedCafeId, setSelectedCafeId] = useState('m-blue-tokai-bandra')
  const [ratings, setRatings] = useState<Rating[]>(initialRatings)
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(feed)
  const [isComposingActivity, setIsComposingActivity] = useState(false)
  const [isAddingCafe, setIsAddingCafe] = useState(false)
  const [mapMode, setMapMode] = useState<MapMode>('city')
  const [detailCafeId, setDetailCafeId] = useState<string | null>(null)
  const [communityCafes, setCommunityCafes] = useState<Cafe[]>([])

  const allCafes = useMemo(() => [...cafes, ...communityCafes], [communityCafes])

  const searchedCafes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return allCafes
      .filter((cafe) => cafe.city === city)
      .filter((cafe) => (filter === 'Top rated' ? cafe.rating >= 8.4 : cafe.tags.includes(filter)))
      .filter((cafe) => {
        if (!normalized || normalized.includes('mumbai') || normalized.includes('bangalore') || normalized.includes('bengaluru')) {
          return true
        }

        return [cafe.name, cafe.neighborhood, ...cafe.notes, ...cafe.drinks]
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      })
  }, [allCafes, city, filter, query])

  const visibleCafes = searchedCafes.length > 0
    ? searchedCafes
    : allCafes.filter((cafe) => cafe.city === city)
  const selectedCafe = visibleCafes.find((cafe) => cafe.id === selectedCafeId) ?? visibleCafes[0]

  function changeTab(nextTab: Tab) {
    setDetailCafeId(null)
    setIsComposingActivity(false)
    setIsAddingCafe(false)
    setTab(nextTab)
  }

  function openActivityComposer() {
    setIsAddingCafe(false)
    setIsComposingActivity(true)
  }

  function selectCafe(cafe: Cafe) {
    setCity(cafe.city)
    setSelectedCafeId(cafe.id)
    setMapMode('place')
    setIsComposingActivity(false)
    setIsAddingCafe(false)
    setDetailCafeId(null)
  }

  function submitActivity(activity: ActivityPayload) {
    const score = sentimentScore(activity.sentiment)
    setRatings((current) => [
      {
        id: crypto.randomUUID(),
        cafeId: activity.cafeId,
        date: 'Just now',
        drink: activity.order,
        isPublic: activity.isPublic,
        photoCount: activity.photoCount,
        rating: score,
        sentiment: activity.sentiment,
        title: activity.title,
      },
      ...current,
    ])

    if (activity.isPublic) {
      setFeedPosts((current) => [
        {
          id: crypto.randomUUID(),
          cafeId: activity.cafeId,
          drink: activity.order,
          handle: profile.handle,
          name: profile.name,
          note: activity.description || activity.title,
          rating: score,
          time: 'now',
        },
        ...current,
      ])
    }

    const cafe = findCafe(allCafes, activity.cafeId)
    setSelectedCafeId(cafe.id)
    setCity(cafe.city)
    setMapMode('place')
    setDetailCafeId(null)
    setIsComposingActivity(false)
    setTab('book')
  }

  function addCommunityCafe(name: string, neighborhood: string) {
    const center = cityCenters[city]
    const index = communityCafes.length
    const newCafe: Cafe = {
      id: `community-${city.toLowerCase()}-${Date.now()}`,
      city,
      coords: [
        center[0] + 0.012 + (index % 3) * 0.006,
        center[1] - 0.014 + (index % 4) * 0.008,
      ],
      drinks: ['House Cappuccino', 'Manual Brew', 'Iced Latte'],
      image:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=85',
      name,
      neighborhood,
      notes: ['community', 'new drop'],
      rating: 8.0,
      tags: ['New drops', 'Work-friendly'],
    }

    setCommunityCafes((current) => [newCafe, ...current])
    setQuery('')
    setFilter('New drops')
    setSelectedCafeId(newCafe.id)
    setMapMode('place')
    setIsAddingCafe(false)
    setTab('discover')
  }

  function openDetails(cafe: Cafe) {
    selectCafe(cafe)
    setDetailCafeId(cafe.id)
  }

  function openDirections(cafe: Cafe) {
    const [lat, lng] = cafe.coords
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank', 'noopener,noreferrer')
  }

  function handleQuery(nextQuery: string) {
    setQuery(nextQuery)
    const nextCity = cityFromSearch(nextQuery, city)
    if (nextCity !== city) {
      setCity(nextCity)
      setSelectedCafeId(allCafes.find((cafe) => cafe.city === nextCity)!.id)
      setMapMode('city')
    }
  }

  if (isAddingCafe) {
    return (
      <main className="brew-shell">
        <section className="brew-phone clean-screen">
          <AddPinScreen city={city} onBack={() => setIsAddingCafe(false)} onSubmit={addCommunityCafe} />
          <BottomNav activeTab={tab} onAdd={openActivityComposer} onChange={changeTab} />
          {isComposingActivity && (
            <ActivitySheet
              cafes={allCafes.filter((cafe) => cafe.city === city)}
              defaultCafeId={selectedCafe.id}
              onClose={() => setIsComposingActivity(false)}
              onSubmit={submitActivity}
            />
          )}
        </section>
      </main>
    )
  }

  if (detailCafeId) {
    const detailCafe = findCafe(allCafes, detailCafeId)
    return (
      <main className="brew-shell">
        <section className="brew-phone clean-screen">
          <CafeDetailsScreen
            cafe={detailCafe}
            onBack={() => setDetailCafeId(null)}
            onDirections={() => openDirections(detailCafe)}
            onLog={openActivityComposer}
          />
          <BottomNav activeTab={tab} onAdd={openActivityComposer} onChange={changeTab} />
          {isComposingActivity && (
            <ActivitySheet
              cafes={allCafes.filter((cafe) => cafe.city === detailCafe.city)}
              defaultCafeId={detailCafe.id}
              onClose={() => setIsComposingActivity(false)}
              onSubmit={submitActivity}
            />
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="brew-shell">
      <section className="brew-phone">
        {tab === 'discover' && (
          <DiscoverScreen
            city={city}
            filter={filter}
            query={query}
            selectedCafe={selectedCafe}
            visibleCafes={visibleCafes}
            onAddCafe={() => setIsAddingCafe(true)}
            onDirections={openDirections}
            onFilter={setFilter}
            onLogCoffee={openActivityComposer}
            onOpenDetails={openDetails}
            onResetMap={() => setMapMode('city')}
            onQuery={handleQuery}
            onSelect={selectCafe}
            mapMode={mapMode}
          />
        )}

        {tab === 'feed' && <FeedScreen cafesForFeed={allCafes} posts={feedPosts} />}
        {tab === 'book' && <BookScreen cafesForRatings={allCafes} ratings={ratings} />}
        {tab === 'you' && <ProfileScreen ratings={ratings} />}

        <BottomNav activeTab={tab} onAdd={openActivityComposer} onChange={changeTab} />
        {isComposingActivity && (
          <ActivitySheet
            cafes={allCafes.filter((cafe) => cafe.city === city)}
            defaultCafeId={selectedCafe.id}
            onClose={() => setIsComposingActivity(false)}
            onSubmit={submitActivity}
          />
        )}
      </section>
    </main>
  )
}

function DiscoverScreen({
  city,
  filter,
  query,
  selectedCafe,
  visibleCafes,
  onAddCafe,
  onDirections,
  onFilter,
  onLogCoffee,
  onOpenDetails,
  onResetMap,
  onQuery,
  onSelect,
  mapMode,
}: {
  city: City
  filter: FilterKey
  query: string
  selectedCafe: Cafe
  visibleCafes: Cafe[]
  onAddCafe: () => void
  onDirections: (cafe: Cafe) => void
  onFilter: (filter: FilterKey) => void
  onLogCoffee: () => void
  onOpenDetails: (cafe: Cafe) => void
  onResetMap: () => void
  onQuery: (query: string) => void
  onSelect: (cafe: Cafe) => void
  mapMode: MapMode
}) {
  return (
    <section className="discover-screen">
      <BrewMap
        activeCafe={mapMode === 'place' ? selectedCafe : undefined}
        cafesForMap={visibleCafes}
        city={city}
        onSelect={onSelect}
      />

      <div className="map-search-card">
        <Search size={24} />
        <input
          aria-label="Search cafes or cities"
          onChange={(event) => onQuery(event.target.value)}
          placeholder={`Search cafes in ${city}`}
          value={query}
        />
        <button aria-label="Profile" className="avatar-button" type="button">
          B
        </button>
      </div>

      <div className="map-actions" aria-label="Map actions">
        <button aria-label="Recenter map" onClick={onResetMap} type="button">
          <Crosshair size={18} />
        </button>
        <button aria-label="3D buildings enabled" type="button">
          3D
        </button>
      </div>

      <div className="filter-strip" aria-label="Quick filters">
        {filters.map((nextFilter) => (
          <button
            className={filter === nextFilter ? 'quick-chip is-active' : 'quick-chip'}
            key={nextFilter}
            onClick={() => onFilter(nextFilter)}
            type="button"
          >
            {nextFilter === 'Top rated' && <Sparkles size={16} />}
            {nextFilter === 'Work-friendly' && <Coffee size={16} />}
            {nextFilter === 'Matcha' && <Star size={16} />}
            {nextFilter === 'New drops' && <Plus size={16} />}
            {nextFilter}
          </button>
        ))}
      </div>

      {mapMode === 'city' && (
        <motion.section className="trending-panel" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="trend-heading">
            <Sparkles size={18} />
            <h2>Trending in {city}</h2>
          </div>
          <div className="trend-cards">
            {visibleCafes.slice(0, 4).map((cafe) => (
              <CafeCard cafe={cafe} key={cafe.id} onSelect={onSelect} />
            ))}
          </div>
        </motion.section>
      )}

      {mapMode === 'place' && (
        <motion.section
          animate={{ y: 0, opacity: 1 }}
          className="place-sheet"
          initial={{ y: 24, opacity: 0 }}
        >
          <img alt="" src={selectedCafe.image} />
          <div className="place-copy">
            <div>
              <strong>{selectedCafe.name}</strong>
              <small>
                <MapPin size={14} />
                {selectedCafe.neighborhood}
              </small>
            </div>
            <div className="place-actions">
              <button onClick={() => onOpenDetails(selectedCafe)} type="button">
                <Navigation size={16} />
                Details
              </button>
              <button onClick={onLogCoffee} type="button">
                <Plus size={16} />
                Log
              </button>
              <button aria-label="Open directions" onClick={() => onDirections(selectedCafe)} type="button">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
          <b>{selectedCafe.rating.toFixed(1)}</b>
        </motion.section>
      )}

      {mapMode === 'city' && (
        <button className="add-cafe-button" onClick={onAddCafe} type="button">
          <MapPin size={20} />
          Pin cafe
        </button>
      )}
    </section>
  )
}

function CafeCard({
  cafe,
  compact = false,
  onSelect,
}: {
  cafe: Cafe
  compact?: boolean
  onSelect: (cafe: Cafe) => void
}) {
  return (
    <button className={compact ? 'cafe-card compact' : 'cafe-card'} onClick={() => onSelect(cafe)} type="button">
      <img alt="" src={cafe.image} />
      <span>
        <strong>{cafe.name}</strong>
        <small>
          <MapPin size={14} />
          {cafe.neighborhood}
        </small>
        {!compact && (
          <span className="tag-row">
            {cafe.notes.slice(0, 2).map((note) => (
              <em key={note}>{note}</em>
            ))}
          </span>
        )}
      </span>
    </button>
  )
}

function FeedScreen({
  cafesForFeed,
  posts,
}: {
  cafesForFeed: Cafe[]
  posts: FeedPost[]
}) {
  return (
    <section className="plain-screen">
      <h1>Feed</h1>
      <div className="feed-list">
        {posts.map((post) => {
          const cafe = findCafe(cafesForFeed, post.cafeId)
          return (
            <article className="feed-item" key={post.id}>
              <div className="mini-avatar">{post.name.slice(0, 1)}</div>
              <div>
                <strong>{post.name}</strong>
                <p>{post.handle} logged {post.drink} at {cafe.name}</p>
                <small>{post.note}</small>
              </div>
              <span>{post.rating.toFixed(1)}</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function CafeDetailsScreen({
  cafe,
  onBack,
  onDirections,
  onLog,
}: {
  cafe: Cafe
  onBack: () => void
  onDirections: () => void
  onLog: () => void
}) {
  return (
    <section className="detail-screen">
      <header className="log-topbar detail-topbar">
        <button aria-label="Back" className="round-icon" onClick={onBack} type="button">
          <ArrowLeft size={28} />
        </button>
        <strong>{cafe.city}</strong>
      </header>
      <img alt="" className="detail-photo" src={cafe.image} />
      <div className="detail-title">
        <span>
          <h1>{cafe.name}</h1>
          <p>
            <MapPin size={16} />
            {cafe.neighborhood}
          </p>
        </span>
        <b>{cafe.rating.toFixed(1)}</b>
      </div>
      <div className="detail-tags">
        {cafe.notes.map((note) => (
          <em key={note}>{note}</em>
        ))}
      </div>
      <div className="detail-actions">
        <button onClick={onLog} type="button">
          <Plus size={18} />
          Log this cup
        </button>
        <button onClick={onDirections} type="button">
          <Navigation size={18} />
          Directions
        </button>
      </div>
      <section className="detail-section">
        <h2>Best cups</h2>
        {cafe.drinks.map((drink) => (
          <div className="drink-row" key={drink}>
            <Coffee size={18} />
            <span>{drink}</span>
            <Star size={16} />
          </div>
        ))}
      </section>
      <section className="detail-section friend-loved">
        <h2>Friend signal</h2>
        <p>Nisha, Meera and 14 others have this on their {cafe.city} shortlist.</p>
      </section>
    </section>
  )
}

function BookScreen({ cafesForRatings, ratings }: { cafesForRatings: Cafe[]; ratings: Rating[] }) {
  return (
    <section className="book-screen">
      <p className="book-label">My Brew Book</p>
      <div className="book-hero">
        <div className="profile-photo">B</div>
        <h1>{profile.name}</h1>
        <p>Just brew it • {profile.city}</p>
        <div className="book-stats">
          <span><strong>{new Set(ratings.map((rating) => rating.cafeId)).size}</strong>Cafes</span>
          <span><strong>{ratings.length}</strong>Ratings</span>
          <span><strong>1.2k</strong>Friends</span>
        </div>
      </div>

      <h2>Recent Activity</h2>
      <div className="book-list">
        {ratings.map((rating) => {
          const cafe = findCafe(cafesForRatings, rating.cafeId)
          return (
            <article className="book-row" key={rating.id}>
              <img alt="" src={cafe.image} />
              <div>
                <strong>{rating.title ?? cafe.name}</strong>
                <p>
                  {rating.date} • {rating.drink}
                  {rating.title ? ` at ${cafe.name}` : ''}
                </p>
                <span>{rating.sentiment ?? 'Edit'}</span>
              </div>
              <b>{rating.rating.toFixed(1)}</b>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ProfileScreen({ ratings }: { ratings: Rating[] }) {
  return (
    <section className="plain-screen you-screen">
      <div className="screen-title-row">
        <h1>You</h1>
        <button aria-label="Settings" className="round-icon" type="button">
          <Settings size={26} />
        </button>
      </div>
      <div className="profile-row">
        <div className="big-avatar">B</div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.handle} · {profile.city} · Just brew it</p>
        </div>
      </div>
      <div className="profile-stats">
        <span><strong>{ratings.length}</strong>Ratings</span>
        <span><strong>0</strong>Followers</span>
        <span><strong>0</strong>Following</span>
      </div>
      <h2>Top 3 cafes</h2>
      <p className="muted-copy">Rate some coffees to fill this in.</p>
      <button className="sign-out" type="button">
        <LogOut size={18} />
        Sign out
      </button>
    </section>
  )
}

function ActivitySheet({
  cafes: activityCafes,
  defaultCafeId,
  onClose,
  onSubmit,
}: {
  cafes: Cafe[]
  defaultCafeId: string
  onClose: () => void
  onSubmit: (activity: ActivityPayload) => void
}) {
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [order, setOrder] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedCafeId, setSelectedCafeId] = useState(defaultCafeId)
  const [sentiment, setSentiment] = useState<Sentiment>('Loved')
  const [title, setTitle] = useState('')
  const photosRef = useRef<string[]>([])
  const selectedCafe = findCafe(activityCafes, selectedCafeId)
  const canSubmit = title.trim().length > 1 && order.trim().length > 1
  const sentimentOptions: Array<{ icon: typeof Heart; label: Sentiment }> = [
    { icon: Heart, label: 'Loved' },
    { icon: Meh, label: 'Fine' },
    { icon: Frown, label: "Didn't like" },
  ]

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => () => {
    photosRef.current.forEach((preview) => URL.revokeObjectURL(preview))
  }, [])

  function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? [])
    if (incoming.length === 0) return

    setPhotos((current) => [
      ...current,
      ...incoming.slice(0, 3 - current.length).map((photo) => URL.createObjectURL(photo)),
    ])
    event.currentTarget.value = ''
  }

  function removePhoto(index: number) {
    const photo = photos[index]
    if (photo) URL.revokeObjectURL(photo)
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    onSubmit({
      cafeId: selectedCafe.id,
      description: description.trim(),
      isPublic,
      order: order.trim(),
      photoCount: photos.length,
      sentiment,
      title: title.trim(),
    })
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="sheet-backdrop"
      initial={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        animate={{ y: 0 }}
        className="activity-sheet"
        initial={{ y: 48 }}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="sheet-grabber" />
        <header className="sheet-header">
          <span>
            <small>New Brew activity</small>
            <h2>Log the cup.</h2>
          </span>
          <button aria-label="Close activity composer" onClick={onClose} type="button">
            <X size={22} />
          </button>
        </header>

        <label className="activity-cafe-select">
          <span>
            <MapPin size={18} />
            Cafe
          </span>
          <select
            aria-label="Cafe for activity"
            onChange={(event) => setSelectedCafeId(event.target.value)}
            value={selectedCafe.id}
          >
            {activityCafes.map((cafe) => (
              <option key={cafe.id} value={cafe.id}>
                {cafe.name} · {cafe.neighborhood}
              </option>
            ))}
          </select>
        </label>

        <div className="photo-grid" aria-label="Activity photos">
          {[0, 1, 2].map((slot) => {
            const preview = photos[slot]

            if (preview) {
              return (
                <div className="photo-tile has-photo" key={slot}>
                  <img alt="" src={preview} />
                  <button aria-label={`Remove photo ${slot + 1}`} onClick={() => removePhoto(slot)} type="button">
                    <X size={14} />
                  </button>
                </div>
              )
            }

            return (
              <label className="photo-tile" key={slot}>
                <ImagePlus size={24} />
                <span>{slot === 0 ? 'Add photos' : 'Photo'}</span>
                <input
                  aria-label={`Add photo ${slot + 1}`}
                  accept="image/*"
                  multiple
                  onChange={handlePhotos}
                  type="file"
                />
              </label>
            )
          })}
        </div>

        <label className="activity-field">
          <span>Activity name</span>
          <input
            aria-label="Activity name"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Sunday cortado run"
            value={title}
          />
        </label>

        <label className="activity-field">
          <span>Description</span>
          <textarea
            aria-label="Description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What made it worth posting?"
            rows={3}
            value={description}
          />
        </label>

        <label className="activity-field">
          <span>What did you order?</span>
          <input
            aria-label="What did you order?"
            onChange={(event) => setOrder(event.target.value)}
            placeholder={selectedCafe.drinks[0]}
            value={order}
          />
        </label>

        <div className="sentiment-block">
          <span>Rate the restaurant</span>
          <div className="sentiment-control" role="radiogroup" aria-label="Rate restaurant">
            {sentimentOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  aria-pressed={sentiment === option.label}
                  className={sentiment === option.label ? 'is-selected' : ''}
                  key={option.label}
                  onClick={() => setSentiment(option.label)}
                  type="button"
                >
                  <Icon size={17} />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <label className="public-row">
          <span>
            <input
              aria-label="Post publicly"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              type="checkbox"
            />
            <b>{isPublic ? 'Post publicly' : 'Keep private'}</b>
          </span>
          {isPublic ? <Send size={18} /> : <Lock size={18} />}
        </label>

        <button className="submit-cafe activity-submit" disabled={!canSubmit} type="submit">
          Submit activity
        </button>
      </motion.form>
    </motion.div>
  )
}

function AddPinScreen({
  city,
  onBack,
  onSubmit,
}: {
  city: City
  onBack: () => void
  onSubmit: (name: string, neighborhood: string) => void
}) {
  const [name, setName] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const canSubmit = name.trim().length > 1 && neighborhood.trim().length > 1

  return (
    <section className="pin-screen">
      <header className="log-topbar">
        <button aria-label="Back" className="round-icon" onClick={onBack} type="button">
          <ArrowLeft size={28} />
        </button>
        <strong>Add a pin</strong>
      </header>
      <p className="pin-eyebrow">Community map · {city}</p>
      <h1>Pin a cafe worth the detour.</h1>

      <div className="pin-preview-card" aria-hidden="true">
        <div className="pin-map-preview">
          <span className="pin-road one" />
          <span className="pin-road two" />
          <span className="pin-block a" />
          <span className="pin-block b" />
          <span className="pin-block c" />
          <div className="pin-marker-preview">
            <MapPin size={24} />
          </div>
        </div>
        <div className="pin-preview-copy">
          <strong>{name || 'Your cafe pin'}</strong>
          <small>{neighborhood || `A new ${city} coffee spot`}</small>
        </div>
      </div>

      <label className="log-search">
        <Search size={22} />
        <input
          aria-label="Cafe name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Cafe name"
          value={name}
        />
      </label>
      <label className="log-search">
        <MapPin size={22} />
        <input
          aria-label="Neighborhood or address"
          onChange={(event) => setNeighborhood(event.target.value)}
          placeholder="Neighborhood or address"
          value={neighborhood}
        />
      </label>
      <div className="pin-quality-row">
        <span><Check size={16} />Real cafe</span>
        <span><Camera size={16} />Photo later</span>
        <span><Sparkles size={16} />Community reviewed</span>
      </div>
      <button
        className="submit-cafe"
        disabled={!canSubmit}
        onClick={() => onSubmit(name.trim(), neighborhood.trim())}
        type="button"
      >
        Submit pin
      </button>
    </section>
  )
}

function BottomNav({
  activeTab,
  onAdd,
  onChange,
}: {
  activeTab: Tab
  onAdd: () => void
  onChange: (tab: Tab) => void
}) {
  const navItems = [
    { id: 'discover' as Tab, label: 'Discover', icon: Compass },
    { id: 'feed' as Tab, label: 'Feed', icon: Coffee },
    { id: 'book' as Tab, label: 'Book', icon: BookOpen },
    { id: 'you' as Tab, label: 'You', icon: User },
  ]

  return (
    <nav className="brew-nav" aria-label="Primary navigation">
      {navItems.slice(0, 2).map((item) => (
        <NavButton active={activeTab === item.id} item={item} key={item.id} onChange={onChange} />
      ))}
      <button aria-label="Create Brew activity" className="nav-add" onClick={onAdd} type="button">
        <Plus size={34} />
      </button>
      {navItems.slice(2).map((item) => (
        <NavButton active={activeTab === item.id} item={item} key={item.id} onChange={onChange} />
      ))}
    </nav>
  )
}

function NavButton({
  active,
  item,
  onChange,
}: {
  active: boolean
  item: { id: Tab; label: string; icon: typeof Compass }
  onChange: (tab: Tab) => void
}) {
  const Icon = item.icon
  return (
    <button className={active ? 'nav-button is-active' : 'nav-button'} onClick={() => onChange(item.id)} type="button">
      <Icon size={23} />
      <span>{item.label}</span>
    </button>
  )
}

export default App
