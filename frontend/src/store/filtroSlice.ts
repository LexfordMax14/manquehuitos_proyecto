import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FiltroState {
  busqueda: string
  dificultad: string
}

const initialState: FiltroState = {
  busqueda: '',
  dificultad: 'Todas',
}

const filtroSlice = createSlice({
  name: 'filtro',
  initialState,
  reducers: {
    cambiarBusqueda(state, action: PayloadAction<string>) {
      state.busqueda = action.payload
    },

    cambiarDificultad(state, action: PayloadAction<string>) {
      state.dificultad = action.payload
    },

    limpiarFiltros() {
      return initialState
    },
  },
})

export const {
  cambiarBusqueda,
  cambiarDificultad,
  limpiarFiltros,
} = filtroSlice.actions

export default filtroSlice.reducer