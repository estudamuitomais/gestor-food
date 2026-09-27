# Matriz de autonomia

Classificação vigente do sistema. A execução automática só pode ocorrer quando a API oficial, as regras da loja e o bloqueio de custos permitirem.

| Capacidade | Classificação atual | Observação |
|---|---|---|
| Importar eventos e pedidos oficiais | Automática quando integração real estiver habilitada | Webhook/polling idempotente; DEMO permanece isolado. |
| Reconciliar eventos e pedidos | Automática | Preserva o payload original e evita duplicidade. |
| Calcular métricas, previsão e saúde | Automática | Regras locais e explicáveis, sem LLM pago. |
| Detectar queda e criar oportunidade | Automática | O diagnóstico não altera dados externos. |
| Gerar plano de recuperação | Automática | A recomendação mostra critérios e confiança. |
| Registrar auditoria e diário da IA | Automática | Segredos são redigidos. |
| Decidir aprovação de ação relevante | Requer aprovação | Usuário autorizado precisa registrar a decisão. |
| Alterar preço, promoção ou catálogo | Assistida / aprovação | Não é executada sem capacidade oficial validada e autorização. |
| Responder avaliações | Assistida / aprovação | Texto pode ser preparado; envio automático permanece desligado. |
| Enviar mensagens a clientes | Assistida | Não presumir endpoint oficial de disparo. |
| Custos externos e recursos pagos | Requer aprovação administrativa | `COSTS_ENABLED=false` por padrão. |
| CMV | Fora do escopo atual | Arquitetura preparada, cálculo não implementado. |

