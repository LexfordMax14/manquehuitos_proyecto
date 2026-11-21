import { configureStore } from '@reduxjs/toolkit'
import filtroReducer from './filtroSlice'

export const store = configureStore({
  reducer: {
    filtro: filtroReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch