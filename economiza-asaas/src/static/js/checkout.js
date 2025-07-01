// Configurações do checkout
const CHECKOUT_CONFIG = {
    apiUrl: '/api/asaas',
    produtos: {
        'avista': {
            id: 'comunidade-avista',
            nome: 'Comunidade Finanças Inteligentes - À Vista',
            valor: 497.00,
            parcelas: 1,
            desconto: 500.00
        },
        'parcelado': {
            id: 'comunidade-parcelado',
            nome: 'Comunidade Finanças Inteligentes - Parcelado',
            valor: 596.50,
            parcelas: 12,
            valorParcela: 49.71
        }
    }
};

// Estado do checkout
let checkoutState = {
    tipoPagamento: 'avista',
    dadosCliente: {},
    cobrancaId: null,
    loading: false
};

// Inicializa o checkout
function initCheckout() {
    criarModalCheckout();
    configurarEventListeners();
}

// Cria o modal de checkout
function criarModalCheckout() {
    const modalHTML = `
        <div class="checkout-modal" id="checkoutModal" style="display: none;">
            <div class="checkout-overlay" onclick="fecharCheckout()"></div>
            <div class="checkout-container">
                <div class="checkout-header">
                    <h2>Finalizar Inscrição</h2>
                    <button class="checkout-close" onclick="fecharCheckout()">&times;</button>
                </div>
                
                <div class="checkout-content">
                    <!-- Seleção do Plano -->
                    <div class="checkout-section">
                        <h3>Escolha seu plano</h3>
                        <div class="planos-container">
                            <div class="plano-card" data-tipo="avista">
                                <div class="plano-header">
                                    <h4>Pagamento à Vista</h4>
                                    <div class="plano-preco">
                                        <span class="preco-original">R$ 997</span>
                                        <span class="preco-atual">R$ 497</span>
                                    </div>
                                    <div class="plano-economia">Economize R$ 500</div>
                                </div>
                                <div class="plano-beneficios">
                                    <div class="beneficio">
                                        <i class="fas fa-check"></i>
                                        <span>Acesso completo por 12 meses</span>
                                    </div>
                                    <div class="beneficio">
                                        <i class="fas fa-check"></i>
                                        <span>Todos os bônus inclusos</span>
                                    </div>
                                    <div class="beneficio">
                                        <i class="fas fa-check"></i>
                                        <span>Melhor custo-benefício</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="plano-card" data-tipo="parcelado">
                                <div class="plano-header">
                                    <h4>Pagamento Parcelado</h4>
                                    <div class="plano-preco">
                                        <span class="preco-atual">12x R$ 49,71</span>
                                        <span class="preco-total">Total: R$ 596,50</span>
                                    </div>
                                </div>
                                <div class="plano-beneficios">
                                    <div class="beneficio">
                                        <i class="fas fa-check"></i>
                                        <span>Acesso completo por 12 meses</span>
                                    </div>
                                    <div class="beneficio">
                                        <i class="fas fa-check"></i>
                                        <span>Todos os bônus inclusos</span>
                                    </div>
                                    <div class="beneficio">
                                        <i class="fas fa-check"></i>
                                        <span>Parcele sem juros</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dados do Cliente -->
                    <div class="checkout-section">
                        <h3>Seus dados</h3>
                        <form id="checkoutForm" class="checkout-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="nome">Nome completo *</label>
                                    <input type="text" id="nome" name="nome" required>
                                </div>
                                <div class="form-group">
                                    <label for="email">E-mail *</label>
                                    <input type="email" id="email" name="email" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="telefone">WhatsApp *</label>
                                    <input type="tel" id="telefone" name="telefone" required>
                                </div>
                                <div class="form-group">
                                    <label for="cpf">CPF</label>
                                    <input type="text" id="cpf" name="cpf">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="termos" name="termos" required>
                                    <label for="termos">
                                        Aceito os <a href="#" onclick="abrirTermos()">termos de uso</a> e 
                                        <a href="#" onclick="abrirPrivacidade()">política de privacidade</a> *
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <input type="checkbox" id="newsletter" name="newsletter">
                                    <label for="newsletter">
                                        Quero receber dicas exclusivas sobre finanças e milhas por e-mail
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Dados do Cartão de Crédito -->
                    <div class="checkout-section">
                        <h3>Dados do Cartão</h3>
                        <div class="checkout-form">
                            <div class="form-group">
                                <label for="cardNumber">Número do Cartão *</label>
                                <input type="text" id="cardNumber" name="cardNumber" placeholder="0000 0000 0000 0000" maxlength="19" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="cardExpiry">Validade *</label>
                                    <input type="text" id="cardExpiry" name="cardExpiry" placeholder="MM/AA" maxlength="5" required>
                                </div>
                                <div class="form-group">
                                    <label for="cardCvv">CVV *</label>
                                    <input type="text" id="cardCvv" name="cardCvv" placeholder="000" maxlength="4" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="cardName">Nome no Cartão *</label>
                                <input type="text" id="cardName" name="cardName" placeholder="Nome como está no cartão" required>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Resumo do Pedido -->
                    <div class="checkout-section">
                        <div class="resumo-pedido">
                            <h3>Resumo do pedido</h3>
                            <div class="resumo-item">
                                <span class="item-nome" id="resumoNome">Comunidade Finanças Inteligentes</span>
                                <span class="item-valor" id="resumoValor">R$ 497,00</span>
                            </div>
                            <div class="resumo-desconto" id="resumoDesconto">
                                <span>Desconto</span>
                                <span>-R$ 500,00</span>
                            </div>
                            <div class="resumo-total">
                                <span>Total</span>
                                <span id="resumoTotal">R$ 497,00</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="checkout-footer">
                    <button type="button" class="btn-checkout" onclick="processarPagamento()" id="btnCheckout">
                        <i class="fas fa-credit-card"></i>
                        <span id="btnCheckoutText">Finalizar Pagamento</span>
                    </button>
                    
                    <div class="checkout-garantia">
                        <i class="fas fa-shield-alt"></i>
                        <span>Garantia de 7 dias • Pagamento 100% seguro</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Configura os event listeners
function configurarEventListeners() {
    // Seleção de planos
    document.querySelectorAll('.plano-card').forEach(card => {
        card.addEventListener('click', function() {
            selecionarPlano(this.dataset.tipo);
        });
    });
    
    // Máscaras de input
    document.getElementById('telefone').addEventListener('input', function(e) {
        e.target.value = aplicarMascaraTelefone(e.target.value);
    });
    
    document.getElementById('cpf').addEventListener('input', function(e) {
        e.target.value = aplicarMascaraCPF(e.target.value);
    });
    
    // Máscaras do cartão
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        e.target.value = aplicarMascaraCartao(e.target.value);
    });
    
    document.getElementById('cardExpiry').addEventListener('input', function(e) {
        e.target.value = aplicarMascaraValidade(e.target.value);
    });
    
    document.getElementById('cardCvv').addEventListener('input', function(e) {
        e.target.value = aplicarMascaraCVV(e.target.value);
    });
}

// Abre o checkout
function abrirCheckout(tipo = 'avista') {
    abrirCheckoutModal(tipo);
}

// Fecha o checkout
function fecharCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Seleciona um plano
function selecionarPlano(tipo) {
    checkoutState.tipoPagamento = tipo;
    
    // Remove seleção anterior
    document.querySelectorAll('.plano-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Adiciona seleção atual
    document.querySelector(`[data-tipo="${tipo}"]`).classList.add('selected');
    
    // Atualiza resumo
    atualizarResumo();
}

// Atualiza o resumo do pedido
function atualizarResumo() {
    const produto = CHECKOUT_CONFIG.produtos[checkoutState.tipoPagamento];
    
    document.getElementById('resumoNome').textContent = produto.nome;
    
    if (checkoutState.tipoPagamento === 'avista') {
        document.getElementById('resumoValor').textContent = `R$ ${produto.valor.toFixed(2).replace('.', ',')}`;
        document.getElementById('resumoDesconto').style.display = 'flex';
        document.getElementById('resumoTotal').textContent = `R$ ${produto.valor.toFixed(2).replace('.', ',')}`;
    } else {
        document.getElementById('resumoValor').textContent = `12x R$ ${produto.valorParcela.toFixed(2).replace('.', ',')}`;
        document.getElementById('resumoDesconto').style.display = 'none';
        document.getElementById('resumoTotal').textContent = `R$ ${produto.valor.toFixed(2).replace('.', ',')}`;
    }
}

// Processa o pagamento
async function processarPagamento() {
    if (checkoutState.loading) return;
    
    try {
        setLoadingState(true);
        
        // Coleta dados do formulário
        const dadosCliente = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            cpf: document.getElementById('cpf').value,
            tipo_pagamento: checkoutState.tipoPagamento
        };
        
        // Coleta dados do cartão
        const dadosCartao = {
            number: document.getElementById('cardNumber').value.replace(/\s/g, ''),
            expiryMonth: document.getElementById('cardExpiry').value.split('/')[0],
            expiryYear: '20' + document.getElementById('cardExpiry').value.split('/')[1],
            ccv: document.getElementById('cardCvv').value,
            holderName: document.getElementById('cardName').value
        };
        
        // Valida campos obrigatórios
        if (!validarFormulario(dadosCliente, dadosCartao)) {
            setLoadingState(false);
            return;
        }
        
        // Envia dados para o backend
        const response = await fetch('/api/asaas/processar-pagamento-transparente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cliente: dadosCliente,
                cartao: dadosCartao
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            checkoutState.cobrancaId = result.cobranca.id;
            
            // Track evento de sucesso
            if (typeof trackEvent === 'function') {
                trackEvent('payment_initiated', {
                    cobranca_id: result.cobranca.id,
                    valor: result.valor,
                    tipo_pagamento: result.tipo_pagamento
                });
            }
            
            // Mostra sucesso
            mostrarSucesso(result);
            
        } else {
            mostrarErro(result.error || 'Erro ao processar pagamento');
        }
        
    } catch (error) {
        console.error('Erro no checkout:', error);
        mostrarErro(error.message);
        
        // Track evento de erro
        if (typeof trackEvent === 'function') {
            trackEvent('payment_error', {
                error: error.message
            });
        }
        
    } finally {
        setLoadingState(false);
    }
}
// Define estado de loading
function setLoadingState(loading) {
    checkoutState.loading = loading;
    const btn = document.getElementById('btnCheckout');
    const btnText = document.getElementById('btnCheckoutText');
    
    if (loading) {
        btn.disabled = true;
        btn.classList.add('loading');
        btnText.textContent = 'Processando...';
    } else {
        btn.disabled = false;
        btn.classList.remove('loading');
        btnText.textContent = 'Finalizar Pagamento';
    }
}

// Mostra tela de sucesso
function mostrarSucesso(result) {
    const sucessoHTML = `
        <div class="checkout-sucesso">
            <div class="sucesso-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Pagamento Iniciado com Sucesso!</h3>
            <p>Sua cobrança foi criada e você receberá as instruções de pagamento por e-mail.</p>
            
            <div class="sucesso-detalhes">
                <div class="detalhe-item">
                    <span class="label">Produto:</span>
                    <span class="value">${CHECKOUT_CONFIG.produtos[result.tipo_pagamento].nome}</span>
                </div>
                <div class="detalhe-item">
                    <span class="label">Valor:</span>
                    <span class="value">R$ ${result.valor.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="detalhe-item">
                    <span class="label">ID da Cobrança:</span>
                    <span class="value">${result.cobranca.id}</span>
                </div>
            </div>
            
            <div class="sucesso-acoes">
                <button class="btn-primary" onclick="fecharCheckout()">
                    Fechar
                </button>
            </div>
            
            <div class="sucesso-info">
                <p><strong>Próximos passos:</strong></p>
                <ul>
                    <li>Verifique seu e-mail para instruções de pagamento</li>
                    <li>Após a confirmação do pagamento, você receberá acesso à comunidade</li>
                    <li>Em caso de dúvidas, entre em contato conosco</li>
                </ul>
            </div>
        </div>
    `;
    
    document.querySelector('.checkout-content').innerHTML = sucessoHTML;
    document.querySelector('.checkout-footer').style.display = 'none';
}

// Mostra erro
function mostrarErro(mensagem) {
    const erroDiv = document.createElement('div');
    erroDiv.className = 'checkout-erro';
    erroDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${mensagem}</span>
    `;
    
    // Remove erro anterior se existir
    const erroAnterior = document.querySelector('.checkout-erro');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    // Adiciona novo erro
    document.querySelector('.checkout-content').insertBefore(erroDiv, document.querySelector('.checkout-section'));
    
    // Remove erro após 5 segundos
    setTimeout(() => {
        erroDiv.remove();
    }, 5000);
}

// Aplica máscara de telefone
function aplicarMascaraTelefone(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
    return valor;
}

// Aplica máscara de CPF
function aplicarMascaraCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return valor;
}

// Aplica máscara de cartão de crédito
function aplicarMascaraCartao(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{4})(\d)/, '$1 $2');
    valor = valor.replace(/(\d{4})(\d)/, '$1 $2');
    valor = valor.replace(/(\d{4})(\d)/, '$1 $2');
    return valor;
}

// Aplica máscara de validade
function aplicarMascaraValidade(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{2})(\d)/, '$1/$2');
    return valor;
}

// Aplica máscara de CVV
function aplicarMascaraCVV(valor) {
    return valor.replace(/\D/g, '');
}

// Função principal para abrir checkout
function abrirCheckoutModal(tipo = 'avista') {
    checkoutState.tipoPagamento = tipo;
    selecionarPlano(tipo);
    document.getElementById('checkoutModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Track evento
    if (typeof trackEvent === 'function') {
        trackEvent('checkout_opened', {
            tipo_pagamento: tipo
        });
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initCheckout();
});

// CSS para o checkout
const checkoutCSS = `
    .checkout-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .checkout-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
    }
    
    .checkout-container {
        position: relative;
        background: white;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .checkout-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        border-bottom: 1px solid #eee;
    }
    
    .checkout-header h2 {
        margin: 0;
        color: #333;
    }
    
    .checkout-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
    }
    
    .checkout-content {
        padding: 30px;
    }
    
    .checkout-section {
        margin-bottom: 30px;
    }
    
    .checkout-section h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
    }
    
    .planos-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    .plano-card {
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .plano-card:hover {
        border-color: #007bff;
    }
    
    .plano-card.selected {
        border-color: #007bff;
        background: #f8f9ff;
    }
    
    .plano-header h4 {
        margin: 0 0 10px 0;
        color: #333;
    }
    
    .plano-preco {
        margin-bottom: 10px;
    }
    
    .preco-original {
        text-decoration: line-through;
        color: #999;
        font-size: 14px;
    }
    
    .preco-atual {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        margin-left: 10px;
    }
    
    .preco-total {
        font-size: 14px;
        color: #666;
        display: block;
    }
    
    .plano-economia {
        background: #28a745;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
        margin-bottom: 15px;
    }
    
    .plano-beneficios {
        list-style: none;
        padding: 0;
    }
    
    .beneficio {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
    }
    
    .beneficio i {
        color: #28a745;
        margin-right: 8px;
    }
    
    .checkout-form {
        display: grid;
        gap: 20px;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
    }
    
    .form-group label {
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
    }
    
    .form-group input {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #007bff;
    }
    
    .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    
    .checkbox-group input[type="checkbox"] {
        margin-top: 3px;
    }
    
    .checkbox-group label {
        font-size: 14px;
        line-height: 1.4;
    }
    
    .resumo-pedido {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
    }
    
    .resumo-item,
    .resumo-desconto,
    .resumo-total {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    
    .resumo-desconto {
        color: #28a745;
        font-size: 14px;
    }
    
    .resumo-total {
        border-top: 1px solid #ddd;
        padding-top: 10px;
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 0;
    }
    
    .checkout-footer {
        padding: 20px 30px;
        border-top: 1px solid #eee;
        text-align: center;
    }
    
    .btn-checkout {
        background: #007bff;
        color: white;
        border: none;
        padding: 15px 40px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 0 auto 15px auto;
        transition: all 0.3s ease;
    }
    
    .btn-checkout:hover {
        background: #0056b3;
    }
    
    .btn-checkout:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    
    .btn-checkout.loading {
        background: #ccc;
    }
    
    .checkout-garantia {
        font-size: 14px;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    
    .checkout-garantia i {
        color: #28a745;
    }
    
    .checkout-erro {
        background: #f8d7da;
        color: #721c24;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .checkout-sucesso {
        text-align: center;
        padding: 40px 20px;
    }
    
    .sucesso-icon {
        font-size: 60px;
        color: #28a745;
        margin-bottom: 20px;
    }
    
    .sucesso-detalhes {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: left;
    }
    
    .detalhe-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    
    .detalhe-item:last-child {
        margin-bottom: 0;
    }
    
    .label {
        font-weight: 500;
    }
    
    .sucesso-info {
        text-align: left;
        margin-top: 20px;
    }
    
    .sucesso-info ul {
        margin: 10px 0;
        padding-left: 20px;
    }
    
    .sucesso-info li {
        margin-bottom: 5px;
    }
    
    @media (max-width: 768px) {
        .checkout-container {
            width: 95%;
            margin: 20px;
        }
        
        .planos-container {
            grid-template-columns: 1fr;
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .checkout-content {
            padding: 20px;
        }
    }
`;

// Adiciona CSS ao documento
const style = document.createElement('style');
style.textContent = checkoutCSS;
document.head.appendChild(style);



// Valida o formulário
function validarFormulario(dadosCliente, dadosCartao) {
    // Valida dados do cliente
    if (!dadosCliente.nome || !dadosCliente.email || !dadosCliente.telefone) {
        mostrarErro('Por favor, preencha todos os campos obrigatórios');
        return false;
    }
    
    // Valida email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dadosCliente.email)) {
        mostrarErro('Por favor, insira um email válido');
        return false;
    }
    
    // Valida dados do cartão
    if (!dadosCartao.number || !dadosCartao.expiryMonth || !dadosCartao.expiryYear || !dadosCartao.ccv || !dadosCartao.holderName) {
        mostrarErro('Por favor, preencha todos os dados do cartão');
        return false;
    }
    
    // Valida número do cartão (deve ter 13-19 dígitos)
    if (dadosCartao.number.length < 13 || dadosCartao.number.length > 19) {
        mostrarErro('Número do cartão inválido');
        return false;
    }
    
    // Valida CVV
    if (dadosCartao.ccv.length < 3 || dadosCartao.ccv.length > 4) {
        mostrarErro('CVV inválido');
        return false;
    }
    
    // Valida termos
    if (!document.getElementById('termos').checked) {
        mostrarErro('Você deve aceitar os termos de uso');
        return false;
    }
    
    return true;
}

