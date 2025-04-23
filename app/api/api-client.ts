"use client"

import useSWR from 'swr'

export function useSongs() {
  const { data, error, isLoading } = useSWR('/api/songs', (...args) => fetch(...args).then(res => res.json()))
  return {
    songs: data,
    isLoading,
    isError: error,
  }
}
