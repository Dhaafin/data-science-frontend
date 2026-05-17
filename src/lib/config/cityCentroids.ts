/**
 * Static Lookup Table for Indonesian City Centroids
 * 
 * Bypasses Nominatim API limits by providing instantaneous 
 * offline latitude/longitude resolution for our 60 mapped hubs.
 */

export const cityCentroids: Record<string, [number, number]> = {
  // --- DKI Jakarta ---
  "Jakarta": [-6.2088, 106.8456],
  
  // --- Jawa Barat ---
  "Bandung": [-6.9175, 107.6191],
  "Bogor": [-6.5971, 106.7932],
  "Depok": [-6.4025, 106.7942],
  "Bekasi": [-6.2383, 106.9756],
  "Cimahi": [-6.8723, 107.5436],
  "Sukabumi": [-6.9237, 106.9287],
  "Cirebon": [-6.7320, 108.5523],
  "Tasikmalaya": [-7.3196, 108.2023],
  "Garut": [-7.2279, 107.9087],
  
  // --- Jawa Tengah ---
  "Semarang": [-6.9667, 110.4167],
  "Surakarta": [-7.5561, 110.8317], // Solo
  "Magelang": [-7.4705, 110.2178],
  "Tegal": [-6.8694, 109.1402],
  "Pekalongan": [-6.8887, 109.6753],
  "Purwokerto": [-7.4243, 109.2302],
  "Salatiga": [-7.3305, 110.5084],
  "Brebes": [-6.8706, 109.0344],
  "Kendal": [-6.9202, 110.2025],
  
  // --- DI Yogyakarta ---
  "Yogyakarta": [-7.7956, 110.3695],
  "Sleman": [-7.7156, 110.3556],
  "Bantul": [-7.8870, 110.3278],
  
  // --- Jawa Timur ---
  "Surabaya": [-7.2575, 112.7521],
  "Malang": [-7.9666, 112.6326],
  "Sidoarjo": [-7.4453, 112.7173],
  "Kediri": [-7.8480, 112.0119],
  "Madiun": [-7.6298, 111.5239],
  "Banyuwangi": [-8.2192, 114.3692],
  "Jember": [-8.1721, 113.6995],
  "Probolinggo": [-7.7569, 113.2115],
  "Pasuruan": [-7.6453, 112.9075],
  "Nganjuk": [-7.6053, 111.9011],
  
  // --- Banten ---
  "Tangerang": [-6.1702, 106.6403],
  "Serang": [-6.1200, 106.1503],
  "Cilegon": [-6.0175, 106.0538],
  "Pandeglang": [-6.3088, 106.1065],
  
  // --- Bali & Nusa Tenggara ---
  "Denpasar": [-8.6500, 115.2167],
  "Gianyar": [-8.5435, 115.3268],
  "Mataram": [-8.5833, 116.1167],
  "Kupang": [-10.1583, 123.5833],
  
  // --- Sumatera ---
  "Medan": [3.5952, 98.6722],
  "Padang": [-0.9492, 100.3543],
  "Palembang": [-2.9909, 104.7566],
  "Pekanbaru": [0.5333, 101.4500],
  "Banda Aceh": [5.5483, 95.3238],
  "Bandar Lampung": [-5.4500, 105.2667],
  "Batam": [1.0828, 104.0305],
  "Jambi": [-1.6101, 103.6131],
  "Bengkulu": [-3.7928, 102.2600],
  
  // --- Kalimantan ---
  "Pontianak": [-0.0263, 109.3425],
  "Balikpapan": [-1.2654, 116.8312],
  "Samarinda": [-0.5022, 117.1536],
  "Banjarmasin": [-3.3167, 114.5901],
  "Palangkaraya": [-2.2083, 113.9167],
  
  // --- Sulawesi ---
  "Makassar": [-5.1477, 119.4327],
  "Manado": [1.4931, 124.8413],
  "Palu": [-0.8917, 119.8707],
  "Kendari": [-3.9985, 122.5126],
  "Gorontalo": [0.5416, 123.0595],
  "Soppeng": [-4.3547, 119.8803], // Macanre, Soppeng
  
  // --- Maluku & Papua ---
  "Ambon": [-3.6954, 128.1814],
  "Ternate": [0.8000, 127.4000],
  "Jayapura": [-2.5489, 140.7178],
  "Sorong": [-0.8811, 131.2936],
  "Manokwari": [-0.8615, 134.0620],
  "Timika": [-4.5303, 136.8850]
};
