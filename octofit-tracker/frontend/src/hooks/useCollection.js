import { useEffect, useState } from 'react'
import { fetchCollection } from '../api.js'

const initialState = {
  key: '',
  records: [],
  count: 0,
  next: null,
  previous: null,
  loading: true,
  error: '',
}

export function useCollection(component, query = '') {
  const key = `${component}?${query}`
  const [state, setState] = useState(initialState)

  useEffect(() => {
    const controller = new AbortController()

    fetchCollection(component, query, controller.signal)
      .then((result) => {
        setState({ ...result, key, loading: false, error: '' })
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ ...initialState, key, loading: false, error: error.message })
        }
      })

    return () => controller.abort()
  }, [component, key, query])

  return state.key === key ? state : initialState
}