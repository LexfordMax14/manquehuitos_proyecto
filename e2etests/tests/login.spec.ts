import { test, expect } from '@playwright/test'
import { createUser, loginWith, resetDatabase, testUser } from './helper'

test.beforeEach(async ({ request }) => {
  await resetDatabase(request)
  await createUser(request)
})

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('inicia sesión con un usuario existente', async ({ page }) => {
    await loginWith(page, testUser.username, testUser.password)

    await expect(page).toHaveURL('/')
    const header = page.getByRole('banner')
    await expect(header.getByText(testUser.username, { exact: true })).toBeVisible()
    await expect(header.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible()

    // La sesión se mantiene al recargar (F5)
    await page.reload()
    await expect(header.getByText(testUser.username, { exact: true })).toBeVisible()
  })

  test('rechaza una contraseña incorrecta', async ({ page }) => {
    await loginWith(page, testUser.username, 'incorrecta')

    await expect(page.getByRole('alert')).toHaveText('Usuario o contraseña incorrectos')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toHaveCount(0)
  })

  test('rechaza un usuario inexistente', async ({ page }) => {
    await loginWith(page, 'usuario-inexistente', 'clave-invalida')

    await expect(page.getByRole('alert')).toHaveText('Usuario o contraseña incorrectos')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()
  })
})

test.describe('Acceso protegido', () => {
  test('sin sesión, /form redirige a login', async ({ page }) => {
    await page.goto('/form')

    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Crear nuevo cerro' })).toHaveCount(0)
  })

  test('después de iniciar sesión vuelve a la página protegida', async ({ page }) => {
    await page.goto('/form')
    await expect(page).toHaveURL('/login')

    await loginWith(page, testUser.username, testUser.password)

    await expect(page).toHaveURL('/form')
    await expect(page.getByRole('heading', { name: 'Crear nuevo cerro' })).toBeVisible()

    // Al recargar sigue en la página protegida
    await page.reload()
    await expect(page).toHaveURL('/form')
    await expect(page.getByRole('heading', { name: 'Crear nuevo cerro' })).toBeVisible()
  })

  test('al cerrar sesión se pierde el acceso a /form', async ({ page }) => {
    await page.goto('/login')
    await loginWith(page, testUser.username, testUser.password)
    await expect(page.getByRole('banner').getByText(testUser.username, { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()

    await page.goto('/form')
    await expect(page).toHaveURL('/login')
  })

  test('la API rechaza crear un cerro sin sesión', async ({ request }) => {
    const response = await request.post('/api/cerros', {
      data: { nombre: 'Cerro sin sesión', altura: 1000, dificultad: 'Baja', ubicacion: 'Santiago', imagenes: [] },
    })
    expect(response.status()).toBe(401)
  })
})
