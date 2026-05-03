import { useEffect, useState } from 'react'
import type { Movie } from '../services/api'

/**
 * Hook to manage user's "My List" (watchlist)
 * Persists to localStorage for data persistence
 * Can be used to train personalized recommendations
 */
export function useMyList() {
  const [myList, setMyList] = useState<Movie[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('myList')
    if (stored) {
      try {
        setMyList(JSON.parse(stored))
      } catch (err) {
        console.error('Failed to load myList from localStorage:', err)
      }
    }
    setIsLoaded(true)
  }, [])

  // Add movie to list
  const addToMyList = (movie: Movie) => {
    setMyList((prev) => {
      // Check if already in list
      if (prev.some((m) => m.title === movie.title)) {
        return prev
      }
      const updated = [...prev, movie]
      localStorage.setItem('myList', JSON.stringify(updated))
      return updated
    })
  }

  // Remove movie from list
  const removeFromMyList = (title: string) => {
    setMyList((prev) => {
      const updated = prev.filter((m) => m.title !== title)
      localStorage.setItem('myList', JSON.stringify(updated))
      return updated
    })
  }

  // Check if movie is in list
  const isInMyList = (title: string) => {
    return myList.some((m) => m.title === title)
  }

  // Clear entire list
  const clearMyList = () => {
    setMyList([])
    localStorage.removeItem('myList')
  }

  // Toggle movie in/out of list
  const toggleMyList = (movie: Movie) => {
    if (isInMyList(movie.title)) {
      removeFromMyList(movie.title)
    } else {
      addToMyList(movie)
    }
  }

  // Get titles for API (useful for training recommendations)
  const getMyListTitles = () => {
    return myList.map((m) => m.title)
  }

  return {
    myList,
    isLoaded,
    addToMyList,
    removeFromMyList,
    isInMyList,
    clearMyList,
    toggleMyList,
    getMyListTitles,
    count: myList.length
  }
}
