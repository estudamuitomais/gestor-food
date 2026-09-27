# Próximas ações operacionais

## 1. Preparar o iFood

- Criar aplicação profissional no Developer Portal usando CNPJ.
- Selecionar os módulos realmente necessários para restaurantes.
- Solicitar e concluir homologação de Merchant, Events e Order.
- Solicitar homologações específicas de Analytics e Financial quando aplicável.
- Obter `IFOOD_CLIENT_ID`, `IFOOD_CLIENT_SECRET` e os `merchantId` das lojas.

## 2. Preparar o ambiente

- Backend publicado atrás de HTTPS em `https://gestor-food.onrender.com`.
- Configurar `IFOOD_INTEGRATION_ENABLED=true` somente após homologação.
- Configurar `REQUIRE_AUTH=true`.
- Manter `COSTS_ENABLED=false` até autorização administrativa.
- Definir `TRUST_PROXY=true` apenas atrás de proxy controlado.
- Registrar o webhook HTTPS no portal do iFood.

## 3. Persistência e operação

- PostgreSQL compatível com `src/db/schema.sql` já está conectado no Render.
- Migração idempotente executada automaticamente no boot.
- Validar isolamento por `company_id`/`store_id` no ambiente homologado.
- Configurar backup restaurável e retenção do audit log.
- Monitorar `/healthz` e `/readyz`.
- Executar testes de contrato e reconciliação em homologação.

## Critério de conclusão

A integração só deve ser considerada pronta quando houver credenciais válidas, webhook assinado funcionando, persistência restaurável, homologação aprovada e testes oficiais concluídos.

