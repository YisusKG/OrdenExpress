# OrdenExpress — React Migration & Redesign TODO

## Phase 1 — Foundation & Global Setup ✅
- [x] 1.1 Install dependencies (axios, lucide-react)
- [x] 1.2 Configure global CSS with design system variables & Manrope font
- [x] 1.3 Set up React Router with all routes
- [x] 1.4 Create API base service with Axios interceptors
- [x] 1.5 Create individual service modules (auth, producto, pedido, cliente, reportes)
- [x] 1.6 Create AuthContext (login state, role, token, logout)
- [x] 1.7 Create CartContext (add, remove, update qty, clear, persist to localStorage)

## Phase 2 — Public Pages ✅
- [x] 2.1 Home — Hero section, featured product carousel, CTA to menu
- [x] 2.2 Login — Split layout, Client + Admin login
- [x] 2.3 Register — Split layout, full registration form

## Phase 3 — Client Pages (Requires Client auth) ✅
- [x] 3.1 Menu/Carta — Product grid, API data, classification filters, Add to cart
- [x] 3.2 Carrito — List items, adjust quantity, remove, total, Proceed to payment
- [x] 3.3 Pago — Payment method selector, order summary, confirm → creates order
- [x] 3.4 Perfil — View/edit profile, password change, profile photo upload
- [x] 3.5 Mis Pedidos — NEW: Order history for logged-in client

## Phase 4 — Admin Pages (Requires Admin auth) ✅
- [x] 4.1 Admin Dashboard — Stats cards, recent orders, quick actions
- [x] 4.2 Inventario — Stock table with color alerts, register stock entries
- [x] 4.3 Gestionar Productos — Full CRUD with image upload, auto-calculate price
- [x] 4.4 Reportes — Sales charts, top products, client list

## Phase 5 — Kitchen Page ✅
- [x] 5.1 Cocina — Kanban board (Recibido / En Preparación / Listo / Entregado)

## Phase 6 — Shared Components & Polish ✅
- [x] 6.1 Navbar — Glassmorphism, logo, nav links, cart badge, auth-aware
- [x] 6.2 Sidebar — Collapsible sidebar for Admin pages
- [x] 6.3 CardProducto — Reusable product card
- [x] 6.4 ProtectedRoute — Route guard by role
- [x] 6.5 Toast system — Success/error notifications
- [x] 6.6 Responsive — Mobile-first, hamburger menu

---

## Dev Server
- URL: http://localhost:5173/
- Status: Running, compiles cleanly
