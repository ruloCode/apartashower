// Lista de regalos del apartashower.
// Vive en Netlify Blobs: no se pausa ni caduca, al contrario que el Supabase gratuito.
import { getStore } from "@netlify/blobs";

const CLAVE = "lista";

// La lista de salida. Solo se usa la primera vez; despues manda lo guardado.
const INICIAL = [
  { id: 1,  nombre: "Set de vasos de vidrio",            icono: "i-vaso" },
  { id: 2,  nombre: "Jarra de vidrio",                   icono: "i-jarra" },
  { id: 3,  nombre: "Tazas, tazones o ensaladeras",      icono: "i-tazon" },
  { id: 4,  nombre: "Sartenes antiadherentes",           icono: "i-sarten" },
  { id: 5,  nombre: "Ollas",                             icono: "i-olla" },
  { id: 6,  nombre: "Set de cuchillos",                  icono: "i-cuchillos" },
  { id: 7,  nombre: "Tablas para picar",                 icono: "i-tabla" },
  { id: 8,  nombre: "Pelador y/o rallador multiusos",    icono: "i-rallador" },
  { id: 9,  nombre: "Set de utensilios de silicona (espátula, cucharón, escurridor)", icono: "i-utensilios" },
  { id: 10, nombre: "Picatodo",                          icono: "i-picatodo" },
  { id: 11, nombre: "Licuadora",                         icono: "i-licuadora" },
  { id: 12, nombre: "Contenedores para pastas, granos…", icono: "i-frasco" },
  { id: 15, nombre: "Almohadas de cama",                 icono: "i-almohada" },
  { id: 16, nombre: "Mesa de planchar pequeña",          icono: "i-planchar" },
  { id: 14, nombre: "Toallas (evitar blanco plis)",      icono: "i-toalla" },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function almacen() {
  return getStore({ name: "apartashower", consistency: "strong" });
}

// Reconcilia lo guardado con la lista de arriba: conserva quien ya aparto algo,
// suma los regalos nuevos y descarta los que se quitaron.
function fundir(guardado) {
  const apartados = new Map((guardado ?? []).map((r) => [r.id, r.tomado === true]));
  return INICIAL.map((r) => ({ ...r, tomado: apartados.get(r.id) === true }));
}

async function leer(store) {
  const guardado = await store.get(CLAVE, { type: "json" });
  const lista = fundir(guardado);
  // Si la lista cambio (regalos nuevos o retirados), se deja al dia.
  if (!guardado || guardado.length !== lista.length) await store.setJSON(CLAVE, lista);
  return lista;
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const store = almacen();

  if (req.method === "POST") {
    try {
      const { id, tomado } = await req.json();
      const lista = await leer(store);
      const i = lista.findIndex((r) => r.id === Number(id));
      if (i !== -1) {
        lista[i].tomado = tomado === true;
        await store.setJSON(CLAVE, lista);
      }
      return new Response(JSON.stringify(lista), { headers: CORS });
    } catch {
      return new Response(JSON.stringify(await leer(store)), { headers: CORS });
    }
  }

  return new Response(JSON.stringify(await leer(store)), { headers: CORS });
};
