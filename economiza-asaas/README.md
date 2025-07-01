# Integração Asaas - Economiza

Sistema de pagamento integrado com Asaas para a empresa Economiza Planejamento Financeiro LTDA.

## Visão Geral

Este projeto integra o site da Comunidade Finanças Inteligentes com a API do Asaas para processar pagamentos de forma segura e automatizada.

### Características Principais

- ✅ Integração completa com API do Asaas (Sandbox)
- ✅ Suporte a pagamento à vista (R$ 497,00) e parcelado (12x R$ 49,71)
- ✅ Interface de checkout responsiva e moderna
- ✅ Validação de formulários e tratamento de erros
- ✅ Criação automática de clientes no Asaas
- ✅ Geração de cobranças com diferentes tipos de pagamento
- ✅ Sistema de webhook para notificações

## Configuração

### Dados da Empresa
- **CNPJ:** 60.302.044/0001-06
- **Razão Social:** ECONOMIZA PLANEJAMENTO FINANCEIRO LTDA
- **Nome Fantasia:** ECONOMIZA

### API Key do Asaas
- **Ambiente:** Sandbox
- **API Key:** `$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjA3MmVlYzIyLTNjNWItNDdmNi1iZGI4LTg4YTJlNWE1MmUyNzo6JGFhY2hfNmE2NzEwZDMtMTU2Mi00NDQ1LTk5OTYtM2ZmZDI1YmU2ZGQ2`

### Produtos Configurados

#### 1. Pagamento à Vista
- **Valor:** R$ 497,00
- **Desconto:** R$ 500,00 (de R$ 997,00)
- **Parcelas:** 1x
- **Tipo:** `avista`

#### 2. Pagamento Parcelado
- **Valor Total:** R$ 596,50
- **Parcelas:** 12x R$ 49,71
- **Tipo:** `parcelado`

## Estrutura do Projeto

```
economiza-asaas/
├── src/
│   ├── main.py                 # Aplicação Flask principal
│   ├── routes/
│   │   ├── asaas.py           # Rotas da API Asaas
│   │   └── user.py            # Rotas de usuário (template)
│   ├── models/
│   │   └── user.py            # Modelos de dados
│   ├── static/                # Arquivos estáticos do frontend
│   │   ├── index.html         # Página principal
│   │   ├── css/style.css      # Estilos
│   │   ├── js/
│   │   │   ├── script.js      # Scripts principais
│   │   │   └── checkout.js    # Sistema de checkout
│   │   └── assets/            # Imagens e recursos
│   └── database/
│       └── app.db             # Banco de dados SQLite
├── venv/                      # Ambiente virtual Python
├── requirements.txt           # Dependências Python
└── README.md                  # Esta documentação
```

## Instalação e Execução

### Pré-requisitos
- Python 3.11+
- pip

### Passos para Instalação

1. **Clone ou extraia o projeto:**
```bash
cd economiza-asaas
```

2. **Ative o ambiente virtual:**
```bash
source venv/bin/activate
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Execute a aplicação:**
```bash
python src/main.py
```

5. **Acesse no navegador:**
```
http://localhost:5000
```

## API Endpoints

### Asaas Integration

#### `POST /api/asaas/criar-cliente`
Cria um novo cliente no Asaas.

**Parâmetros:**
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "telefone": "11999999999",
  "cpf_cnpj": "123.456.789-00"
}
```

#### `POST /api/asaas/criar-cobranca`
Cria uma cobrança no Asaas.

**Parâmetros:**
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "telefone": "11999999999",
  "tipo_pagamento": "avista",
  "billing_type": "CREDIT_CARD"
}
```

#### `GET /api/asaas/status-cobranca/<cobranca_id>`
Consulta o status de uma cobrança.

#### `POST /api/asaas/webhook`
Recebe notificações do Asaas sobre mudanças no status dos pagamentos.

#### `GET /api/asaas/produtos`
Lista os produtos disponíveis com preços e configurações.

## Frontend - Sistema de Checkout

### Funcionalidades

1. **Modal de Checkout Responsivo**
   - Seleção entre pagamento à vista e parcelado
   - Formulário de dados do cliente
   - Resumo do pedido em tempo real
   - Validação de campos obrigatórios

2. **Integração com Backend**
   - Comunicação via AJAX com API Flask
   - Tratamento de erros e feedback visual
   - Máscaras automáticas para telefone e CPF

3. **Experiência do Usuário**
   - Design moderno e intuitivo
   - Animações e transições suaves
   - Feedback visual para ações do usuário
   - Compatibilidade mobile

### Como Usar o Checkout

1. **Abrir o Checkout:**
```javascript
abrirCheckout('avista'); // ou 'parcelado'
```

2. **Eventos Disponíveis:**
- `checkout_opened` - Checkout foi aberto
- `payment_initiated` - Pagamento foi iniciado
- `payment_error` - Erro no pagamento

## Configurações de Produção

### Alterações Necessárias para Produção

1. **API Key do Asaas:**
   - Substituir a API Key de sandbox pela de produção
   - Alterar `ASAAS_BASE_URL` para `https://api.asaas.com/api/v3`

2. **Configurações de Segurança:**
   - Alterar `SECRET_KEY` do Flask
   - Configurar HTTPS
   - Implementar rate limiting

3. **Banco de Dados:**
   - Migrar de SQLite para PostgreSQL/MySQL
   - Configurar backup automático

### Deploy

O projeto está pronto para deploy usando o comando:
```bash
# Para deploy do backend Flask
python src/main.py
```

## Webhook Configuration

Para receber notificações do Asaas em produção, configure o webhook URL:
```
https://seudominio.com/api/asaas/webhook
```

### Eventos Suportados:
- `PAYMENT_RECEIVED` - Pagamento confirmado
- `PAYMENT_OVERDUE` - Pagamento em atraso  
- `PAYMENT_DELETED` - Pagamento cancelado

## Troubleshooting

### Problemas Comuns

1. **Erro de telefone inválido:**
   - O Asaas é rigoroso com formato de telefone
   - Sistema remove automaticamente caracteres especiais
   - Telefones com menos de 10 dígitos são ignorados

2. **Erro de CORS:**
   - Flask configurado com CORS habilitado
   - Verificar se `flask-cors` está instalado

3. **Erro de API Key:**
   - Verificar se a API Key está correta
   - Confirmar se está usando o ambiente correto (sandbox/produção)

## Suporte

Para dúvidas sobre a integração:
- **Email:** contato@economiza.com
- **WhatsApp:** (38) 99927-3737

## Licença

Este projeto foi desenvolvido especificamente para a Economiza Planejamento Financeiro LTDA.

