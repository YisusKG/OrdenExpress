-- =============================================
-- Script de Base de Datos para OrdenExpress
-- Ejecutar en SQL Server Management Studio
-- =============================================

USE master;
GO

-- Crear base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'OrdenExpress')
BEGIN
    CREATE DATABASE OrdenExpress;
END
GO

USE OrdenExpress;
GO

-- =============================================
-- TABLA CLIENTE
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cliente]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Cliente](
        [ID_Cliente] [int] IDENTITY(1,1) NOT NULL,
        [Nombre] [varchar](100) NOT NULL,
        [Apellido_Paterno] [varchar](100) NOT NULL,
        [Apellido_Materno] [varchar](100) NULL,
        [Correo_E] [varchar](150) NOT NULL,
        [Telefono] [varchar](20) NOT NULL,
        [Usuario] [varchar](50) NOT NULL,
        [Contraseña] [varchar](255) NOT NULL,
        [Foto_Perfil] [varchar](255) NULL,
        CONSTRAINT [PK_Cliente] PRIMARY KEY CLUSTERED ([ID_Cliente] ASC)
    );
END
GO

-- =============================================
-- TABLA ADMINISTRADOR
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Administrador]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Administrador](
        [ID_Administrador] [int] IDENTITY(1,1) NOT NULL,
        [Nombre_A] [varchar](100) NOT NULL,
        [Apellido_PaternoA] [varchar](100) NOT NULL,
        [Apellido_MaternoA] [varchar](100) NULL,
        [Correo_E] [varchar](150) NOT NULL,
        [Usuario] [varchar](50) NOT NULL,
        [Contraseña] [varchar](255) NOT NULL,
        CONSTRAINT [PK_Administrador] PRIMARY KEY CLUSTERED ([ID_Administrador] ASC)
    );
    
    -- Insertar administrador por defecto
    INSERT INTO [dbo].[Administrador] (Nombre_A, Apellido_PaternoA, Correo_E, Usuario, Contraseña)
    VALUES ('Admin', 'Principal', 'admin@orderexpress.com', 'admin', 'admin');
END
GO

-- =============================================
-- TABLA PRODUCTO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Producto]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Producto](
        [ID_Producto] [int] IDENTITY(1,1) NOT NULL,
        [Nombre_P] [varchar](100) NOT NULL,
        [Clasificacion] [varchar](50) NULL,
        [Descripcion] [varchar](500) NOT NULL,
        [Cantidad_Disponible] [int] NOT NULL,
        [Cantidad_Min] [int] NULL,
        [Cantidad_Max] [int] NULL,
        [Costo_Base] [decimal](10, 2) NOT NULL,
        [Precio_Venta] [decimal](10, 2) NOT NULL,
        [Imagen] [varchar](255) NULL,
        [Porcentaje_Gan] [decimal](5, 2) NULL,
        CONSTRAINT [PK_Producto] PRIMARY KEY CLUSTERED ([ID_Producto] ASC)
    );
END
GO

-- =============================================
-- TABLA PEDIDO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pedido]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Pedido](
        [ID_Pedido] [int] IDENTITY(1,1) NOT NULL,
        [ID_Cliente] [int] NOT NULL,
        [Fecha] [datetime] NOT NULL DEFAULT GETDATE(),
        [Estado] [varchar](50) NOT NULL DEFAULT 'Pendiente',
        [Total] [decimal](18, 2) NOT NULL,
        [Metodo_Pago] [varchar](50) NULL DEFAULT 'Efectivo',
        CONSTRAINT [PK_Pedido] PRIMARY KEY CLUSTERED ([ID_Pedido] ASC),
        CONSTRAINT [FK_Pedido_Cliente] FOREIGN KEY ([ID_Cliente]) REFERENCES [dbo].[Cliente]([ID_Cliente])
    );
END
GO

-- Agregar columnas si no existen
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedido') AND name = 'Metodo_Pago')
BEGIN
    ALTER TABLE Pedido ADD Metodo_Pago varchar(50) NULL DEFAULT 'Efectivo';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedido') AND name = 'Estado')
BEGIN
    ALTER TABLE Pedido ADD Estado varchar(50) NULL DEFAULT 'Pendiente';
END
GO

-- =============================================
-- TABLA DETALLE_PEDIDO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Detalle_Pedido]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Detalle_Pedido](
        [ID_Detalle] [int] IDENTITY(1,1) NOT NULL,
        [ID_Pedido] [int] NOT NULL,
        [ID_Producto] [int] NOT NULL,
        [Cantidad] [int] NOT NULL,
        [Total] [decimal](10, 2) NOT NULL,
        CONSTRAINT [PK_Detalle_Pedido] PRIMARY KEY CLUSTERED ([ID_Detalle] ASC),
        CONSTRAINT [FK_Detalle_Pedido_Pedido] FOREIGN KEY ([ID_Pedido]) REFERENCES [dbo].[Pedido]([ID_Pedido]),
        CONSTRAINT [FK_Detalle_Pedido_Producto] FOREIGN KEY ([ID_Producto]) REFERENCES [dbo].[Producto]([ID_Producto])
    );
END
GO

PRINT 'Base de datos OrdenExpress creada correctamente';
PRINT 'Usuario admin por defecto: admin / admin';

-- =============================================
-- TABLA EMPLEADO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Empleado]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Empleado](
        [ID_Empleado] [int] IDENTITY(1,1) NOT NULL,
        [Nombre] [varchar](100) NOT NULL,
        [Apellido_Paterno] [varchar](100) NOT NULL,
        [Apellido_Materno] [varchar](100) NULL,
        [Telefono] [varchar](20) NOT NULL,
        [Correo_E] [varchar](150) NOT NULL,
        [Usuario] [varchar](50) NOT NULL,
        [PasswordHash] [varchar](255) NOT NULL,
        [Salt] [varchar](255) NULL,
        [Rol_Empleado] [varchar](50) NOT NULL DEFAULT 'Cocina',
        CONSTRAINT [PK_Empleado] PRIMARY KEY CLUSTERED ([ID_Empleado] ASC)
    );

    -- Insertar empleado por defecto (password: 'empleado123' hashed)
    INSERT INTO [dbo].[Empleado] (Nombre, Apellido_Paterno, Telefono, Correo_E, Usuario, PasswordHash, Rol_Empleado)
    VALUES ('Juan', 'Perez', '555-1234', 'juan@orderexpress.com', 'empleado', '$2a$10$examplehashfor Empleado123', 'Cocina');
END
GO

