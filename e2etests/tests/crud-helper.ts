import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { loginWith } from './helper'

export const adminUser = {
  username: 'admin-e2e',
  email: 'admin-e2e@example.test',
  password: 'secreto123',
}

export const otroUser = {
  username: 'otro-e2e',
  email: 'otro-e2e@example.test',
  password: 'secreto123',
}

export const datosCerro = {
  nombre: 'Cerro de Prueba',
  descripcion: 'Cerro creado para las pruebas E2E',
  altura: 1500,
  dificultad: 'Media',
  ubicacion: 'Santiago',
  imagenes: ['/images/manquehue.jpg'],
  descansos: 2,
  banos: false,
}

// Imagen PNG válida de 1x1 píxel.
export const pngValido = {
  name: 'foto.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  ),
}

export const createUserWith = async (request: APIRequestContext, user: typeof adminUser) => {
  const response = await request.post('/api/usuarios', { data: user })
  expect(response.status()).toBe(201)
}

export const createAdmin = async (request: APIRequestContext) => {
  await createUserWith(request, adminUser)
  const response = await request.post('/api/testing/admin', { data: { username: adminUser.username } })
  expect(response.status()).toBe(204)
}

/* Crea un cerro directamente en la base y devuelve su id */
export const createCerro = async (request: APIRequestContext, data = datosCerro): Promise<string> => {
  const response = await request.post('/api/testing/cerros', { data })
  expect(response.status()).toBe(201)
  return (await response.json()).id
}

/* Inicia sesión desde /login y espera a que el header muestre al usuario */
export const login = async (page: Page, username: string, password: string) => {
  await page.goto('/login')
  await loginWith(page, username, password)
  await expect(page.getByRole('banner').getByText(username, { exact: true })).toBeVisible()
}

/* Publica un comentario en la página del cerro abierta */
export const publicarComentario = async (page: Page, contenido: string) => {
  await page.getByRole('textbox', { name: 'Escribe un comentario' }).fill(contenido)
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(comentario(page, contenido)).toBeVisible()
}

/* El <li> del comentario que contiene el texto */
export const comentario = (page: Page, texto: string) =>
  page.getByRole('listitem').filter({ hasText: texto })

/* Edita un comentario desde su botón Editar y guarda el nuevo texto */
export const editarComentario = async (page: Page, textoActual: string, nuevoTexto: string) => {
  await comentario(page, textoActual).getByRole('button', { name: 'Editar' }).click()
  // Mientras se edita, el texto está dentro del textbox: se ubica el comentario por su formulario.
  const enEdicion = page.getByRole('listitem').filter({ has: page.getByRole('button', { name: 'Guardar' }) })
  await enEdicion.getByRole('textbox').fill(nuevoTexto)
  await enEdicion.getByRole('button', { name: 'Guardar' }).click()
  await expect(comentario(page, nuevoTexto)).toBeVisible()
}

/* Llama a la API con la sesión del navegador (cookie + token CSRF) */
export const apiConSesion = async (page: Page) => {
  const csrf = await page.evaluate(() => localStorage.getItem('csrfToken'))
  return { headers: { 'X-CSRF-Token': csrf ?? '' } }
}
