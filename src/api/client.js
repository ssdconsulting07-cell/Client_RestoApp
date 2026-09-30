// Client API vers le backend commun (Spring Boot).
// Base = /api/v1 (voir backend/contrat-api/openapi.yaml, source de verite du contrat)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

async function handleResponse(res) {
  if (!res.ok) {
    // Format d'erreur standard (voir ApiError cote backend) : { code, message, field }
    const body = await res.json().catch(() => null)
    const error = new Error(body?.message || `Erreur API (${res.status})`)
    error.code = body?.code
    error.field = body?.field
    error.status = res.status
    throw error
  }
  return res.status === 204 ? null : res.json()
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`)
  return handleResponse(res)
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}
