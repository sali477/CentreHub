import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const performSearch = createAsyncThunk(
  'search/perform',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/search', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    active: false,
    query: '',
    centers: [],
    courses: [],
    loading: false,
    error: null,
    meta: null,
    locationError: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.active = false;
      state.query = '';
      state.centers = [];
      state.courses = [];
      state.error = null;
      state.meta = null;
      state.locationError = null;
    },
    setLocationError: (state, action) => {
      state.locationError = action.payload;
    },
    clearLocationError: (state) => {
      state.locationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.active = true;
        state.query = action.payload.query || '';
        state.centers = action.payload.data?.centers || [];
        state.courses = action.payload.data?.courses || [];
        state.meta = action.payload.meta || null;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch, setLocationError, clearLocationError } = searchSlice.actions;
export default searchSlice.reducer;
