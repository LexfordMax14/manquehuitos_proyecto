import { expect, type APIRequestContext, type Page } from '@playwright/test'

export const testUser = {
  username: 'playwright',
  email: 'playwright@example.test',
  password: 'secreto123',
}

export const resetDatabase = async (request: APIRequestContext) => {
  const response = await request.post('/api/testing/reset')
  expect(response.status()).toBe(204)
}

export const createUser = async (request: APIRequestContext) => {
  const response = await request.post('/api/usuarios', { data: testUser })
  expect(response.status()).toBe(201)
}

/* Completa el formulario de login de la página actual y lo envía */
export const loginWith = async (page: Page, username: string, password: string) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
}
