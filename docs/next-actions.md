# Próximas ações operacionais

## 1. Preparar o iFood

- Criar aplicação profissional no Developer Portal usando CNPJ.
- Selecionar os módulos realmente necessários para restaurantes.
- Solicitar e concluir homologação de Merchant, Events e Order.
- Solicitar homologações específicas de Analytics e Financial quando aplicável.
- Obter `IFOOD_CLIENT_ID`, `IFOOD_CLIENT_SECRET` e os `merchantId` das lojas.

## 2. Preparar o ambiente

- Publicar o backend atrás de HTTPS.
- Configurar `IFOOD_INTEGRATION_ENABLED=true` somente após homologação.
- Configurar `REQUIRE_AUTH=true`.
- Manter `COSTS_ENABLED=false` até autorização administrativa.
- Definir `TRUST_PROXY=true` apenas atrás de proxy controlado.
- Registrar o webhook HTTPS no portal do iFood.

## 3. Persistência e operação

- Escolher o banco compatível com `src/db/schema.sql`.
- Executar migrações e validar isolamento por `company_id`/`store_id`.
- Configurar backup restaurável e retenção do audit log.
- Monitorar `/healthz` e `/readyz`.
- Executar testes de contrato e reconciliação em homologação.

## Critério de conclusão

A integração só deve ser considerada pronta quando houver credenciais válidas, webhook assinado funcionando, persistência restaurável, homologação aprovada e testes oficiais concluídos.

