# Fix C# Test Compilation Errors - Condition 1 Coverage

## Plan Steps (Approved)

### 1. Fix UsuariosTests.cs (11 CS1729 errors)
- Remove all mockLogger instantiations
- Change all `new UsuariosController(context, mockLogger.Object)` → `new UsuariosController(context)`
- Remove unused `using Microsoft.Extensions.Logging;`

### 2. Fix ReportesTests.cs 
- Change `_controller = new ReportesController(_context, mockLogger.Object);` → `new ReportesController(_context);`
- Remove mockLogger

### 3. Fix PedidoTests.cs (2 CS0029 errors)
- Line ~118: Change `List<DetallePedidoDTO>` → `List<DetallePedidoDto>`

### 4. Fix ProductoTests.cs (1 CS1503 error)
- In `Modificar_Valid_Success`: Create `Producto` instead of `ProductoUpdateForm`
- Pass `new Producto { Nombre_P = "Updated", Precio_Venta = 25m, ... }`

### 5. Fix Warnings (Secondary)
- Remove duplicate usings in AdministradorTests.cs, StripeTests.cs
- Fix xUnit1026 unused param in ClienteIntegrationTests.cs

### 6. Verify
- Run `dotnet test`
- Generate coverage report

## Progress
- [x] Step 1 (UsuariosTests.cs constructors fixed)
- [x] Step 2 (ReportesTests.cs fixed)
- [x] Step 3 (PedidoTests.cs DTO casing fixed)
- [x] Step 4 (ProductoTests.cs Modificar test fixed)
- [ ] Step 5 (Warnings)
- [ ] Step 6 (Verify)

**Current Status:** Ready to implement Step 1
