# Contratos HTTP atuais

Base local: `http://localhost:3000`

`GET /healthz` é o endpoint de liveness para monitoramento do processo.

## Dashboard e dados

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/demo` | Snapshot DEMO completo; aceita `scenario=normal`, `weak-sales`, `critical-reviews` ou `cancellations` |
| GET | `/api/stores` | Lojas sem a lista completa de pedidos |
| GET | `/api/stores/{id}/health` | Saúde explicável da loja |
| GET | `/api/orders` | Pedidos; aceita `storeId`, `status`, `from`, `to` |
| GET | `/api/orders/{id}` | Detalhe do pedido |
| GET | `/api/metrics` | Métricas consolidadas |
| GET | `/api/metrics/daily` | Série diária |
| GET | `/api/metrics/hourly` | Série horária |
| GET | `/api/goals` | Progresso de metas; aceita `scenario` |
| GET | `/api/recovery/{storeId}` | Plano de recuperação; aceita `scenario` |
| GET | `/api/catalog/analysis` | Classificação de produtos |
| GET | `/api/reviews/analysis` | Avaliações classificadas |
| GET | `/api/alerts` | Alertas |
| GET | `/api/opportunities` | Oportunidades |
| GET | `/api/decisions` | Diário da IA |
| GET | `/api/system/status` | Estado das flags e módulos habilitados |
| GET | `/api/ifood/config` | Modo e configuração da integração |
| GET | `/api/ifood/health` | Saúde da integração e módulos externos |

## Ações controladas

| Método | Rota | Observação |
|---|---|---|
| POST | `/api/approvals/{id}` | Autoriza, recusa ou altera decisão |
| POST | `/api/ifood/sync` | Sincronização real, bloqueada no DEMO |
| POST | `/api/ifood/webhook` | Recebe webhook JSON com HMAC; responde `202` após validação e processa de forma assíncrona |

## Relatórios e auditoria

- `GET /api/reports/daily?scenario=...`
- `GET /api/reports/products.csv?scenario=...`
- `GET /api/reports/orders.csv?scenario=...`
- `GET /api/backup/demo.json`
- `GET /api/audit`
- `GET /api/ifood/events`
- `GET /api/ifood/reconciliation`

Todas as rotas de mutação devem ser protegidas por autenticação quando `REQUIRE_AUTH=true`.

O webhook rejeita payload sem `id` com `400`, assinatura inválida com `401` e conteúdo que não seja `application/json` com `415`. Todas as respostas de erro incluem `requestId`.
