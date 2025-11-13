# Konfiguracja MCP Server w Cursor

Model Context Protocol (MCP) pozwala na integrację zewnętrznych serwerów z Cursor, rozszerzając możliwości AI.

## Instalacja i konfiguracja

### 1. Lokalizacja pliku konfiguracyjnego

W Cursor, konfiguracja MCP serverów znajduje się w pliku konfiguracyjnym użytkownika:
- **macOS/Linux**: `~/.cursor/mcp.json` lub `~/.config/cursor/mcp.json`
- **Windows**: `%APPDATA%\Cursor\mcp.json`

### 2. Przykładowa konfiguracja

Otwórz lub utwórz plik konfiguracyjny MCP i dodaj następującą konfigurację:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/agorzanowska/10xdevs/adopt-me"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:postgres@localhost:54322/postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:postgres@localhost:54322/postgres"
      }
    },
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "/home/agorzanowska/10xdevs/adopt-me"
      ]
    }
  }
}
```

### 3. Dostępne MCP Serwery

#### Filesystem Server
Pozwala na dostęp do plików w projekcie:
- Czytanie i zapisywanie plików
- Przeszukiwanie struktury katalogów
- Operacje na plikach

#### Postgres Server
Integracja z bazą danych PostgreSQL (Supabase):
- Wykonywanie zapytań SQL
- Przeglądanie schematu bazy danych
- Zarządzanie danymi

#### Git Server
Integracja z Git:
- Przeglądanie historii commitów
- Zarządzanie branchami
- Analiza zmian

### 4. Instalacja serwerów MCP

Serwery MCP są instalowane automatycznie przy pierwszym użyciu przez `npx`, ale możesz je również zainstalować globalnie:

```bash
# Opcjonalnie: instalacja globalna
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-git
```

### 5. Konfiguracja dla Supabase

Jeśli używasz lokalnego Supabase, użyj następującej konfiguracji:

```json
{
  "mcpServers": {
    "supabase-local": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:postgres@localhost:54322/postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:postgres@localhost:54322/postgres"
      }
    }
  }
}
```

Dla produkcyjnego Supabase, użyj connection string z dashboardu Supabase.

### 6. Weryfikacja konfiguracji

1. Zrestartuj Cursor po dodaniu konfiguracji
2. Sprawdź w ustawieniach Cursor, czy MCP serwery są widoczne
3. W Cursor AI, spróbuj użyć komend związanych z plikami, bazą danych lub Git

### 7. Rozwiązywanie problemów

**Problem**: MCP serwery nie są widoczne w Cursor
- **Rozwiązanie**: Sprawdź ścieżkę do pliku konfiguracyjnego i upewnij się, że JSON jest poprawny

**Problem**: Błąd połączenia z bazą danych
- **Rozwiązanie**: Upewnij się, że Supabase jest uruchomiony lokalnie (`supabase start`) lub użyj poprawnego connection string

**Problem**: Brak uprawnień do plików
- **Rozwiązanie**: Sprawdź, czy ścieżka w konfiguracji jest poprawna i dostępna

## Dodatkowe zasoby

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://docs.cursor.com/mcp)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

