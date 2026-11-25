import { test, expect } from '@playwright/test'
import { createUser, resetDatabase, testUser } from './helper'
import {
  adminUser,
  apiConSesion,
  comentario,
  createAdmin,
  createCerro,
  createUserWith,
  datosCerro,
  editarComentario,
  login,
  otroUser,
  pngValido,
  publicarComentario,
} from './crud-helper'

test.beforeEach(async ({ request }) => {
  await resetDatabase(request)
  await createUser(request)
  await createAdmin(request)
})

test.describe('CRUD de cerros', () => {
  test('el admin crea un cerro desde el formulario y aparece en la lista', async ({ page }) => {
    await login(page, adminUser.username, adminUser.password)
    await page.getByRole('banner').getByRole('link', { name: 'Crear cerro' }).click()
    await expect(page).toHaveURL('/form')

    await page.getByLabel('Nombre').fill('Cerro Nuevo E2E')
    await page.getByLabel('Altura (m)').fill('2100')
    await page.getByRole('combobox', { name: 'Dificultad' }).click()
    await page.getByRole('option', { name: 'Alta' }).click()
    await page.getByLabel('Ubicación').fill('Lo Barnechea')
    await page.getByLabel('Descripción').fill('Creado desde Playwright')
    await page.getByRole('button', { name: 'Crear', exact: true }).click()

    await expect(page).toHaveURL('/')
    await page.getByRole('heading', { name: 'Cerro Nuevo E2E' }).click()
    await expect(page.getByRole('heading', { name: 'Cerro Nuevo E2E', level: 4 })).toBeVisible()
    await expect(page.getByText('2100 m')).toBeVisible()
    await expect(page.getByText('Alta', { exact: true })).toBeVisible()
  })

  test('un usuario normal no puede crear cerros', async ({ page }) => {
    await login(page, testUser.username, testUser.password)
    await expect(page.getByRole('link', { name: 'Crear cerro' })).toHaveCount(0)

    await page.goto('/form')
    await expect(page.getByText('Solo los administradores pueden acceder a esta página.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Crear nuevo cerro' })).toHaveCount(0)

    const response = await page.request.post('/api/cerros', { ...(await apiConSesion(page)), data: datosCerro })
    expect(response.status()).toBe(403)
  })

  test('se lee el detalle de un cerro', async ({ page, request }) => {
    const id = await createCerro(request)
    await page.goto(`/${id}`)

    await expect(page.getByRole('heading', { name: datosCerro.nombre })).toBeVisible()
    await expect(page.getByText(datosCerro.descripcion)).toBeVisible()
    await expect(page.getByText(`${datosCerro.altura} m`)).toBeVisible()
  })

  test('solo el admin edita y elimina cerros', async ({ page, request }) => {
    const id = await createCerro(request)

    await login(page, testUser.username, testUser.password)
    let response = await page.request.put(`/api/cerros/${id}`, { ...(await apiConSesion(page)), data: { ...datosCerro, nombre: 'Hackeado' } })
    expect(response.status()).toBe(403)
    response = await page.request.delete(`/api/cerros/${id}`, await apiConSesion(page))
    expect(response.status()).toBe(403)
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()

    await login(page, adminUser.username, adminUser.password)
    response = await page.request.put(`/api/cerros/${id}`, { ...(await apiConSesion(page)), data: { ...datosCerro, nombre: 'Cerro Editado' } })
    expect(response.status()).toBe(200)
    await page.goto(`/${id}`)
    await expect(page.getByRole('heading', { name: 'Cerro Editado' })).toBeVisible()

    response = await page.request.delete(`/api/cerros/${id}`, await apiConSesion(page))
    expect(response.status()).toBe(204)
    await page.reload()
    await expect(page.getByText('Cerro no encontrado.')).toBeVisible()
  })
})

test.describe('CRUD de comentarios', () => {
  let cerroId: string

  test.beforeEach(async ({ request }) => {
    cerroId = await createCerro(request)
  })

  test('sin sesión se comenta como Anónimo y no se puede editar ni eliminar', async ({ page }) => {
    await page.goto(`/${cerroId}`)
    await publicarComentario(page, 'Comentario de invitado')

    const item = comentario(page, 'Comentario de invitado')
    await expect(item.getByText('Anónimo')).toBeVisible()
    await expect(item.getByRole('button', { name: 'Editar' })).toHaveCount(0)
    await expect(item.getByRole('button', { name: 'Eliminar' })).toHaveCount(0)
    await expect(page.getByText('Inicia sesión para subir fotos.')).toBeVisible()

    // Los comentarios se ven siempre, también al recargar.
    await page.reload()
    await expect(comentario(page, 'Comentario de invitado')).toBeVisible()
  })

  test('el autor crea y edita su comentario, pero no lo elimina', async ({ page }) => {
    await login(page, testUser.username, testUser.password)
    await page.goto(`/${cerroId}`)
    await publicarComentario(page, 'Texto original')

    const item = comentario(page, 'Texto original')
    await expect(item.getByText(testUser.username, { exact: true })).toBeVisible()
    await expect(item.getByText(/para editar/)).toBeVisible()
    await expect(item.getByRole('button', { name: 'Eliminar' })).toHaveCount(0)

    await editarComentario(page, 'Texto original', 'Texto corregido')

    const editado = comentario(page, 'Texto corregido')
    await expect(editado).toBeVisible()
    await expect(editado.getByText('(editado)')).toBeVisible()
    await expect(comentario(page, 'Texto original')).toHaveCount(0)

    await page.reload()
    await expect(comentario(page, 'Texto corregido')).toBeVisible()
  })

  test('el autor deja de poder editar después de 5 minutos', async ({ page }) => {
    await page.clock.install()
    await login(page, testUser.username, testUser.password)
    await page.goto(`/${cerroId}`)
    await publicarComentario(page, 'Con plazo')

    const item = comentario(page, 'Con plazo')
    await expect(item.getByRole('button', { name: 'Editar' })).toBeVisible()

    await page.clock.fastForward('05:01')
    await expect(item.getByRole('button', { name: 'Editar' })).toHaveCount(0)
  })

  test('otro usuario no puede editar comentarios ajenos', async ({ page, request }) => {
    await createUserWith(request, otroUser)
    await login(page, testUser.username, testUser.password)
    await page.goto(`/${cerroId}`)
    await publicarComentario(page, 'Comentario ajeno')
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()

    await login(page, otroUser.username, otroUser.password)
    await page.goto(`/${cerroId}`)
    const item = comentario(page, 'Comentario ajeno')
    await expect(item).toBeVisible()
    await expect(item.getByRole('button', { name: 'Editar' })).toHaveCount(0)
    await expect(item.getByRole('button', { name: 'Eliminar' })).toHaveCount(0)
  })

  test('el admin edita sin plazo y elimina cualquier comentario', async ({ page }) => {
    await page.goto(`/${cerroId}`)
    await publicarComentario(page, 'Comentario a moderar')
    await publicarComentario(page, 'Comentario a eliminar')

    await login(page, adminUser.username, adminUser.password)
    await page.goto(`/${cerroId}`)

    const aModerar = comentario(page, 'Comentario a moderar')
    await expect(aModerar.getByText(/para editar/)).toHaveCount(0)
    await editarComentario(page, 'Comentario a moderar', 'Comentario moderado')

    page.once('dialog', dialog => dialog.accept())
    await comentario(page, 'Comentario a eliminar').getByRole('button', { name: 'Eliminar' }).click()
    await expect(comentario(page, 'Comentario a eliminar')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Comentarios (1)' })).toBeVisible()

    await page.reload()
    await expect(comentario(page, 'Comentario a eliminar')).toHaveCount(0)
    await expect(comentario(page, 'Comentario moderado')).toBeVisible()
  })

  test('cancelar la confirmación no elimina el comentario', async ({ page }) => {
    await page.goto(`/${cerroId}`)
    await publicarComentario(page, 'Sigue aquí')
    await login(page, adminUser.username, adminUser.password)
    await page.goto(`/${cerroId}`)

    page.once('dialog', dialog => dialog.dismiss())
    await comentario(page, 'Sigue aquí').getByRole('button', { name: 'Eliminar' }).click()
    await page.reload()
    await expect(comentario(page, 'Sigue aquí')).toBeVisible()
  })

  test('un usuario sube fotos válidas y se rechazan otros formatos', async ({ page }) => {
    await login(page, testUser.username, testUser.password)
    await page.goto(`/${cerroId}`)
    const selector = page.locator('input[type="file"]')

    await selector.setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('hola') })
    await expect(page.getByRole('alert')).toHaveText('"notas.txt" no es PNG, JPG ni WEBP.')

    await selector.setInputFiles(pngValido)
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page.getByRole('img', { name: 'foto.png' })).toBeVisible()

    await publicarComentario(page, 'Comentario con foto')
    const foto = comentario(page, 'Comentario con foto').getByRole('img', { name: `Foto 1 de ${testUser.username}` })
    await expect(foto).toBeVisible()
    // La imagen la sirve el backend y carga correctamente.
    await expect.poll(() => foto.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1)
  })
})
