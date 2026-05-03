import { useEffect, useState } from 'react'
import { X, Play, Plus, Check } from 'lucide-react'
import type { Movie } from '../services/api'

interface MovieDetail extends Movie {
  overview?: string
  backdrop_url?: string
  backdrop_path?: string
  genres?: string[]
  cast?: Array<{
    name: string
    character: string
    profile_path?: string
  }>
  runtime?: number
  vote_average?: number
  release_date?: string
}

interface MovieDetailModalProps {
  movie: Movie | null
  isOpen: boolean
  onClose: () => void
}

export function MovieDetailModal({ movie, isOpen, onClose }: MovieDetailModalProps) {
  const [details, setDetails] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInMyList, setIsInMyList] = useState(false)

  useEffect(() => {
    if (!isOpen || !movie?.title) return

    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `http://localhost:5000/movie-details/${encodeURIComponent(movie.title)}`
        )
        
        // Even if the endpoint returns error, use what we have from cache
        const data = await response.json()
        if (response.ok) {
          setDetails(data)
        } else {
          // Use cached data as fallback
          console.warn('Failed to fetch full details, using cached data')
          setDetails(movie as MovieDetail)
        }
      } catch (err) {
        console.warn('Error loading movie details, using cached data')
        // Still show movie with cached data
        setDetails(movie as MovieDetail)
      } finally {
        setLoading(false)
      }
    }

    // Check if movie is in My List
    const myList = JSON.parse(localStorage.getItem('myList') || '[]')
    setIsInMyList(myList.some((m: Movie) => m.title === movie.title))

    fetchDetails()
  }, [isOpen, movie])

  const toggleMyList = () => {
    if (!details) return

    const myList = JSON.parse(localStorage.getItem('myList') || '[]')
    
    if (isInMyList) {
      // Remove from list
      const updated = myList.filter((m: Movie) => m.title !== details.title)
      localStorage.setItem('myList', JSON.stringify(updated))
      setIsInMyList(false)
    } else {
      // Add to list
      myList.push(details)
      localStorage.setItem('myList', JSON.stringify(myList))
      setIsInMyList(true)
    }
  }

  const handlePlay = () => {
    // Could open a player modal, external link, or just log it
    console.log(`Playing ${details?.title}`)
    // For now, show a notification-style message
    alert(`▶ Now playing: ${details?.title}`)
  }

  if (!isOpen || !movie) return null

  const displayDetails = details || (movie as MovieDetail)
  const backdropUrl = displayDetails.backdrop_url || displayDetails.poster_url
  const genres = displayDetails.genres || []
  const cast = displayDetails.cast || []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-800 to-black rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero Backdrop Section - LARGER & MORE PROMINENT */}
          <div className="relative h-80 w-full overflow-hidden">
            {backdropUrl && (
              <img
                src={backdropUrl}
                alt={displayDetails.title}
                className="w-full h-full object-cover"
              />
            )}
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900" />
            
            {/* Close Button - Top Right */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Title Overlay on Hero */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent">
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                {displayDetails.title}
              </h1>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="px-8 py-6">
            {/* Rating, Runtime, Genres Bar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              {displayDetails.vote_average && displayDetails.vote_average > 0 && (
                <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                  <span className="text-2xl text-yellow-400">★</span>
                  <span className="text-white font-bold text-lg">
                    {(displayDetails.vote_average / 2).toFixed(1)}/5
                  </span>
                </div>
              )}

              {displayDetails.runtime && displayDetails.runtime > 0 && (
                <div className="text-white font-semibold bg-gray-700/30 px-4 py-2 rounded-lg">
                  {displayDetails.runtime} min
                </div>
              )}

              {genres && genres.length > 0 && (
                <div className="flex gap-2">
                  {genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="px-4 py-2 bg-red-600/20 text-red-300 text-sm font-semibold rounded-lg border border-red-600/40"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons - IMPROVED STYLING */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handlePlay}
                className="flex items-center justify-center gap-3 px-8 py-3 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-100 transition-all hover:shadow-lg"
              >
                <Play className="w-6 h-6 fill-current" />
                Play
              </button>
              <button
                onClick={toggleMyList}
                className={`flex items-center justify-center gap-3 px-8 py-3 font-bold text-lg rounded-lg transition-all hover:shadow-lg ${
                  isInMyList
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {isInMyList ? (
                  <>
                    <Check className="w-6 h-6" />
                    In My List
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    My List
                  </>
                )}
              </button>
            </div>

            {/* Release Date */}
            {displayDetails.release_date && (
              <div className="mb-6 text-gray-400 text-sm">
                <span className="font-semibold text-gray-300">Release: </span>
                {new Date(displayDetails.release_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}

            {/* Description */}
            {displayDetails.overview && displayDetails.overview !== 'Details not available' && (
              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed text-base">
                  {displayDetails.overview}
                </p>
              </div>
            )}

            {/* Cast Section */}
            {cast && cast.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {cast.map((actor, idx) => (
                    <div key={idx} className="text-center hover:opacity-80 transition">
                      {actor.profile_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-32 rounded-lg object-cover mb-3 shadow-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      <p className="text-white font-semibold text-sm line-clamp-2">
                        {actor.name}
                      </p>
                      {actor.character && (
                        <p className="text-gray-400 text-xs line-clamp-2">
                          {actor.character}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">Loading details...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
