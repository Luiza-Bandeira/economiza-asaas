from flask import Blueprint, request, jsonify
import requests
import json
from datetime import datetime

# Configurações do Asaas
ASAAS_API_KEY = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjA3MmVlYzIyLTNjNWItNDdmNi1iZGI4LTg4YTJlNWE1MmUyNzo6JGFhY2hfNmE2NzEwZDMtMTU2Mi00NDQ1LTk5OTYtM2ZmZDI1YmU2ZGQ2'
ASAAS_BASE_URL = 'https://sandbox.asaas.com/api/v3'

HEADERS = {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
}

pagamento_bp = Blueprint('pagamento', __name__)

@pagamento_bp.route('/processar-pagamento-transparente', methods=['POST'])
def processar_pagamento_transparente():
    """Processa pagamento transparente com cartão de crédito"""
    try:
        dados = request.get_json()
        cliente_dados = dados.get('cliente', {})
        cartao_dados = dados.get('cartao', {})
        
        # 1. Criar ou buscar cliente
        cliente_id = criar_ou_buscar_cliente(cliente_dados)
        if not cliente_id:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar cliente'
            }), 400
        
        # 2. Criar cobrança
        cobranca_id = criar_cobranca_cartao(cliente_id, cliente_dados.get('tipo_pagamento', 'avista'))
        if not cobranca_id:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar cobrança'
            }), 400
        
        # 3. Processar pagamento com cartão
        resultado_pagamento = processar_pagamento_cartao(cobranca_id, cartao_dados)
        
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

def criar_ou_buscar_cliente(dados):
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

def criar_cobranca_cartao(cliente_id, tipo_pagamento):
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
            'externalReference': f'ECONOMIZA-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'installmentCount': produto['parcelas'] if tipo_pagamento == 'parcelado' else None
        }
        
        # Remove campos None
        cobranca_data = {k: v for k, v in cobranca_data.items() if v is not None}
        
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

def processar_pagamento_cartao(cobranca_id, cartao_dados):
    """Processa pagamento com cartão de crédito"""
    try:
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
                'email': 'cliente@exemplo.com',  # Pode ser obtido dos dados do cliente
                'cpfCnpj': '00000000000',  # Pode ser obtido dos dados do cliente
                'postalCode': '00000000',
                'addressNumber': '123',
                'phone': '0000000000'
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
            error_message = error_data.get('errors', [{}])[0].get('description', 'Erro no pagamento')
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

