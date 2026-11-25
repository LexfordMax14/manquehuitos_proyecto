import { createSlice, createAsyncThunk, } from '@reduxjs/toolkit'
import comentariosService from '../services/comentarios'
import type { ComentarioType } from '../types/comentario'

// Estado del slice
interface ComentariosState {
  comentariosPorCerro: Record<string, ComentarioType[]>
  loadingPorCerro: Record<string, boolean>
  guardandoPorCerro: Record<string, boolean>
  errorPorCerro: Record<string, string | null>
  requestIdPorCerro: Record<string, string>
}

const initialState: ComentariosState = {
  comentariosPorCerro: {},
  loadingPorCerro: {},
  guardandoPorCerro: {},
  errorPorCerro: {},
  requestIdPorCerro: {},
}

// Obtener comentarios de un cerro
export const obtenerComentarios = createAsyncThunk(
  'comentarios/obtener',
  async (cerroId: string) => {
    const comentarios = await comentariosService.getByCerro(cerroId)

    return { cerroId, comentarios }
  }
)

// Crear un comentario
export const crearComentario = createAsyncThunk(
  'comentarios/crear',
  async (data: {
    cerroId: string
    contenido: string
    autor: string
  }) => {
    const comentario = await comentariosService.create(
      {
        contenido: data.contenido,
        autor: data.autor,
      },
      data.cerroId
    )

    return {
      cerroId: data.cerroId,
      comentario,
    }
  }
)

const comentariosSlice = createSlice({
  name: 'comentarios',
  initialState,

  reducers: {},

  extraReducers: builder => {
    builder
      // OBTENER COMENTARIOS
      .addCase(obtenerComentarios.pending, (state, action) => {
        const cerroId = action.meta.arg

        state.loadingPorCerro[cerroId] = true
        state.errorPorCerro[cerroId] = null
        state.requestIdPorCerro[cerroId] = action.meta.requestId
      })

      .addCase(obtenerComentarios.fulfilled, (state, action) => {
        const { cerroId, comentarios } = action.payload

        if (state.requestIdPorCerro[cerroId] !== action.meta.requestId) {
          return
        }

        state.loadingPorCerro[cerroId] = false
        state.comentariosPorCerro[cerroId] = comentarios
        delete state.requestIdPorCerro[cerroId]
      })

      .addCase(obtenerComentarios.rejected, (state, action) => {
        const cerroId = action.meta.arg

        if (state.requestIdPorCerro[cerroId] !== action.meta.requestId) {
          return
        }

        state.loadingPorCerro[cerroId] = false
        state.errorPorCerro[cerroId] =
          'No se pudieron cargar los comentarios.'
        delete state.requestIdPorCerro[cerroId]
      })

      // CREAR COMENTARIO
      .addCase(crearComentario.pending, (state, action) => {
        const cerroId = action.meta.arg.cerroId

        state.guardandoPorCerro[cerroId] = true
        state.errorPorCerro[cerroId] = null
      })

      .addCase(crearComentario.fulfilled, (state, action) => {
        const { cerroId, comentario } = action.payload

        state.guardandoPorCerro[cerroId] = false

        if (!state.comentariosPorCerro[cerroId]) {
          state.comentariosPorCerro[cerroId] = []
        }

        state.comentariosPorCerro[cerroId].push(comentario)
      })

      .addCase(crearComentario.rejected, (state, action) => {
        const cerroId = action.meta.arg.cerroId

        state.guardandoPorCerro[cerroId] = false
        state.errorPorCerro[cerroId] =
          'No se pudo guardar el comentario.'
      })
  },
})

export default comentariosSlice.reducer