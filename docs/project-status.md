# Status do projeto

## Concluído no código

- Dashboard responsivo em português-BR.
- Modo DEMO com cenários selecionáveis.
- Multiempresa/multiloja no modelo de dados.
- Pedidos, eventos, deduplicação e reconciliação.
- Resultado sem CMV em centavos.
- Cancelamento total e reembolso parcial.
- Rateio financeiro por produto.
- Métricas diárias e horárias.
- Metas e modo recuperação.
- Previsões explicáveis.
- Saúde da loja com componentes.
- Oportunidades, aprovações e diário da IA.
- Memória comercial e experimentos.
- Comparação entre lojas.
- Classificação de clientes e avaliações.
- Relatórios CSV e backup JSON.
- Autenticação, sessões, papéis e isolamento por tenant.
- Redaction, auditoria, rate limit e headers de segurança.
- Adaptadores oficiais iFood preparados.
- Adaptador PostgreSQL opcional, migração inicial e verificação de prontidão preparados.

## Ainda depende de ambiente externo

- CNPJ e homologação no Developer Portal do iFood.
- `IFOOD_CLIENT_ID` e `IFOOD_CLIENT_SECRET` reais.
- URL HTTPS pública para webhook.
- Provisionamento e configuração do banco persistente de produção.
- Deploy e política de backup operacional.
- Persistência definitiva; o status da aplicação informa explicitamente `MEMORY`/DEMO.
- Validação dos módulos Financial, Analytics, Catalog e Review no ambiente homologado.

## Regras atuais

- `TRUST_PROXY=false` por padrão; só habilitar quando o servidor estiver atrás de proxy reverso controlado.
- `REQUIRE_AUTH=true` protege as rotas operacionais da API; autenticação, webhook assinado, saúde e documentação permanecem públicos.
- Cadastro público permanece restrito ao DEMO; no modo REAL exige autenticação administrativa.
- Integração real desligada por padrão.
- Custos externos bloqueados.
- Mensagens a clientes não são enviadas automaticamente.
- Alterações de catálogo e respostas de avaliações não são executadas automaticamente.
- CMV permanece fora do cálculo.
