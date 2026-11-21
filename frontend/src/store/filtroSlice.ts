import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FiltroState {
  busqueda: string
}

const initialState: FiltroState = {
  busqueda: '',
}

const filtroSlice = createSlice({
  name: 'filtro',
  initialState,
  reducers: {
    cambiarBusqueda(state, action: PayloadAction<string>) {
      state.busqueda = action.payload
    },

    limpiarBusqueda() {
      return initialState
    },
  },
})

export const {
  cambiarBusqueda,
  limpiarBusqueda,
} = filtroSlice.actions

export default filtroSlice.reducer