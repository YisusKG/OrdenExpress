import React, { useState } from "react"
import { useEffect } from "react"
import { Search, Clock, CheckCircle, XCircle, RefreshCw, DollarSign, ShoppingBag, AlertCircle, Volume2, VolumeX } from "lucide-react"
import { getPedidosRecepcion, cobrarPedido, entregarPedido, buscarPorFolio } from "../services/recepcionService"

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  const colors = { success: "#DCFCE7", error: "#FEE2E2", info: "#E0F2FE" }
  const textColors = { success: "#166534", error: "#991B1B", info: "#075985" }
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: colors[type], color: textColors[type],
      padding: "14px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 10
    }}>
      {type === "success" && <CheckCircle size={18} />}
      {type === "error" && <XCircle size={18} />}
      {type === "info" && <AlertCircle size={18} />}
      {message}
    </div>
  )
}

const METODOS = ["Todos", "Efectivo", "Tarjeta"]
const ESTADOS = ["Todos", "Pendiente", "Pagado", "En Preparacion", "Listo", "Entregado"]

const norm = (e) => {
  if (!e) return "?"
  if (e.includes("Preparaci")) return "En Preparacion"
  const sinAcento = e.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  if (sinAcento.includes("Preparaci")) return "En Preparacion"
  if (["Pagado", "Pendiente", "Listo", "Entregado", "Cancelado"].some(s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === sinAcento)) return e
  return e
}

const badge = (o) => {
  const e = norm(o)
  const m = {
    Pendiente: { bg: "#FDE68A", fg: "#92400E" },
    Pagado: { bg: "#BFDBFE", fg: "#1E40AF" },
    "En Preparacion": { bg: "#FECACA", fg: "#991B1B" },
    Listo: { bg: "#BBF7D0", fg: "#166534" },
    Entregado: { bg: "#E9D5FF", fg: "#7C3AED" },
    Cancelado: { bg: "#CBD5E1", fg: "#475569" }
  }
  return m[e] || m.Pendiente
}

const safeDate = (d) => {
  try { return d ? new Date(d) : new Date() } catch { return new Date() }
}

const val = (o, ...k) => {
  for (let x of k) { if (o && typeof o === "object" && x in o) return o[x] }
  return undefined
}

const nomProd = (d) => {
  // primero busca nombre_P directamente en el detalle
  const nm = val(d, "nombre_P") || val(d, "Nombre_P")
  if (nm) return nm
  // luego busca dentro de producto anidado
  const prod = val(d, "producto")
  if (prod && typeof prod === "object") {
    const nm2 = prod.nombre_P || prod.Nombre_P
    if (nm2) return nm2
    const pid = prod.iD_Producto || prod.ID_Producto
    return pid ? "Producto #" + pid : "Producto"
  }
  const pid2 = val(d, "iD_Producto") || val(d, "ID_Producto")
  return pid2 ? "Producto #" + pid2 : "Producto"
}

const fmtM = (n) => "$" + Number(n || 0).toFixed(2)
const fmtH = (f) => {
  try { return safeDate(f).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) } catch { return "--:--" }
}
const nomCl = (p) => {
  const cli = val(p, "cliente") || val(p, "Cliente")
  if (cli && typeof cli === "object") {
    const n = cli.nombre || cli.Nombre || cli.nombre_P || cli.Nombre_P
    const ap = cli.apellido_Paterno || cli.Apellido_Paterno || ""
    return n ? n + " " + ap : "Cliente"
  }
  if (typeof cli === "string") return cli
  return "Cliente"
}
const gId = (p) => val(p, "iD_Pedido") || val(p, "ID_Pedido")
const gDet = (p) => val(p, "detalles") || val(p, "Detalles") || []
const gFol = (p) => val(p, "folio") || val(p, "Folio") || "Sin folio"
const gTot = (p) => val(p, "total") || val(p, "Total") || 0
const gFec = (p) => val(p, "fecha") || val(p, "Fecha")
const gMet = (p) => val(p, "metodo_Pago") || "Efectivo"
const gEst = (p) => val(p, "estado") || val(p, "Estado") || "?"
const gCan = (d) => val(d, "cantidad") || val(d, "Cantidad") || 0
const gDTot = (d) => val(d, "total") || val(d, "Total") || 0

function StatCard({ label, value, color, desc }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 16, border: "1px solid #2a2a2a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ background: color + "20", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 900, color: color }}>{label.charAt(0)}</div>
        <div>
          <p style={{ color: "#444", fontSize: 10, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: color, margin: 0, lineHeight: 1 }}>{value}</p>
        </div>
      </div>
      <p style={{ color: "#444", fontSize: 11, marginTop: 8, marginBottom: 0 }}>{desc}</p>
    </div>
  )
}

export default function EmpleadoDashboard() {
  const [pedidos, setPedidos] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("pendientes")
  const [toast, setToast] = useState(null)
  const [filtMet, setFiltMet] = useState("Todos")
  const [filtEst, setFiltEst] = useState("Todos")
  const [expId, setExpId] = useState(null)
  const [modalP, setModalP] = useState(null)
  const [cobrando, setCobrando] = useState(false)

  const showToast = (msg, type = "info") => setToast({ message: msg, type })

  const cargarPedidos = async () => {
    setLoading(true)
    try {
      const data = await getPedidosRecepcion()
      setPedidos(Array.isArray(data) ? data : [])
    } catch {
      showToast("Error al cargar pedidos", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarPedidos() }, [])

  const handleCobrar = async (id) => {
    try {
      await cobrarPedido(id)
      showToast("Pedido cobrado correctamente", "success")
      cargarPedidos()
    } catch {
      showToast("Error al cobrar pedido", "error")
    }
  }

  const handleEntregar = async (id) => {
    try {
      await entregarPedido(id)
      showToast("Pedido entregado", "success")
      cargarPedidos()
    } catch {
      showToast("Error al entregar pedido", "error")
    }
  }

  const cobra = (ped) => {
    if (gMet(ped) !== "Efectivo") { showToast("Solo efectivo", "warning"); return }
    if (gEst(ped) !== "Pendiente") { showToast("No pendiente", "warning"); return }
    setModalP(ped)
  }

  const confCobro = async () => {
    if (!modalP) return
    setCobrando(true)
    try {
      await cobrarPedido(gId(modalP))
      showToast("Cobrado: " + gFol(modalP), "success")
      setModalP(null)
      cargarPedidos()
    } catch (e) {
      showToast(e.response && e.response.data ? e.response.data.message : "Error", "error")
    } finally {
      setCobrando(false)
    }
  }

  const entrega = async (ped) => {
    if (gMet(ped) === "Efectivo" && gEst(ped) === "Pendiente") { showToast("No se puede entregar un pedido en efectivo sin cobrar", "warning"); return }
    if (norm(gEst(ped)) !== "Listo") { showToast("Debe estar Listo", "warning"); return }
    try {
      await entregarPedido(gId(ped))
      showToast("Entregado: " + gFol(ped), "success")
      cargarPedidos()
    } catch (e) {
      showToast(e.response && e.response.data ? e.response.data.message : "Error", "error")
    }
  }

  const filtrados = pedidos.filter(p => {
    const matchTab = tab === "pendientes"
      ? norm(gEst(p)) === "Pendiente" || norm(gEst(p)) === "Pagado" || norm(gEst(p)) === "En Preparacion" || norm(gEst(p)) === "Listo"
      : norm(gEst(p)) === "Entregado"
    const matchSearch = gFol(p).toLowerCase().includes(busqueda.toLowerCase()) || String(gId(p)).includes(busqueda)
    const mm = filtMet === "Todos" || gMet(p) === filtMet
    const em = filtEst === "Todos" || norm(gEst(p)) === filtEst
    return matchTab && matchSearch && mm && em
  })

  const pend = pedidos.filter(p => gEst(p) === "Pendiente" && gMet(p) === "Efectivo")
  const listos = pedidos.filter(p => norm(gEst(p)) === "Listo")
  const entreHoy = pedidos.filter(p => {
    try { return gEst(p) === "Entregado" && safeDate(gFec(p)).toDateString() === new Date().toDateString() } catch { return false }
  })
  const enProc = pedidos.filter(p => !["Entregado", "Cancelado"].includes(norm(gEst(p))))

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: 28, color: "#fff" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 22, marginBottom: 4 }}>
        <ShoppingBag size={20} /> Panel de Recepciones
      </h1>
      <p style={{ color: "#666", marginBottom: 20 }}>Gestion de pedidos en recepcion</p>

      <button onClick={cargarPedidos} style={{ marginBottom: 16, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "#222", color: "#aaa", border: "1px solid #333", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <RefreshCw size={14} /> Actualizar
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Por Cobrar" value={pend.length} color="#F59E0B" desc="Efectivo pendiente" />
        <StatCard label="Listos Entrega" value={listos.length} color="#10B981" desc="Esperan mostrador" />
        <StatCard label="Entregados Hoy" value={entreHoy.length} color="#6366F1" desc="Completados hoy" />
        <StatCard label="En Proceso" value={enProc.length} color="#888" desc="Activos" />
      </div>

      <input
        placeholder="Buscar folio..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #333", background: "#111", color: "#ddd", fontSize: 13, boxSizing: "border-box", marginBottom: 10 }}
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setTab("pendientes")}
          style={{ padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", background: tab === "pendientes" ? "#c2410c" : "#1a1a1a", color: tab === "pendientes" ? "#fff" : "#777", border: "1px solid " + (tab === "pendientes" ? "#c2410c" : "#333") }}>
          Pendientes / Pagados
        </button>
        <button onClick={() => setTab("entregados")}
          style={{ padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", background: tab === "entregados" ? "#6366F1" : "#1a1a1a", color: tab === "entregados" ? "#fff" : "#777", border: "1px solid " + (tab === "entregados" ? "#6366F1" : "#333") }}>
          Entregados
        </button>
      </div>

      <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "#444", fontSize: 12 }}>Estado:</span>
        {ESTADOS.map(f => (
          <button key={"fe-" + f} onClick={() => setFiltEst(f)}
            style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer", background: filtEst === f ? "#c2410c" : "transparent", color: filtEst === f ? "#fff" : "#777", border: "1px solid " + (filtEst === f ? "#c2410c" : "#333") }}>
            {f}
          </button>
        ))}
        <span style={{ color: "#444", fontSize: 12 }}>Metodo:</span>
        {METODOS.map(f => (
          <button key={"fm-" + f} onClick={() => setFiltMet(f)}
            style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer", background: filtMet === f ? "#333" : "transparent", color: filtMet === f ? "#fff" : "#777", border: "1px solid " + (filtMet === f ? "#555" : "#333") }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid #2a2a2a", height: 90 }} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#444", fontSize: 14 }}>No se encontraron pedidos</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filtrados.map(p => {
            const sb = badge(gEst(p))
            const ne = norm(gEst(p))
            const exp = expId === gId(p)
            const pc = gEst(p) === "Pendiente" && gMet(p) === "Efectivo"
            const pe = ne === "Listo"
            const dets = gDet(p)
            return (
              <div key={"card-" + gId(p)} style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid #2a2a2a", marginBottom: 10, overflow: "hidden" }}>
                <div onClick={() => setExpId(exp ? null : gId(p))} style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", cursor: "pointer", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: "#ea580c" }}>{gFol(p)}</span>
                    <span style={{ fontSize: 10, marginLeft: 8, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: sb.bg, color: sb.fg }}>{ne}</span>
                    <span style={{ fontSize: 10, marginLeft: 4, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: gMet(p) === "Efectivo" ? "#065f4620" : "#1e3a8a20", color: gMet(p) === "Efectivo" ? "#34d399" : "#93c5fd" }}>{gMet(p)}</span>
                    <div style={{ marginTop: 4, fontSize: 12, color: "#555" }}>{nomCl(p)} - {fmtH(gFec(p))}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 17 }}>{fmtM(gTot(p))}</span>
                    <span style={{ color: "#444", fontSize: 12 }}>{exp ? "^" : "v"}</span>
                  </div>
                </div>
                {exp && (
                  <div style={{ borderTop: "1px solid #252525", padding: "12px 16px", background: "#141414" }}>
                    <div style={{ marginBottom: 10 }}>
                      {dets.length === 0 ? (
                        <span style={{ color: "#555", fontSize: 12 }}>Sin productos</span>
                      ) : dets.map((d, i) => (
                        <div key={"det-" + gId(p) + "-" + i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#aaa", marginBottom: 4 }}>
                          <span>{gCan(d)}x {nomProd(d)}</span>
                          <span style={{ color: "#666" }}>{fmtM(gDTot(d))}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {pc && (
                        <button onClick={e => { e.stopPropagation(); cobra(p) }} style={{ padding: "8px 14px", borderRadius: 10, background: "#16a34a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          Cobrar {fmtM(gTot(p))}
                        </button>
                      )}
                      {pe && (
                        <button onClick={e => { e.stopPropagation(); entrega(p) }} style={{ padding: "8px 14px", borderRadius: 10, background: "#6366F1", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          Entregar
                        </button>
                      )}
                      {!pc && !pe && (
                        <span style={{ padding: "8px 14px", borderRadius: 10, background: "#333", color: "#666", fontSize: 12 }}>{ne}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalP && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => !cobrando && setModalP(null)}>
          <div style={{ background: "#1a1a1a", borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "90%", color: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", border: "1px solid #2a2a2a" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ background: "#c2410c20", borderRadius: 12, padding: "10px 12px" }}>
                <DollarSign size={22} color="#ea580c" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Cobrar pedido</h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#ea580c", fontFamily: "monospace", fontWeight: 700 }}>{gFol(modalP)}</p>
              </div>
            </div>
            <div style={{ background: "#141414", borderRadius: 14, padding: "20px", marginBottom: 24, border: "1px solid #252525", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#555", marginBottom: 6 }}>TOTAL A COBRAR</p>
              <p style={{ margin: 0, fontSize: 40, fontWeight: 800, color: "#ea580c" }}>{fmtM(gTot(modalP))}</p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#444" }}>{nomCl(modalP)}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confCobro} disabled={cobrando} style={{ flex: 1, padding: "14px 20px", borderRadius: 12, background: cobrando ? "#333" : "#16a34a", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: cobrando ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {cobrando ? "Cobrando..." : <>Cobrar</>}
              </button>
              <button onClick={() => setModalP(null)} disabled={cobrando} style={{ flex: 1, padding: "14px 20px", borderRadius: 12, background: "transparent", color: "#666", border: "1px solid #333", fontWeight: 600, fontSize: 15, cursor: cobrando ? "not-allowed" : "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}