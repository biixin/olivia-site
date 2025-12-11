import React, { useState } from 'react';
import { Video, Clock, Star, Phone, CreditCard, QrCode, Loader, AlertCircle, CheckCircle, X } from 'lucide-react';
import { createPix, checkPaymentStatus, type PixCreationResponse } from '../services/pushinPayService';

interface VideoCallProps {
  onStartCall: (duration: number) => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ onStartCall }) => {
  const [paymentData, setPaymentData] = useState<{
    id: string;
    qr_code: string;
    qr_code_base64: string;
    amount: selectedOption.price,
    duration: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingDuration, setProcessingDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const durations = [
    { minutes: 5, price: 14.90, popular: false },
    { minutes: 10, price: 34.90, popular: true },
  ];

  const handleVideoCall = async (duration: number) => {
    const selectedOption = durations.find(d => d.minutes === duration);
    if (!selectedOption) return;

    setIsProcessing(true);
    setProcessingDuration(duration);
    setError(null);

    try {
      const result: PixCreationResponse = await createPix(selectedOption.price);

      setPaymentData({
        id: result.id,
        qr_code: result.qr_code,
        qr_code_base64: result.qr_code_base64,
        amount: 100,
        duration: duration
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
      setProcessingDuration(null);
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
        // Em vez de mostrar modal de redirecionamento, iniciar a chamada diretamente
        onStartCall(paymentData.duration);
        setPaymentData(null);
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

  const handleRedirect = () => {
    const message = `Olá! Acabei de fazer o pagamento via Pix para vídeo chamada de ${paymentData?.duration} minutos (R$${paymentData?.amount}). Quando podemos conversar?`;
    const encodedMessage = encodeURIComponent(message);
    const redirectUrl = `https://api.whatsapp.com/send/?phone=5521975023352&text=${encodedMessage}&type=phone_number&app_absent=0`;
    
    window.open(redirectUrl, '_blank');
    setShowRedirectMessage(false);
  };

  return (
    <div className="pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          {/* Vídeo de prévia */}
          <div className="mb-6">
            <div className="relative">
              <video
              autoPlay
              muted
              loop
              playsInline
              className="w-64 h-32 mx-auto rounded-2xl shadow-xl shadow-orange-500/20 border border-orange-500/30 object-cover"
            >
              <source src="https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/10/mj-chamadinha.mp4" type="video/mp4" />
            </video>
              
              {/* Ícone de chamada de vídeo centralizado */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-orange-500/90 rounded-full flex items-center justify-center animate-pulse shadow-lg backdrop-blur-sm border-2 border-white/20">
                <Video size={24} className="text-white" />
              </div>
            </div>
          </div>
          
<h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-white bg-clip-text text-transparent">
  Vídeo chamada
</h1>

          <p className="text-gray-400">Vem gozar gostoso comigo 😈</p>
        </div>

        <div className="space-y-4 mb-8">
          {durations.map((duration) => (
            <div
              key={duration.minutes}
              className={`relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
                duration.popular 
                  ? 'border-orange-500/30 ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/10' 
                  : 'border-gray-800/50 hover:border-orange-500/30'
              }`}
            >
              {duration.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                    MAIS POPULAR
                  </span>
                </div>
              )}
              
              {/* Header com imagem e título */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-500/30 flex-shrink-0 shadow-lg">
                  <img 
                    src={duration.minutes === 10 
                      ? "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/10/mj-5min.jpg"
                      : "https://media-wordpress.kjufc9.easypanel.host/wp-content/uploads/2025/10/mj-10min.jpg"
                    }
                    alt={`Prévia ${duration.minutes} min`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock size={18} className="text-orange-500" />
                    <h3 className="text-white font-semibold text-lg">{duration.minutes} minutos - R${duration.price.toFixed(2).replace('.', ',')}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Vídeo chamada ao vivo 🔥</p>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handleVideoCall(duration.minutes)}
                disabled={isProcessing}
                className="w-full py-4 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg animate-glow-pulse animate-border-glow"
              >
                {isProcessing && processingDuration === duration.minutes ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    <span>Pagar Agora</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Modal de Redirecionamento */}
        {showRedirectMessage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 max-w-sm w-full border border-green-700/50 shadow-2xl shadow-green-500/10">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pagamento Confirmado!</h3>
                <p className="text-green-200 text-sm mb-6">
                  Seu pagamento foi confirmado. Você será redirecionado para agendar sua videochamada.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleRedirect}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Ir para WhatsApp
                  </button>
                  <button
                    onClick={() => setShowRedirectMessage(false)}
                    className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <h3 className="text-base font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                  Pagamento via Pix
                </h3>
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
                  
                  {/* Passo a passo compacto */}
                  <div className="mt-3 pt-3 border-t border-gray-700/30">
                    <p className="text-gray-400 text-xs font-medium mb-2 text-center">Como pagar:</p>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-300">
                        <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">1</span>
                        <span>Copie o código acima</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">2</span>
                        <span>Abra seu app do banco</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">3</span>
                        <span>Cole no PIX Copia e Cola</span>
                      </div>
                    </div>
                  </div>
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
                    📞 Após o pagamento, vamos nos divertir muito na chamada
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
                    paymentMessage.includes('sucesso') 
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
      </div>
    </div>
  );
};

export default VideoCall;
