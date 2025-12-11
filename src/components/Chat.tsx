import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Loader, CheckCircle, Package, Video, CreditCard, QrCode, AlertCircle, X } from 'lucide-react';
import { createPix, checkPaymentStatus, type PixCreationResponse } from '../services/pushinPayService';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasPaymentButton?: boolean;
  paymentType?: 'package' | 'video';
  paymentData?: {
    name: string;
    price: number;
    duration?: number;
  };
}

interface ChatProps {
  onTabChange: (tab: string) => void;
  onStartCall: (duration: number) => void;
}

const Chat: React.FC<ChatProps> = ({ onTabChange, onStartCall }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Oi amor, Estava te esperando! 🥰",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [paymentData, setPaymentData] = useState<{
    id: string;
    qr_code: string;
    qr_code_base64: string;
    amount: number;
    description: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): { text: string; hasPaymentButton?: boolean; paymentType?: 'package' | 'video'; paymentData?: any } => {
    const message = userMessage.toLowerCase().trim();
    
    if (message === 'oi' || message === 'olá' || message === 'ola' || message === 'hey') {
      return { text: "Oi amor 😘, quer uma surpresa?" };
    }
    
    if (message === 'sim' || message === 'quero' || message === 'claro') {
      return { 
        text: "Que tal a gente fazer uma chamada de vídeo de 10 minutinhos pra gozar gostoso? 😈", 
        hasPaymentButton: true, 
        paymentType: 'video',
        paymentData: { name: 'Videochamada 10min', price: 14.90, duration: 10 }
      };
    }
    
    if (message.includes('quanto') || message.includes('preço') || message.includes('valor') || message.includes('custa')) {
      return { 
        text: "Tenho um pacote especial pra você por apenas R$9,90", 
        hasPaymentButton: true, 
        paymentType: 'package',
        paymentData: { name: 'Pacote Transando', price: 9.90 }
      };
    }
    
    if (message.includes('video') || message.includes('vídeo') || message.includes('chamada')) {
      return { 
        text: "Minha chamada de vídeo é de 10 minutinhos, quer fazer agora que estou disponível?", 
        hasPaymentButton: true, 
        paymentType: 'video',
        paymentData: { name: 'Videochamada 5min', price: 34.90, duration: 10 }
      };
    }
    
    if (message.includes('pacote') || message.includes('plano')) {
      return { 
        text: "Tenho meu pacote completo por apenas R$34,90... Videos fazendo anal, transando gostoso, dando minha bucetinha e muito mais 😈", 
        hasPaymentButton: true, 
        paymentType: 'package',
        paymentData: { name: 'Pacote Completo', price: 34.90 }
      };
    }

    if (message.includes('não') || message === 'nao') {
      return { text: "Tudo bem meu amor, queria muito que você me visse peladinha..." };
    }

    if (message.includes('obrigad') || message.includes('valeu') || message.includes('brigad')) {
      return { text: "De nada lindinho 😘 Sempre aqui pra você!" };
    }
    
    // Default response
    return { 
      text: "Quer ver meus conteúdos bem safadinhos? 💋 Ou prefere uma video chamada bem gostosa agora?", 
      hasPaymentButton: true, 
      paymentType: 'package',
      paymentData: { name: 'Ver Pacotes', price: 14.90 }
    };
  };

  const handlePurchase = async (paymentInfo: any) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result: PixCreationResponse = await createPix(paymentInfo.price);

      setPaymentData({
        id: result.id,
        qr_code: result.qr_code,
        qr_code_base64: result.qr_code_base64,
        amount: paymentInfo.price,
        description: paymentInfo.name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPixCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code).then(() => {
        setPaymentMessage('✅ Chave Pix copiada! Cole no seu app de pagamento.');
        setTimeout(() => setPaymentMessage(''), 3000);
      });
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentData?.id) return;

    setIsVerifying(true);
    setPaymentMessage('');
    
    try {
      const result = await checkPaymentStatus(paymentData.id);
      
      if (result.status === 'paid') {
        setPaymentMessage('🎉 Pagamento confirmado! Redirecionando...');
        setTimeout(() => {
          setPaymentData(null);
          if (paymentData.description.includes('Videochamada')) {
            // Extrair duração do nome do pacote
            const durationMatch = paymentData.description.match(/(\d+)min/);
            const duration = durationMatch ? parseInt(durationMatch[1]) : 10;
            onStartCall(duration);
          } else {
            onTabChange('packages');
          }
        }, 2000);
      } else if (result.status === 'expired') {
        setPaymentMessage('⏰ Este pagamento expirou. Gere um novo QR Code para continuar.');
      } else if (result.status === 'created') {
        setPaymentMessage('⏳ Pagamento ainda não foi identificado. Aguarde um momento e tente novamente.');
      } else {
        setPaymentMessage(`📋 Status atual: ${result.status}. Aguarde e tente novamente.`);
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      setPaymentMessage('❌ Erro ao verificar pagamento. Verifique sua conexão e tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot typing delay with realistic timing
    setTimeout(() => {
      setIsTyping(false);
      const response = getBotResponse(inputText);
      const botResponse: Message = {
        id: messages.length + 2,
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        hasPaymentButton: response.hasPaymentButton,
        paymentType: response.paymentType,
        paymentData: response.paymentData
      };
      setMessages(prev => [...prev, botResponse]);
    }, 2000 + Math.random() * 5000); // Random delay between 2-5s

    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = ['Videochamada', 'Oi', 'Pacotes', 'Quero'];

  return (
    <>
      <div className="pb-20 pt-6 flex flex-col h-screen">
      {/* Enhanced header */}
      <div className="px-4 pb-4 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src="https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/10/majoblonde_3723240941839833017s2025-10-6-13.50.791-story-1.jpg"
              alt="Daynara"
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/50"
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-white font-semibold text-lg">Daynara</h2>
              <CheckCircle size={16} className="text-orange-500 fill-current" />
            </div>
            <p className="text-green-400 text-sm flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {isTyping ? 'Digitando...' : 'Disponível para conversar'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <img
                src="https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/10/majoblonde_3723240941839833017s2025-10-6-13.50.791-story-1.jpg"
                alt="Daynara"
                className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 self-end border border-orange-500/30"
                loading="lazy"
              />
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                message.isUser
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-br-sm shadow-lg'
                  : 'bg-gray-800 text-white rounded-bl-sm border border-gray-700/50'
              }`}
            >
              <p className="leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${message.isUser ? 'text-orange-100' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
            
            {/* Payment Button */}
            {message.hasPaymentButton && message.paymentData && (
              <div className="flex justify-start mt-2">
                <div className="ml-10">
                  <button
                    onClick={() => handlePurchase(message.paymentData)}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2 shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        {message.paymentType === 'video' ? <Video size={16} /> : <Package size={16} />}
                        <span>Pagar R${message.paymentData.price.toFixed(2).replace('.', ',')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <img
              src="https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/10/majoblonde_3723240941839833017s2025-10-6-13.50.791-story-1.jpg"
              alt="Daynara"
              className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 border border-orange-500/30"
              loading="lazy"
            />
            <div className="bg-gray-800 text-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-700/50 max-w-xs">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-gray-400 text-sm ml-2">Digitando</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-3 bg-gray-900/30 backdrop-blur-sm">
        <div className="flex space-x-2 overflow-x-auto">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => {
                setInputText(reply);
                setTimeout(handleSendMessage, 100);
              }}
              className="flex-shrink-0 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-gray-300 text-sm rounded-full border border-gray-700/50 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-200 hover:scale-105"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escreva sua mensagem..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all duration-200"
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95] hover:shadow-lg hover:shadow-orange-500/25"
          >
            {isTyping ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>

      {/* Modal de Pagamento Pix */}
      {paymentData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-3 max-w-sm w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl shadow-orange-500/10 animate-in slide-in-from-bottom-4 duration-500">
            {/* Security Badge */}
            <div className="flex items-center justify-center mb-2">
              <div className="bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">Pagamento Seguro</span>
              </div>
            </div>
            
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-white mb-1">Pagamento via Pix</h3>
            </div>

            {!showQRCode ? (
              // Chave Pix Copia e Cola
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 mb-3 border border-gray-700/30 shadow-inner cursor-pointer hover:border-orange-500/30 transition-all duration-200" onClick={handleCopyPixCode}>
                <div className="text-center mb-3">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <p className="text-gray-300 text-xs font-medium mb-2">Clique para copiar a chave PIX</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-600/30 hover:bg-gray-800/50 transition-colors duration-200">
                  <p className="text-gray-300 text-xs font-mono leading-relaxed text-center">
                    {paymentData.qr_code ? (
                      <>
                        {paymentData.qr_code.substring(0, 40)}
                        <br />
                        {paymentData.qr_code.substring(40, 80)}
                        <br />
                        {paymentData.qr_code.substring(80, 100)}...
                      </>
                    ) : (
                      'Chave Pix não disponível'
                    )}
                  </p>
                </div>
                
                <p className="text-center text-orange-400 text-xs leading-tight font-medium">
                  👆 Clique aqui para copiar automaticamente
                </p>
              </div>
            ) : (
              // QR Code (quando solicitado)
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-2 mb-3 border border-gray-700/30 shadow-inner">
                <div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center mb-1 overflow-hidden shadow-lg border border-gray-200">
                  {paymentData.qr_code_base64 && paymentData.qr_code_base64.trim() !== '' ? (
                    <img 
                      src={paymentData.qr_code_base64}
                      alt="QR Code Pix"
                      className="w-28 h-28 object-contain"
                      onError={(e) => {
                        console.error('Erro ao carregar QR Code:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <QrCode size={60} className="text-gray-800" />
                      <p className="text-gray-600 text-xs font-medium text-center">QR Code indisponível</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-gray-400 text-xs leading-tight">
                  Escaneie o QR Code com seu app de pagamento
                </p>
              </div>
            )}

            <div className="space-y-2 text-xs">
              {/* X button to close */}
              <button
                onClick={() => {
                  setPaymentData(null);
                  setError(null);
                  setPaymentMessage('');
                  setShowQRCode(false);
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-full transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
              >
                <X size={16} />
              </button>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 mb-2">
                <p className="text-orange-300 text-xs text-center leading-tight">
                  ⚡ Após o pagamento, você receberá acesso imediato
                </p>
              </div>
              
              <button
                onClick={handleCopyPixCode}
               className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25 flex items-center justify-center space-x-2"
              >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
               </svg>
                <span>{paymentData.qr_code ? 'Copiar Chave Pix' : 'Chave Pix Indisponível'}</span>
              </button>
              
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2"
              >
                <QrCode size={14} />
                <span>{showQRCode ? 'Ver Chave Pix' : 'Gerar QR Code'}</span>
              </button>
              
              <button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    <span>Verificar Pagamento</span>
                  </>
                )}
              </button>
              
              {paymentMessage && (
                <div className={`mt-2 p-2 rounded-lg ${
                  paymentMessage.includes('confirmado') 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : paymentMessage.includes('sucesso') 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                }`}>
                  <p className="text-xs leading-tight">{paymentMessage}</p>
                </div>
              )}
              
              <div className="text-center pt-0.5">
                <p className="text-gray-500 text-xs text-center">
                  🔒 Seus dados estão protegidos com criptografia SSL
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-24 left-4 right-4 z-40 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
