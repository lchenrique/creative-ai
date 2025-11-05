# FreeSVG API Integration

## Como configurar o FreeSVG

O FreeSVG fornece acesso a milhares de imagens SVG gratuitas através de sua API.

### 1. Criar uma conta no FreeSVG

Acesse [https://freesvg.org](https://freesvg.org) e crie uma conta gratuita.

### 2. Obter o token de autenticação

Após criar sua conta, obtenha o token fazendo uma requisição POST:

```bash
curl -d '{"email": "seu@email.com", "password": "suasenha"}' \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -X POST https://freesvg.org/api/v1/auth/login
```

Você receberá uma resposta com o token:

```json
{
  "message": "Login Successful.",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Configurar o token no projeto

Copie o token e adicione ao seu arquivo `.env`:

```bash
VITE_FREESVG_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
```

### 4. Testar a integração

O componente `ClipartBrowser` agora possui uma aba "FreeSVG" que permite:
- Buscar imagens SVG
- Navegar por páginas de resultados
- Selecionar imagens para usar no canvas

## Endpoints disponíveis

- `GET /api/v1/svgs` - Listar todos os SVGs (25 por página)
- `GET /api/v1/search?query=termo` - Buscar SVGs (25 por página)
- `GET /api/v1/svg/{id}` - Obter dados de um SVG específico

## Notas

- O token tem validade longa (aproximadamente 1 ano)
- A API retorna tanto URLs de SVG quanto PNG das imagens
- Todas as imagens são gratuitas e licenciadas para uso comercial
- Limite de 25 resultados por página
