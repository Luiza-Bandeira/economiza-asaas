from flask import Blueprint, request, jsonify
import requests
import json
from datetime import datetime

# Configurações do AsaasASAAS_API_KEY = 
'$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjlkNWQ1OThiLWFhMDYtNDViYy1hOGQ5LTUwY2E3YmE0NmZmNjo6JGFhY2hfYTQzYjY2ODEtMmExZi00MWRhLWE3NTEtNzg2ODg0OGVjYTI3'
ASAAS_BASE_URL = 'https://api.asaas.com/api/v3'

HEADERS = {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
}

asaas_bp = Blueprint('asaas', __name__)

@asaas_bp.route('/processar-pagamento-transparente', methods=['POST'])
def processar_pagamento_transparente():
    """Processa pagamento transparente com cartão de crédito"""
    try:
        dados = request.get_json()
        cliente_dados = dados.get('cliente', {})
        cartao_dados = dados.get('cartao', {})
        
        # 1. Criar ou buscar cliente
        cliente_id = criar_ou_buscar_cliente_interno(cliente_dados)
        if not cliente_id:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar cliente'
            }), 400
        
        # 2. Criar cobrança
        cobranca_id = criar_cobranca_cartao_interno(cliente_id, cliente_dados.get('tipo_pagamento', 'avista'))
        if not cobranca_id:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar cobrança'
            }), 400
        
        # 3. Processar pagamento com cartão
        resultado_pagamento = processar_pagamento_cartao_interno(cobranca_id, cartao_dados, cliente_dados)
        
        if resultado_pagamento.get('success'):
            return jsonify({
                'success': True,
                'cobranca': resultado_pagamento.get('cobranca'),
                'pagamento': resultado_pagamento.get('pagamento'),
                'valor': resultado_pagamento.get('valor'),
                'tipo_pagamento': cliente_dados.get('tipo_pagamento', 'avista')
            })
        else:
            return jsonify({
                'success': False,
                'error': resultado_pagamento.get('error', 'Erro no pagamento')
            }), 400
            
    except Exception as e:
        print(f"Erro no pagamento transparente: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

# Dados da empresa
EMPRESA_DADOS = {
    'cnpj': '60.302.044/0001-06',
    'nome_empresarial': 'ECONOMIZA PLANEJAMENTO FINANCEIRO LTDA',
    'nome_fantasia': 'ECONOMIZA'
}

@asaas_bp.route('/criar-cliente', methods=['POST'])
def criar_cliente():
    """Cria um cliente no Asaas"""
    try:
        dados = request.get_json()
        
        # Limpa e formata o telefone
        telefone = dados.get('telefone', '').replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
        
        # Dados obrigatórios para criar cliente
        cliente_data = {
            'name': dados.get('nome'),
            'email': dados.get('email'),
            'cpfCnpj': dados.get('cpf_cnpj', ''),
            'postalCode': dados.get('cep', ''),
            'address': dados.get('endereco', ''),
            'addressNumber': dados.get('numero', ''),
            'complement': dados.get('complemento', ''),
            'province': dados.get('bairro', ''),
            'city': dados.get('cidade', ''),
            'state': dados.get('estado', ''),
            'country': 'Brasil'
        }
        
        # Adiciona telefone apenas se tiver mais de 10 dígitos
        if telefone and len(telefone) >= 10:
            cliente_data['phone'] = telefone
            cliente_data['mobilePhone'] = telefone
        
        # Remove campos vazios
        cliente_data = {k: v for k, v in cliente_data.items() if v}
        
        response = requests.post(
            f'{ASAAS_BASE_URL}/customers',
            headers=HEADERS,
            json=cliente_data
        )
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'cliente': response.json()
            })
        else:
            return jsonify({
                'success': False,
                'error': response.json()
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asaas_bp.route('/criar-cobranca', methods=['POST'])
def criar_cobranca():
    """Cria uma cobrança no Asaas"""
    try:
        dados = request.get_json()
        
        # Primeiro, cria ou busca o cliente
        cliente_response = criar_cliente_interno(dados)
        if not cliente_response['success']:
            return jsonify(cliente_response), 400
            
        cliente_id = cliente_response['cliente']['id']
        
        # Determina o valor baseado no tipo de pagamento
        tipo_pagamento = dados.get('tipo_pagamento', 'avista')  # 'avista' ou 'parcelado'
        
        if tipo_pagamento == 'avista':
            valor = 497.00
            descricao = 'Comunidade Finanças Inteligentes - Pagamento à Vista'
            installment_count = None
        else:
            valor = 596.50
            descricao = 'Comunidade Finanças Inteligentes - Pagamento Parcelado'
            installment_count = dados.get('parcelas', 12)
        
        # Data de vencimento (7 dias a partir de hoje)
        due_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Dados da cobrança
        cobranca_data = {
            'customer': cliente_id,
            'billingType': dados.get('billing_type', 'CREDIT_CARD'),  # PIX, BOLETO, CREDIT_CARD
            'value': valor,
            'dueDate': due_date,
            'description': descricao,
            'externalReference': f'ECONOMIZA-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'discount': {
                'value': 0,
                'dueDateLimitDays': 0
            },
            'interest': {
                'value': 0
            },
            'fine': {
                'value': 0
            }
        }
        
        # Adiciona informações de parcelamento se necessário
        if installment_count and installment_count > 1:
            cobranca_data['installmentCount'] = installment_count
            cobranca_data['installmentValue'] = round(valor / installment_count, 2)
        
        response = requests.post(
            f'{ASAAS_BASE_URL}/payments',
            headers=HEADERS,
            json=cobranca_data
        )
        
        if response.status_code == 200:
            cobranca = response.json()
            return jsonify({
                'success': True,
                'cobranca': cobranca,
                'valor': valor,
                'tipo_pagamento': tipo_pagamento,
                'parcelas': installment_count if installment_count else 1
            })
        else:
            return jsonify({
                'success': False,
                'error': response.json()
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asaas_bp.route('/status-cobranca/<cobranca_id>', methods=['GET'])
def status_cobranca(cobranca_id):
    """Consulta o status de uma cobrança"""
    try:
        response = requests.get(
            f'{ASAAS_BASE_URL}/payments/{cobranca_id}',
            headers=HEADERS
        )
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'cobranca': response.json()
            })
        else:
            return jsonify({
                'success': False,
                'error': response.json()
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asaas_bp.route('/webhook', methods=['POST'])
def webhook():
    """Webhook para receber notificações do Asaas"""
    try:
        dados = request.get_json()
        
        # Log do webhook recebido
        print(f"Webhook recebido: {json.dumps(dados, indent=2)}")
        
        # Processa diferentes tipos de eventos
        event_type = dados.get('event')
        payment_data = dados.get('payment', {})
        
        if event_type == 'PAYMENT_RECEIVED':
            # Pagamento confirmado
            print(f"Pagamento confirmado: {payment_data.get('id')}")
            # Aqui você pode adicionar lógica para liberar acesso ao curso
            
        elif event_type == 'PAYMENT_OVERDUE':
            # Pagamento em atraso
            print(f"Pagamento em atraso: {payment_data.get('id')}")
            
        elif event_type == 'PAYMENT_DELETED':
            # Pagamento cancelado
            print(f"Pagamento cancelado: {payment_data.get('id')}")
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f"Erro no webhook: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asaas_bp.route('/produtos', methods=['GET'])
def listar_produtos():
    """Lista os produtos disponíveis"""
    produtos = [
        {
            'id': 'comunidade-avista',
            'nome': 'Comunidade Finanças Inteligentes - À Vista',
            'descricao': 'Acesso completo por 12 meses + Bônus exclusivos',
            'valor': 497.00,
            'valor_original': 997.00,
            'desconto': 500.00,
            'tipo': 'avista',
            'parcelas': 1,
            'valor_parcela': 497.00
        },
        {
            'id': 'comunidade-parcelado',
            'nome': 'Comunidade Finanças Inteligentes - Parcelado',
            'descricao': 'Acesso completo por 12 meses + Bônus exclusivos',
            'valor': 596.50,
            'valor_original': 997.00,
            'desconto': 400.50,
            'tipo': 'parcelado',
            'parcelas': 12,
            'valor_parcela': 49.71
        }
    ]
    
    return jsonify({
        'success': True,
        'produtos': produtos
    })

def criar_cliente_interno(dados):
    """Função interna para criar cliente"""
    try:
        # Limpa e formata o telefone
        telefone = dados.get('telefone', '').replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
        
        cliente_data = {
            'name': dados.get('nome'),
            'email': dados.get('email'),
            'cpfCnpj': dados.get('cpf_cnpj', ''),
            'postalCode': dados.get('cep', ''),
            'address': dados.get('endereco', ''),
            'addressNumber': dados.get('numero', ''),
            'complement': dados.get('complemento', ''),
            'province': dados.get('bairro', ''),
            'city': dados.get('cidade', ''),
            'state': dados.get('estado', ''),
            'country': 'Brasil'
        }
        
        # Adiciona telefone apenas se tiver mais de 10 dígitos
        if telefone and len(telefone) >= 10:
            cliente_data['phone'] = telefone
            cliente_data['mobilePhone'] = telefone
        
        # Remove campos vazios
        cliente_data = {k: v for k, v in cliente_data.items() if v}
        
        response = requests.post(
            f'{ASAAS_BASE_URL}/customers',
            headers=HEADERS,
            json=cliente_data
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'cliente': response.json()
            }
        else:
            return {
                'success': False,
                'error': response.json()
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }



def criar_ou_buscar_cliente_interno(dados):
    """Cria ou busca cliente no Asaas"""
    try:
        # Limpa telefone
        telefone = dados.get('telefone', '').replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
        
        # Primeiro, tenta buscar cliente por email
        busca_response = requests.get(
            f'{ASAAS_BASE_URL}/customers',
            headers=HEADERS,
            params={'email': dados.get('email')}
        )
        
        if busca_response.status_code == 200:
            clientes = busca_response.json().get('data', [])
            if clientes:
                return clientes[0]['id']
        
        # Se não encontrou, cria novo cliente
        cliente_data = {
            'name': dados.get('nome'),
            'email': dados.get('email'),
            'cpfCnpj': dados.get('cpf', '').replace('.', '').replace('-', ''),
        }
        
        # Adiciona telefone apenas se válido
        if telefone and len(telefone) >= 10:
            cliente_data['phone'] = telefone
            cliente_data['mobilePhone'] = telefone
        
        # Remove campos vazios
        cliente_data = {k: v for k, v in cliente_data.items() if v}
        
        response = requests.post(
            f'{ASAAS_BASE_URL}/customers',
            headers=HEADERS,
            json=cliente_data
        )
        
        if response.status_code == 200:
            return response.json()['id']
        else:
            print(f"Erro ao criar cliente: {response.text}")
            return None
            
    except Exception as e:
        print(f"Erro ao criar/buscar cliente: {str(e)}")
        return None

def criar_cobranca_cartao_interno(cliente_id, tipo_pagamento):
    """Cria cobrança para pagamento com cartão"""
    try:
        # Configurações dos produtos
        produtos = {
            'avista': {
                'valor': 497.0,
                'parcelas': 1,
                'descricao': 'Comunidade Finanças Inteligentes - Pagamento à Vista'
            },
            'parcelado': {
                'valor': 596.50,
                'parcelas': 12,
                'descricao': 'Comunidade Finanças Inteligentes - Pagamento Parcelado'
            }
        }
        
        produto = produtos.get(tipo_pagamento, produtos['avista'])
        
        # Dados da cobrança
        cobranca_data = {
            'customer': cliente_id,
            'billingType': 'CREDIT_CARD',
            'value': produto['valor'],
            'dueDate': (datetime.now().strftime('%Y-%m-%d')),
            'description': produto['descricao'],
            'externalReference': f'ECONOMIZA-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        }
        
        # Adiciona parcelas apenas se for parcelado
        if tipo_pagamento == 'parcelado':
            cobranca_data['installmentCount'] = produto['parcelas']
            cobranca_data['installmentValue'] = round(produto['valor'] / produto['parcelas'], 2)
        
        response = requests.post(
            f'{ASAAS_BASE_URL}/payments',
            headers=HEADERS,
            json=cobranca_data
        )
        
        if response.status_code == 200:
            return response.json()['id']
        else:
            print(f"Erro ao criar cobrança: {response.text}")
            return None
            
    except Exception as e:
        print(f"Erro ao criar cobrança: {str(e)}")
        return None

def processar_pagamento_cartao_interno(cobranca_id, cartao_dados, cliente_dados):
    """Processa pagamento com cartão de crédito"""
    try:
        # Limpa CPF
        cpf = cliente_dados.get('cpf', '').replace('.', '').replace('-', '')
        if not cpf or len(cpf) != 11:
            cpf = '24971563792'  # CPF válido para sandbox do Asaas
        
        # Limpa telefone
        telefone = cliente_dados.get('telefone', '').replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
        if not telefone:
            telefone = '0000000000'  # Telefone padrão para sandbox
        
        # Dados do cartão para o Asaas
        pagamento_data = {
            'creditCard': {
                'holderName': cartao_dados.get('holderName'),
                'number': cartao_dados.get('number'),
                'expiryMonth': cartao_dados.get('expiryMonth'),
                'expiryYear': cartao_dados.get('expiryYear'),
                'ccv': cartao_dados.get('ccv')
            },
            'creditCardHolderInfo': {
                'name': cartao_dados.get('holderName'),
                'email': cliente_dados.get('email', 'cliente@exemplo.com'),
                'cpfCnpj': cpf,
                'postalCode': '01310100',  # CEP padrão para sandbox
                'addressNumber': '123',
                'phone': telefone
            }
        }
        
        # Processa o pagamento
        response = requests.post(
            f'{ASAAS_BASE_URL}/payments/{cobranca_id}/payWithCreditCard',
            headers=HEADERS,
            json=pagamento_data
        )
        
        if response.status_code == 200:
            resultado = response.json()
            return {
                'success': True,
                'cobranca': {'id': cobranca_id},
                'pagamento': resultado,
                'valor': resultado.get('value', 0)
            }
        else:
            error_data = response.json() if response.content else {}
            errors = error_data.get('errors', [])
            error_message = errors[0].get('description', 'Erro no pagamento') if errors else 'Erro no pagamento'
            print(f"Erro no pagamento: {response.text}")
            return {
                'success': False,
                'error': error_message
            }
            
    except Exception as e:
        print(f"Erro ao processar pagamento: {str(e)}")
        return {
            'success': False,
            'error': 'Erro interno no processamento do pagamento'
        }

