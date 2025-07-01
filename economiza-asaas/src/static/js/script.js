// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializa todas as funcionalidades
    initCountdown();
    initFAQ();
    initSmoothScroll();
    initScrollAnimations();
    initVagasCounter();
    
});

// Contador regressivo
function initCountdown() {
    // Define o tempo final (24 horas a partir de agora)
    const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    
    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            // Atualiza contadores pequenos
            const hoursElements = document.querySelectorAll('#hours');
            const minutesElements = document.querySelectorAll('#minutes');
            const secondsElements = document.querySelectorAll('#seconds');
            
            hoursElements.forEach(el => el.textContent = hours.toString().padStart(2, '0'));
            minutesElements.forEach(el => el.textContent = minutes.toString().padStart(2, '0'));
            secondsElements.forEach(el => el.textContent = seconds.toString().padStart(2, '0'));
            
            // Atualiza contadores grandes
            const hoursLargeElements = document.querySelectorAll('#hours-large');
            const minutesLargeElements = document.querySelectorAll('#minutes-large');
            const secondsLargeElements = document.querySelectorAll('#seconds-large');
            
            hoursLargeElements.forEach(el => el.textContent = hours.toString().padStart(2, '0'));
            minutesLargeElements.forEach(el => el.textContent = minutes.toString().padStart(2, '0'));
            secondsLargeElements.forEach(el => el.textContent = seconds.toString().padStart(2, '0'));
            
        } else {
            // Tempo esgotado
            document.querySelectorAll('.countdown-number').forEach(el => el.textContent = '00');
        }
    }
    
    // Atualiza imediatamente e depois a cada segundo
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fecha outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle do item atual
            item.classList.toggle('active');
        });
    });
}

// Scroll suave para âncoras
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animações no scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observa elementos que devem animar
    const animatedElements = document.querySelectorAll('.problema-item, .beneficio-item, .depoimento, .modulo');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Contador de vagas restantes
function initVagasCounter() {
    const vagasElement = document.querySelector('.vagas-restantes');
    if (vagasElement) {
        let vagas = parseInt(vagasElement.textContent);
        
        // Simula diminuição das vagas a cada 30 segundos
        setInterval(() => {
            if (vagas > 5) {
                vagas--;
                vagasElement.textContent = vagas;
                
                // Adiciona efeito visual
                vagasElement.style.color = '#ffc107';
                setTimeout(() => {
                    vagasElement.style.color = '#ffc107';
                }, 500);
            }
        }, 30000);
    }
}

// Função para abrir checkout (integrada com Asaas)
function abrirCheckout() {
    // Verifica se a função do checkout.js está disponível
    if (typeof window.abrirCheckout === 'function') {
        window.abrirCheckout('avista');
    } else {
        // Fallback para o checkout integrado
        if (document.getElementById('checkoutModal')) {
            document.getElementById('checkoutModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            // Redireciona para página de pagamento externa como fallback
            alert('Redirecionando para o checkout...\n\nIntegração com Asaas configurada!');
        }
    }
}

// Função para abrir termos (placeholder)
function abrirTermos() {
    alert('Aqui seriam exibidos os Termos de Uso');
}

// Função para abrir política de privacidade (placeholder)
function abrirPrivacidade() {
    alert('Aqui seria exibida a Política de Privacidade');
}

// Função para abrir contato (placeholder)
function abrirContato() {
    alert('Contato:\nEmail: contato@economiza.com\nWhatsApp: (38) 99927-3737');
}

// Tracking de eventos (Google Analytics, Facebook Pixel, etc.)
function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    // Console para debug
    console.log('Event tracked:', eventName, eventData);
}

// Eventos de tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
    
    // Track CTA clicks
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            trackEvent('cta_click', {
                button_text: button.textContent.trim(),
                button_position: index + 1
            });
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestones
            if (maxScroll >= 25 && maxScroll < 50) {
                trackEvent('scroll_depth', { depth: '25%' });
            } else if (maxScroll >= 50 && maxScroll < 75) {
                trackEvent('scroll_depth', { depth: '50%' });
            } else if (maxScroll >= 75 && maxScroll < 90) {
                trackEvent('scroll_depth', { depth: '75%' });
            } else if (maxScroll >= 90) {
                trackEvent('scroll_depth', { depth: '90%' });
            }
        }
    });
});

// Otimizações de performance
document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading para imagens
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Preload de recursos críticos
    const criticalResources = [
        'css/style.css',
        'js/script.js'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
});

// Detecção de dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Ajustes específicos para mobile
if (isMobile()) {
    document.addEventListener('DOMContentLoaded', function() {
        // Ajusta altura do viewport em dispositivos móveis
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Reajusta quando a orientação muda
        window.addEventListener('resize', () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
    });
}

// Função para compartilhamento social
function compartilhar(plataforma) {
    const url = encodeURIComponent(window.location.href);
    const texto = encodeURIComponent('Descubra como transformar seus gastos em viagens dos sonhos!');
    
    let shareUrl = '';
    
    switch (plataforma) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${texto}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${texto}%20${url}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${url}&text=${texto}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        trackEvent('share', { platform: plataforma });
    }
}

// Função para copiar link
function copiarLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        // Feedback visual
        const feedback = document.createElement('div');
        feedback.textContent = 'Link copiado!';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            animation: fadeInOut 3s ease;
        `;
        
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 3000);
        
        trackEvent('link_copied');
    });
}

// CSS para animação de feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);



// Progress bar de scroll
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    });
}

// Floating Action Button
function initFAB() {
    const fab = document.createElement('div');
    fab.className = 'fab';
    fab.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    fab.title = 'Fale conosco no WhatsApp';
    
    fab.addEventListener('click', () => {
        const message = encodeURIComponent('Olá! Tenho interesse no Workshop de Milhas Aéreas. Podem me ajudar?');
        window.open(`https://wa.me/5538999273737?text=${message}`, '_blank');
        trackEvent('whatsapp_click');
    });
    
    document.body.appendChild(fab);
}

// Modal de inscrição
function initModal() {
    const modalHTML = `
        <div class="modal" id="inscricaoModal">
            <div class="modal-content">
                <span class="modal-close" onclick="fecharModal()">&times;</span>
                <h2>Garanta Sua Vaga Agora!</h2>
                <form id="inscricaoForm" onsubmit="processarInscricao(event)">
                    <div class="form-group">
                        <label class="form-label" for="nome">Nome Completo *</label>
                        <input type="text" id="nome" name="nome" class="form-input" required>
                        <div class="form-error" id="nomeError"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="email">E-mail *</label>
                        <input type="email" id="email" name="email" class="form-input" required>
                        <div class="form-error" id="emailError"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="telefone">WhatsApp *</label>
                        <input type="tel" id="telefone" name="telefone" class="form-input" required>
                        <div class="form-error" id="telefoneError"></div>
                    </div>
                    
                    <div class="checkbox-group">
                        <div class="checkbox-custom">
                            <input type="checkbox" id="termos" name="termos" required>
                            <span class="checkmark"></span>
                        </div>
                        <label for="termos">
                            Aceito os <a href="#" onclick="abrirTermos()">termos de uso</a> e 
                            <a href="#" onclick="abrirPrivacidade()">política de privacidade</a> *
                        </label>
                    </div>
                    
                    <div class="checkbox-group">
                        <div class="checkbox-custom">
                            <input type="checkbox" id="newsletter" name="newsletter">
                            <span class="checkmark"></span>
                        </div>
                        <label for="newsletter">
                            Quero receber dicas exclusivas sobre milhas por e-mail
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-large" style="width: 100%; margin-top: 20px;">
                        <i class="fas fa-credit-card"></i>
                        Finalizar Inscrição
                    </button>
                </form>
                
                <div class="garantia" style="margin-top: 20px; text-align: center;">
                    <p><i class="fas fa-shield-alt" style="color: #28a745;"></i> Garantia de 7 dias</p>
                    <p style="font-size: 14px; color: #6c757d;">Pagamento 100% seguro</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Função para abrir modal
function abrirModal() {
    const modal = document.getElementById('inscricaoModal');
    modal.classList.add('active');
    trackEvent('modal_opened');
}

// Função para fechar modal
function fecharModal() {
    const modal = document.getElementById('inscricaoModal');
    modal.classList.remove('active');
}

// Processar inscrição
function processarInscricao(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validação
    let isValid = true;
    
    // Validar nome
    const nome = formData.get('nome');
    if (nome.length < 2) {
        mostrarErro('nomeError', 'Nome deve ter pelo menos 2 caracteres');
        isValid = false;
    } else {
        limparErro('nomeError');
    }
    
    // Validar email
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarErro('emailError', 'E-mail inválido');
        isValid = false;
    } else {
        limparErro('emailError');
    }
    
    // Validar telefone
    const telefone = formData.get('telefone');
    const telefoneRegex = /^[\d\s\(\)\-\+]{10,}$/;
    if (!telefoneRegex.test(telefone.replace(/\D/g, ''))) {
        mostrarErro('telefoneError', 'Telefone inválido');
        isValid = false;
    } else {
        limparErro('telefoneError');
    }
    
    if (isValid) {
        // Simular processamento
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Aqui seria a integração real com o sistema de pagamento
            trackEvent('form_submitted', {
                nome: nome,
                email: email,
                telefone: telefone,
                newsletter: formData.get('newsletter') ? 'sim' : 'não'
            });
            
            // Redirecionar para checkout
            window.location.href = '#checkout'; // Substituir pela URL real
            
            mostrarToast('Redirecionando para o pagamento...', 'success');
            fecharModal();
        }, 2000);
    }
}

// Funções auxiliares para validação
function mostrarErro(elementId, mensagem) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;
    
    errorElement.textContent = mensagem;
    inputElement.classList.add('error');
}

function limparErro(elementId) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;
    
    errorElement.textContent = '';
    inputElement.classList.remove('error');
}

// Sistema de notificações toast
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Máscara para telefone
function initTelefoneMask() {
    document.addEventListener('input', (e) => {
        if (e.target.id === 'telefone') {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
            }
            
            e.target.value = value;
        }
    });
}

// Atualizar função abrirCheckout
function abrirCheckout() {
    abrirModal();
}

// Lazy loading de imagens
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });
}

// Detecção de saída da página
function initExitIntent() {
    let exitIntentShown = false;
    
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !exitIntentShown) {
            exitIntentShown = true;
            mostrarToast('⚠️ Não perca esta oportunidade única! Apenas 23 vagas restantes.', 'warning');
            trackEvent('exit_intent');
        }
    });
}

// Scroll suave melhorado
function initSmoothScrollEnhanced() {
    // Adicionar offset para header fixo
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                trackEvent('internal_link_click', { target: targetId });
            }
        });
    });
}

// Inicializar todas as funcionalidades avançadas
document.addEventListener('DOMContentLoaded', function() {
    initScrollProgress();
    initFAB();
    initModal();
    initTelefoneMask();
    initLazyLoading();
    initExitIntent();
    initSmoothScrollEnhanced();
    
    // Fechar modal ao clicar fora
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('inscricaoModal');
        if (e.target === modal) {
            fecharModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
});

// Performance monitoring
function initPerformanceMonitoring() {
    // Medir tempo de carregamento
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        trackEvent('page_load_time', { time: loadTime });
        
        if (loadTime > 3000) {
            console.warn('Página carregou lentamente:', loadTime + 'ms');
        }
    });
    
    // Medir First Contentful Paint
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    trackEvent('first_contentful_paint', { time: entry.startTime });
                }
            }
        });
        
        observer.observe({ entryTypes: ['paint'] });
    }
}

// Inicializar monitoramento de performance
initPerformanceMonitoring();

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(registrationError => {
                console.log('SW falhou:', registrationError);
            });
    });
}

