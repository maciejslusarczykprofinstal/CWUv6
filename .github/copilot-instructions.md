# PROFINSTAL - Instrukcje dla agentów AI

## Architektura projektu

To jest aplikacja Next.js 16 do kalkulacji systemów CWU (Ciepła Woda Użytkowa) dla branży budowlanej. Aplikacja obsługuje 4 role użytkowników: mieszkańcy, audytorzy, wykonawcy, inwestorzy.

### Kluczowe ścieżki i konwencje

- **Ścieżki bazowe**: Używamy `@/*` aliasu dla `src/*` (skonfigurowane w `tsconfig.json`)
- **Struktura API**: `/api/calc/{role}` dla kalkulacji, `/api/report/{role}` dla raportów PDF
- **UI Components**: Wszystkie w `src/components/ui/` z centralnym eksportem w `index.ts`
- **Calculations**: Biblioteka obliczeń w `src/lib/calc/cwu.ts` używa `Decimal.js` dla precyzji
- **Reports**: PDF generowane przez `@react-pdf/renderer` w `src/lib/report/`

### Wzorce architektoniczne

1. **Calculation Flow**: Form → API Route → Calculation Library → Response → UI Update
2. **Type Safety**: Wszystkie API endpoints używają Zod do walidacji
3. **Error Handling**: Zod errors w API, alert() w UI (docelowo toast notifications)
4. **Polish Locale**: Aplikacja w 100% po polsku, używa polskich formatów liczb

## Technologie i narzędzia

### Core Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript z strict mode
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Package Manager**: pnpm (ZAWSZE używaj pnpm, nie npm/yarn)

### Key Dependencies
- **Forms**: `react-hook-form` + `@hookform/resolvers` + `zod`
- **Math**: `decimal.js` dla precyzyjnych obliczeń finansowych/inżynierskich
- **PDF**: `@react-pdf/renderer` dla raportów
- **Database**: Prisma (SQLite w dev, output w `src/generated/prisma`)
- **Charts**: `recharts` dla wizualizacji danych

### Development Workflow

```bash
# Start development server
pnpm dev

# Type checking
pnpm typecheck

# Linting (custom rules dla src/**/*.{ts,tsx})
pnpm lint

# Formatting
pnpm format
```

## Wzorce kodowania

### API Routes Pattern
```typescript
// src/app/api/calc/[role]/route.ts
import { z } from "zod";
import { calculationFunction } from "@/lib/calc/cwu";

const Schema = z.object({
  // validation schema
}).refine(customValidation);

export async function POST(req: Request) {
  const data = Schema.parse(await req.json());
  const result = calculationFunction(data);
  return NextResponse.json({ ok: true, result });
}
```

### Form Handling Pattern
```typescript
// Client components używają "use client"
async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  const form = new FormData(e.currentTarget);
  const payload = Object.fromEntries(
    Array.from(form.entries()).map(([k, v]) => [k, coerce(v)])
  );
  // POST to API endpoint
}
```

### Component Export Pattern
```typescript
// src/components/ui/index.ts - centralny eksport
export * from "./button";
export * from "./card";
// etc.
```

## Kluczowe koncepty biznesowe

### CWU Calculations (src/lib/calc/cwu.ts)
- **residentCalc**: Analiza kosztów dla mieszkańców (porównanie MPEC vs wpłaty)
- **orderedPowerCWU**: Obliczenie mocy zamówionej z jednoczesnostią i buforem
- **circulationLossByUA**: Straty cyrkulacji metodą UA×ΔT×t
- **modernizationVariants**: 3 warianty modernizacji z analizą payback

### Report Generation
- PDF reports używają `@react-pdf/renderer`
- Buffer handling: `(await pdf(Doc).toBuffer()) as unknown as Uint8Array`
- API endpoint `/api/report/{role}?data=JSON` zwraca PDF

### UI Patterns
- **Polish formatting**: `toLocaleString("pl-PL")` dla liczb
- **Color coding**: `hsl(var(--muted))` dla kart wyników
- **Navigation**: Fixed header z logo i 4 rolami użytkowników

## Najczęstsze błędy i rozwiązania

1. **Import errors**: Zawsze używaj `@/` aliasu zamiast względnych ścieżek
2. **Type conflicts**: Prisma client w `src/generated/prisma`, nie `node_modules`
3. **PDF buffer**: Cast to `Uint8Array` required dla Next.js Response API
4. **Decimal precision**: Używaj `Decimal.js` dla obliczeń finansowych, nie `Number`
5. **Form coercion**: `coerce()` function konwertuje string form values do number

## Extensions i integracje

- **Database**: Prisma schema w `prisma/schema.prisma` (SQLite dev)
- **Auth**: Next-auth adapter gotowy w dependencies
- **Payments**: Stripe integration prepared
- **AI**: OpenAI client available dla przyszłych funkcji

Priorytetowo traktuj bezpieczeństwo typów, precyzję obliczeń matematycznych i polską lokalizację.