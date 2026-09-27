# Revisão de segurança estática

## Escopo verificado

- Código do backend e integrações.
- Frontend público.
- Testes e documentação.
- Padrões de client secret, access token, refresh token, Bearer token e API key.

## Resultado

Nenhum segredo real foi encontrado no projeto. As ocorrências identificadas são valores fictícios usados exclusivamente nos testes de assinatura HMAC e validação de ambiente.

`npm ls --depth=0` confirmou que não há dependências externas instaladas; o projeto utiliza apenas APIs nativas do Node.js.

Controles ativos no código:

- Segredos somente por variáveis de ambiente.
- Redação recursiva antes de logs e backup.
- Nenhum `passwordHash` retornado pela API.
- Headers de segurança e CSP.
- HMAC validado sobre o corpo bruto do webhook.
- Rate limiting e limite de payload.
- Autenticação, RBAC e isolamento por empresa/loja.
- `.gitignore` exclui `.env`, logs, backups e artefatos locais; `.env.example` permanece versionável.

## Pendência operacional

Executar análise de dependências e teste de infraestrutura quando o deploy e o banco persistente forem definidos.
