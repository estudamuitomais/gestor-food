# Roadmap de implementação

## Concluído no núcleo local

1. Auditoria da base existente e modo DEMO isolado.
2. Modelo multiempresa/multiloja, autenticação, papéis e isolamento.
3. Pedidos, eventos, idempotência, reconciliação e auditoria.
4. Resultado sem CMV, métricas, relatórios e rateio financeiro.
5. Previsões, detecção de queda, metas e recuperação.
6. Oportunidades, aprovações, memória comercial e experimentos.
7. Dashboard responsivo, cenários DEMO, segurança HTTP e OpenAPI.

## Próximas etapas condicionadas a ambiente externo

1. Obter CNPJ, credenciais e homologação oficial do iFood.
2. Validar endpoints e permissões Merchant, Order, Events, Catalog, Review, Analytics e Financial.
3. Conectar banco persistente com migrações, retenção e backup testado.
4. Publicar backend com HTTPS, webhook, observabilidade e política de recuperação.
5. Executar testes de contrato contra homologação e validar limites/rate limits.
6. Habilitar gradualmente ações aprovadas, mantendo custos bloqueados.

## Decisão de compatibilidade

O projeto mantém Node.js 20+ como requisito mínimo. Embora o runtime local possa oferecer `node:sqlite`, esse recurso não é ativado porque elevaria o requisito para versões mais recentes. A persistência em produção deve usar um adaptador compatível com a matriz de runtimes escolhida.

## Critério de promoção para produção

- `GET /healthz` ativo e `GET /readyz` válido.
- `REQUIRE_AUTH=true` e credenciais fora do frontend/logs.
- Webhook com HTTPS e assinatura validada.
- Persistência real, backup restaurável e auditoria retida.
- Testes de integração oficiais aprovados.
- Cada ação externa classificada como automática, aprovação ou assistida.
