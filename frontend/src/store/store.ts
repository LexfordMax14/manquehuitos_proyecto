import { configureStore } from '@reduxjs/toolkit'
import filtroReducer from './filtroSlice'
import comentariosReducer from './comentariosSlice'

export const store = configureStore({
  reducer: {
    filtro: filtroReducer,
    comentarios: comentariosReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch