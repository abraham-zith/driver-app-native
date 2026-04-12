import { create } from 'zustand';

/* ================= STORE TYPE ================= */

interface RideState {
  rides: any[];
  setRides: (rides: any[]) => void;
  loading: boolean;
  error: string | null;
}

/* ================= STORE ================= */

export const useRideStore = create<RideState>((set) => ({
  rides: [],
  loading: false,
  error: null,

  setRides: (rides) => set({ rides }),
}));
