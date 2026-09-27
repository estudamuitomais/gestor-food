# Runbook de produção — Gestor Food

## Estado normal

- URL pública: `https://gestor-food.onrender.com`
- Modo padrão: `DEMO`
- Integração externa: desativada até homologação do iFood
- Persistência: PostgreSQL
- Health: `/healthz`
- Readiness: `/readyz`

## Monitoramento

O workflow `Production monitor` executa o smoke test a cada 15 minutos e também pode ser iniciado manualmente no GitHub Actions. Ele verifica saúde, readiness e bloqueio da integração iFood em modo DEMO.

Falha no workflow deve ser tratada como incidente operacional: verificar o Render, o banco e os logs antes de qualquer alteração de configuração.

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

## Preflight de release

Antes de qualquer mudança operacional, executar:

```bash
npm run verify:release
```

Esse comando executa verificação de sintaxe, os testes automatizados e o smoke test público. Ele não habilita a integração iFood e não substitui a homologação oficial.

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

## Backup e restauração

- Confirmar no Render o plano, a retenção e a possibilidade de restauração do PostgreSQL antes de operar com dados reais.
- Executar um backup restaurável antes de habilitar a integração real ou aplicar qualquer mudança de schema.
- Guardar o backup fora do serviço de produção, com acesso restrito e retenção definida.
- Testar a restauração em um banco separado; nunca testar restauração sobrescrevendo o banco ativo.
- Registrar data, responsável, versão do schema e resultado do teste.
- O banco gratuito atual tem expiração prevista para `27/10/2026`; definir upgrade ou migração antes dessa data.

## Sinais de atenção

- `/healthz` diferente de HTTP 200: processo indisponível.
- `/readyz` diferente de HTTP 200: configuração ou banco indisponível.
- `mode=REAL` sem homologação aprovada: interromper e voltar para DEMO.
- Falhas repetidas de webhook: verificar assinatura, timeout e deduplicação antes de reenviar eventos.
