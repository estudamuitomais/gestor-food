# Checklist de produção — iFood

## Antes de habilitar

- [x] Criar aplicação no Developer Portal do iFood.
- [x] Usar conta profissional com CNPJ e requisitos de homologação.
- [ ] Concluir homologação do aplicativo Gestor Food — ticket `34017713` está em análise.
- [ ] Selecionar apenas os módulos necessários.
- [ ] Configurar `IFOOD_CLIENT_ID` e `IFOOD_CLIENT_SECRET` somente no backend.
- [ ] Manter `IFOOD_INTEGRATION_ENABLED=false` até finalizar os testes.
- [ ] Confirmar que `COSTS_ENABLED=false`.
- [ ] Não registrar tokens, client secret ou payloads sensíveis em logs.

## Ambiente atual

- Backend publicado: `https://gestor-food.onrender.com`
- `GET /healthz`: operacional
- `GET /readyz`: operacional com PostgreSQL
- Persistência: PostgreSQL conectado no Render
- Modo atual: DEMO, com chamadas externas bloqueadas

## Após a aprovação

1. Obter as credenciais e os `merchantId` liberados pelo iFood.
2. Cadastrar os segredos somente nas variáveis protegidas do Render.
3. Registrar o webhook HTTPS usando `https://gestor-food.onrender.com/api/ifood/webhook`.
4. Manter `IFOOD_INTEGRATION_ENABLED=false` durante o primeiro teste controlado.
5. Validar autenticação, Merchant, Events e Order em homologação.
6. Confirmar `/healthz`, `/readyz`, assinatura HMAC e deduplicação dos eventos.
7. Habilitar a integração real somente após aprovação administrativa e evidência dos testes.
8. Revalidar logs, isolamento por loja e plano de rollback.

## Ordem de implantação

1. Authentication com OAuth centralizado.
2. Confirmar autenticação centralizada habilitada para uso de webhook.
3. Merchant para listar lojas e consultar status.
4. Events por polling durante desenvolvimento, com intervalo automático mínimo de 30 segundos no modo REAL.
5. Idempotência e acknowledgment individual imediatamente após cada evento processado.
6. Webhook HTTPS com validação de `X-IFood-Signature`.
7. Responder `202 Accepted` rapidamente e tratar a entrega como pelo menos uma vez, mantendo idempotência por `event.id`.
8. Order para detalhes e ciclo operacional.
9. Analytics para métricas agregadas D-1, com filtro de período e indicação explícita de que não é dado em tempo real.
10. Financial mediante homologação específica e ticket separado.
11. Catalog e Review somente depois de validar limites de autonomia.

## Regras de segurança

- Integração real não deve ser habilitada no frontend.
- Eventos duplicados devem ser ignorados pelo ID externo.
- A assinatura deve ser validada sobre o corpo bruto antes do parsing.
- O webhook deve responder `202 Accepted` em até 5 segundos quando o evento for aceito.
- O processamento detalhado deve ocorrer de forma assíncrona após o ACK, sem bloquear a resposta do webhook.
- Acknowledgment só ocorre depois do processamento bem-sucedido.
- Ações com impacto financeiro continuam exigindo aprovação.
- Mensagens a clientes permanecem assistidas enquanto não houver capacidade oficial confirmada.

## Referências oficiais

- https://developer.ifood.com.br/en-US/docs/food/guides/modules/authentication/intro
- https://developer.ifood.com.br/en-US/docs/food/guides/modules/merchant/introducao
- https://developer.ifood.com.br/en-US/docs/food/guides/modules/events/webhook-overview
- https://developer.ifood.com.br/pt-BR/docs/guides/order/
- https://developer.ifood.com.br/en-US/docs/food/guides/modules/analytics/intro
- https://developer.ifood.com.br/en-US/docs/guides/financial/v2
