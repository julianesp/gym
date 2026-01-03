# Sistema de Pagos en Efectivo y Tracking de Ingresos

## Descripción General

GymSaaS ahora incluye un sistema completo para registrar pagos en efectivo y realizar seguimiento automático de ingresos diarios y mensuales. Esto permite a los dueños de gimnasios:

- ✅ Registrar sesiones pagadas en efectivo
- ✅ Ver ingresos totales del día en tiempo real
- ✅ Generar reportes mensuales
- ✅ Comparar ingresos mes a mes
- ✅ Analizar tendencias de asistencia

---

## Funcionalidades Implementadas

### 1. Sistema de Pagos en Efectivo

#### Página de Asistencias (`/attendance`)

Los usuarios ahora pueden seleccionar entre dos tipos de pago al registrar asistencias:

- **Tiquetera**: Descuenta una sesión del paquete activo del miembro
- **Efectivo**: Registra un pago en efectivo por sesión individual

**Cómo funciona:**

1. El staff selecciona el tipo de pago (Tiquetera o Efectivo)
2. Si es efectivo, ingresa el monto cobrado
3. Escanea el código QR o ingresa el ID del miembro
4. Registra la entrada

**Campos en la base de datos:**

```sql
-- Tabla attendances
payment_type VARCHAR(50) NOT NULL DEFAULT 'ticket'  -- 'ticket' o 'cash'
cash_amount DECIMAL(10, 2)  -- Monto si es pago en efectivo
```

### 2. Dashboard de Ingresos

#### Nueva página: `/revenue`

Panel completo con visualización de ingresos que incluye:

**Vista Diaria:**
- Ingresos totales del día
- Desglose: efectivo vs tiqueteras
- Número de asistencias
- Comparación con día anterior
- Gráfico de últimos 7 días

**Vista Mensual:**
- Ingresos totales del mes
- Desglose: efectivo vs tiqueteras
- Número de asistencias
- Comparación con mes anterior
- Gráfico de últimos 6 meses

**Estadísticas adicionales:**
- Promedio por asistencia
- Promedio de asistencias por día
- Distribución porcentual de tipos de pago
- Tendencias de crecimiento

### 3. Tracking Automático en Base de Datos

#### Tabla `daily_revenue`

Almacena resumen de ingresos por día:

```sql
CREATE TABLE daily_revenue (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  date DATE NOT NULL,
  ticket_sales_count INTEGER DEFAULT 0,
  ticket_sales_amount DECIMAL(10, 2) DEFAULT 0,
  cash_payments_count INTEGER DEFAULT 0,
  cash_payments_amount DECIMAL(10, 2) DEFAULT 0,
  total_attendances INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(gym_id, date)
);
```

#### Tabla `monthly_revenue`

Almacena resumen de ingresos por mes:

```sql
CREATE TABLE monthly_revenue (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  ticket_sales_count INTEGER DEFAULT 0,
  ticket_sales_amount DECIMAL(10, 2) DEFAULT 0,
  cash_payments_count INTEGER DEFAULT 0,
  cash_payments_amount DECIMAL(10, 2) DEFAULT 0,
  total_attendances INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(gym_id, year, month)
);
```

### 4. Triggers Automáticos

#### Trigger en Asistencias

Cuando se registra una asistencia (con pago en efectivo o tiquetera), automáticamente actualiza:

- `daily_revenue` para la fecha correspondiente
- `monthly_revenue` para el mes correspondiente

```sql
CREATE TRIGGER trigger_update_revenue_on_attendance
  AFTER INSERT ON attendances
  FOR EACH ROW
  EXECUTE FUNCTION update_revenue_on_attendance();
```

#### Trigger en Ventas de Tiqueteras

Cuando se vende una tiquetera, automáticamente actualiza los ingresos:

```sql
CREATE TRIGGER trigger_update_revenue_on_ticket_sale
  AFTER INSERT OR UPDATE ON member_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_revenue_on_ticket_sale();
```

---

## Flujo de Uso

### Escenario 1: Miembro paga en efectivo

1. **Staff**: Abre `/attendance`
2. **Staff**: Selecciona "Efectivo" en el selector de tipo de pago
3. **Staff**: Ingresa monto (ej: $150.00)
4. **Staff**: Escanea QR del miembro o ingresa ID
5. **Staff**: Click en "Registrar Entrada - Pago en Efectivo"
6. **Sistema**:
   - Crea registro en `attendances` con `payment_type='cash'` y `cash_amount=150`
   - Trigger actualiza `daily_revenue` automáticamente
   - Trigger actualiza `monthly_revenue` automáticamente

### Escenario 2: Miembro usa tiquetera

1. **Staff**: Abre `/attendance`
2. **Staff**: Selecciona "Tiquetera" (opción por defecto)
3. **Staff**: Escanea QR del miembro
4. **Staff**: Click en "Registrar Entrada"
5. **Sistema**:
   - Busca tiquetera activa del miembro
   - Descuenta una sesión
   - Crea registro en `attendances` con `payment_type='ticket'`
   - Trigger actualiza contadores (sin sumar a ingresos del día, ya se contó en la venta)

### Escenario 3: Venta de tiquetera

1. **Dueño**: Vende tiquetera a miembro por $1,200
2. **Sistema**: Crea registro en `member_tickets` con `payment_amount=1200`
3. **Trigger**: Actualiza `daily_revenue` y `monthly_revenue` sumando $1,200 a ventas de tiqueteras

### Escenario 4: Consultar ingresos del día

1. **Dueño**: Abre `/revenue`
2. **Dueño**: Selecciona vista "Diario"
3. **Dueño**: Selecciona fecha (default: hoy)
4. **Sistema**: Muestra:
   - Total de ingresos
   - Desglose efectivo vs tiqueteras
   - Número de asistencias
   - Comparación con ayer
   - Gráfico de últimos 7 días

### Escenario 5: Comparar meses

1. **Dueño**: Abre `/revenue`
2. **Dueño**: Selecciona vista "Mensual"
3. **Sistema**: Muestra:
   - Ingresos del mes actual
   - Comparación con mes anterior (%)
   - Gráfico de últimos 6 meses
   - Tendencias de crecimiento

---

## Beneficios para Dueños de Gimnasios

### Control Financiero Total

- Ver exactamente cuánto dinero en efectivo ingresó cada día
- Saber cuántas tiqueteras se vendieron
- Identificar días de mayor/menor actividad
- Tomar decisiones basadas en datos reales

### Transparencia Operativa

- Staff no necesita llevar registro manual
- Todo se registra automáticamente en el sistema
- Reportes generados en tiempo real
- Histórico completo disponible

### Análisis de Negocio

- Comparar rendimiento mes a mes
- Identificar tendencias de crecimiento
- Calcular promedio por asistencia
- Optimizar estrategias de precios

### Facturación y Contabilidad

- Exportar reportes para contabilidad (futuro)
- Conciliación bancaria facilitada
- Seguimiento de flujo de caja
- Preparación para declaraciones fiscales

---

## Permisos de Acceso

### Página `/revenue` - Solo Dueños

- ✅ **Super Admin**: Acceso total
- ✅ **Gym Owner**: Acceso a sus datos
- ❌ **Gym Staff**: Sin acceso
- ❌ **Member**: Sin acceso

### Registro de Asistencias - Staff y Dueños

- ✅ **Super Admin**: Puede registrar
- ✅ **Gym Owner**: Puede registrar
- ✅ **Gym Staff**: Puede registrar
- ❌ **Member**: Sin acceso

---

## Próximas Mejoras Sugeridas

### Fase 1: Exportación
- [ ] Exportar reportes a PDF
- [ ] Exportar reportes a Excel
- [ ] Enviar reportes por email

### Fase 2: Analíticas Avanzadas
- [ ] Predicción de ingresos
- [ ] Alertas de bajo rendimiento
- [ ] Recomendaciones automáticas
- [ ] Comparación con benchmarks

### Fase 3: Integraciones
- [ ] Integración con sistemas de contabilidad
- [ ] Integración con punto de venta
- [ ] API para aplicaciones móviles
- [ ] Webhooks para eventos de pago

### Fase 4: Automatización
- [ ] Recordatorios automáticos de pago
- [ ] Facturación automática
- [ ] Recibos digitales
- [ ] Notificaciones de ingresos diarios

---

## Ejemplo de Consultas SQL

### Ver ingresos de hoy

```sql
SELECT * FROM daily_revenue
WHERE gym_id = 'tu-gym-id'
AND date = CURRENT_DATE;
```

### Comparar últimos 3 meses

```sql
SELECT
  year,
  month,
  total_revenue,
  cash_payments_amount,
  ticket_sales_amount
FROM monthly_revenue
WHERE gym_id = 'tu-gym-id'
ORDER BY year DESC, month DESC
LIMIT 3;
```

### Top 10 días con más ingresos

```sql
SELECT
  date,
  total_revenue,
  total_attendances
FROM daily_revenue
WHERE gym_id = 'tu-gym-id'
ORDER BY total_revenue DESC
LIMIT 10;
```

### Promedio diario del mes actual

```sql
SELECT
  AVG(total_revenue) as promedio_diario,
  AVG(total_attendances) as promedio_asistencias
FROM daily_revenue
WHERE gym_id = 'tu-gym-id'
AND date >= DATE_TRUNC('month', CURRENT_DATE);
```

---

## Testing

### Probar registro de pago en efectivo

1. Ir a `/attendance`
2. Seleccionar "Efectivo"
3. Ingresar $200 como monto
4. Ingresar ID de miembro de prueba
5. Registrar entrada
6. Verificar que aparece en la tabla con badge "Efectivo" azul
7. Ir a `/revenue`
8. Verificar que los $200 se sumaron a ingresos del día

### Probar vista de ingresos

1. Ir a `/revenue`
2. Cambiar entre vista "Diario" y "Mensual"
3. Verificar que gráficos se actualizan
4. Verificar estadísticas de comparación
5. Verificar desglose efectivo vs tiqueteras

---

## Notas Técnicas

### Aislamiento Multi-Tenant

Todos los datos están aislados por `gym_id`:
- Cada gimnasio solo ve sus propios ingresos
- Las consultas siempre filtran por `gym_id`
- Super admin puede ver todos los gimnasios

### Performance

- Índices en `(gym_id, date)` y `(gym_id, year, month)`
- Queries optimizadas para consultas rápidas
- Agregación automática mediante triggers
- No requiere cálculos en tiempo real

### Seguridad

- Verificación de permisos en proxy.ts
- RLS (Row Level Security) habilitado
- Solo dueños pueden ver finanzas
- Staff no tiene acceso a ingresos

---

**Última actualización**: 2025-11-28
**Versión**: 3.0 (Revenue Tracking)
