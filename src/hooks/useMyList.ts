import { useApp } from '../context/AppContext'

/**
 * Hook to manage user's "My List" (watchlist)
 * Synchronized via AppContext
 */
export function useMyList() {
  const { 
    myList, 
    addToMyList, 
    removeFromMyList, 
    toggleMyList, 
    isInMyList 
  } = useApp()

  return {
    myList,
    addToMyList,
    removeFromMyList,
    isInMyList,
    toggleMyList,
    count: myList.length
  }
}
