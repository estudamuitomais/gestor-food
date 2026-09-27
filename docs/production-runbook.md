# Runbook de produção — Gestor Food

## Estado normal

- URL pública: `https://gestor-food.onrender.com`
- Modo padrão: `DEMO`
- Integração externa: desativada até homologação do iFood
- Persistência: PostgreSQL
- Health: `/healthz`
- Readiness: `/readyz`

## Smoke test seguro

O smoke test não envia pedidos, não chama operações de escrita do iFood e não expõe segredos:

```bash
npm run smoke:production
```

Para outro ambiente:

```bash
node scripts/smoke-production.mjs https://exemplo.example.com
```

O resultado esperado antes da homologação é `DEMO`, `ready` e `enabled=false`.

## Ativação controlada após aprovação

1. Confirmar aprovação do ticket iFood `34017713`.
2. Cadastrar `IFOOD_CLIENT_ID` e `IFOOD_CLIENT_SECRET` somente no cofre de variáveis do Render.
3. Cadastrar os `merchantId` aprovados no backend conforme o contrato vigente.
4. Registrar `https://gestor-food.onrender.com/api/ifood/webhook` no portal do iFood.
5. Manter `IFOOD_INTEGRATION_ENABLED=false` durante a validação inicial.
6. Executar o smoke test e validar `/healthz` e `/readyz`.
7. Testar autenticação, Merchant, Events e Order em homologação.
8. Validar assinatura HMAC, acknowledgment e deduplicação por `event.id`.
9. Obter aprovação administrativa para habilitar chamadas externas.
10. Alterar `IFOOD_INTEGRATION_ENABLED=true` e executar novo smoke test com `SMOKE_EXPECT_MODE=REAL`.

## Rollback

Em caso de erro, desabilitar imediatamente `IFOOD_INTEGRATION_ENABLED`, manter `COSTS_ENABLED=false`, redeployar a configuração e confirmar que `/healthz` retorna `mode=DEMO`. Não apagar eventos, pedidos ou trilhas de auditoria durante o rollback.

## Sinais de atenção

- `/healthz` diferente de HTTP 200: processo indisponível.
- `/readyz` diferente de HTTP 200: configuração ou banco indisponível.
- `mode=REAL` sem homologação aprovada: interromper e voltar para DEMO.
- Falhas repetidas de webhook: verificar assinatura, timeout e deduplicação antes de reenviar eventos.
