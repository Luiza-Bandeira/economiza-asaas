# Configuração para Produção - Asaas Integration

## Checklist de Migração Sandbox → Produção

### 1. API Key do Asaas

**Atual (Sandbox):**
```python
ASAAS_API_KEY = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjA3MmVlYzIyLTNjNWItNDdmNi1iZGI4LTg4YTJlNWE1MmUyNzo6JGFhY2hfNmE2NzEwZDMtMTU2Mi00NDQ1LTk5OTYtM2ZmZDI1YmU2ZGQ2'
ASAAS_BASE_URL = 'https://sandbox.asaas.com/api/v3'
```

**Para Produção:**
```python
ASAAS_API_KEY = 'SUA_API_KEY_DE_PRODUCAO'
ASAAS_BASE_URL = 'https://api.asaas.com/api/v3'
```

### 2. Configurações de Segurança

**Arquivo:** `src/main.py`

```python
# Alterar SECRET_KEY para um valor seguro
app.config['SECRET_KEY'] = 'sua-chave-secreta-super-segura-aqui'

# Desabilitar debug em produção
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env` para configurações sensíveis:

```bash
# .env
ASAAS_API_KEY=sua_api_key_de_producao
SECRET_KEY=sua_chave_secreta
DATABASE_URL=postgresql://user:pass@localhost/economiza
ENVIRONMENT=production
```

Instale python-dotenv:
```bash
pip install python-dotenv
```

Atualize `src/main.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
ASAAS_API_KEY = os.getenv('ASAAS_API_KEY')
```

### 4. Banco de Dados

**Para PostgreSQL:**
```bash
pip install psycopg2-binary
```

```python
# src/main.py
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
```

### 5. Webhook Configuration

No painel do Asaas, configure:
- **URL:** `https://seudominio.com/api/asaas/webhook`
- **Eventos:** PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_DELETED
- **Versão:** v3

### 6. HTTPS e SSL

Configure certificado SSL no seu servidor web (Nginx/Apache).

Exemplo Nginx:
```nginx
server {
    listen 443 ssl;
    server_name seudominio.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7. Monitoramento e Logs

Adicione logging em produção:

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/economiza.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

### 8. Rate Limiting

Instale Flask-Limiter:
```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@asaas_bp.route('/criar-cobranca', methods=['POST'])
@limiter.limit("10 per minute")
def criar_cobranca():
    # ... código existente
```

### 9. Backup e Recuperação

Configure backup automático do banco de dados:

```bash
# Script de backup (backup.sh)
#!/bin/bash
pg_dump economiza > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 10. Monitoramento de Saúde

Adicione endpoint de health check:

```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })
```

## Deploy com Docker (Opcional)

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
COPY .env .

EXPOSE 5000

CMD ["python", "src/main.py"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/economiza
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: economiza
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Testes em Produção

### 1. Teste de Conectividade
```bash
curl -I https://seudominio.com/health
```

### 2. Teste de API
```bash
curl -X GET https://seudominio.com/api/asaas/produtos
```

### 3. Teste de Webhook
Use o simulador de webhook do Asaas para testar.

## Manutenção

### Logs Importantes
- Transações de pagamento
- Erros de API
- Tentativas de webhook
- Falhas de autenticação

### Métricas a Monitorar
- Taxa de sucesso de pagamentos
- Tempo de resposta da API
- Erros 4xx/5xx
- Uso de recursos do servidor

## Contatos de Suporte

- **Asaas:** suporte@asaas.com
- **Desenvolvedor:** [seu-email]
- **Economiza:** contato@economiza.com

