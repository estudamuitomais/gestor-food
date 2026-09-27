# Notas da documentação oficial do iFood

Fontes consultadas em 27/09/2026:

- [Política de homologação](https://developer.ifood.com.br/en-US/docs/getting-started/homologation/categories)
- [Webhook de eventos](https://developer.ifood.com.br/en-US/docs/food/guides/modules/events/webhook-request)
- [Visão geral de webhook](https://developer.ifood.com.br/en-US/docs/food/guides/modules/events/webhook-overview)
- [Analytics](https://developer.ifood.com.br/en-US/docs/food/guides/modules/analytics/intro)
- [Catálogo](https://developer.ifood.com.br/en-US/docs/food/guides/modules/catalog/introduction)

## Decisões aplicadas

- A aplicação deve usar conta profissional com CNPJ e homologação antes da produção.
- O webhook recebe JSON, deve validar `X-IFood-Signature` sobre o corpo bruto e pode receber o mesmo evento mais de uma vez; por isso o sistema usa `event.id` e reserva concorrente.
- O ACK do webhook é `202 Accepted` e o processamento detalhado ocorre de forma assíncrona.
- Polling permanece como fallback de reconciliação, porque a entrega de eventos não garante ordem nem recuperação automática de todas as falhas.
- Analytics é agregado por loja e dia (D-1), não substitui pedidos transacionais em tempo real e deve ser apresentado com essa limitação.
- Financial exige homologação específica; Catalog, Review e Analytics dependem da categoria, escopo e permissões aprovados.
- Nenhum endpoint foi inventado: os adaptadores reais permanecem bloqueados até credenciais, escopos e homologação serem validados.

