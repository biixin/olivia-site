import React, { useState } from 'react';
import { Package, Star, Crown, Zap, Heart, CreditCard, QrCode, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import { createPix, checkPaymentStatus, type PixCreationResponse } from '../services/pushinPayService';

const Packages: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPackageName, setSuccessPackageName] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState<typeof packages[0] | null>(null);

  const packages = [
    {
      id: 1,
      name: 'Pacote Transando',
      price: 9.90,
      originalPrice: 59,
      thumbnail: 'https://dl.dropboxusercontent.com/s/9sw01huaqhwviu38jyxqe/f24.webp?rlkey=4hg282gc65fix1hnmg9hdzeq3&st=4k6h6j4a&dl=0',
      color: 'from-blue-500 to-blue-600',
      popular: false,
      driveLink: 'https://drive.google.com/drive/folders/14sCPkgeOSapJybqCOXlswRCG-QmAYj_3?usp=sharing',
      features: [
        '20 vídeos transando + Brinde',
      ]
    },
    {
      id: 2,
      name: 'Pacote Completo',
      price: 34.90,
      originalPrice: 95,
      thumbnail: 'https://dl.dropboxusercontent.com/s/3nszfj69a1ifnbeatmyyu/f30.webp?rlkey=yp7qd3279hmmu2jp6b1yu5c82&st=92zte9ck&dl=0',
      color: 'from-orange-500 to-orange-600',
      popular: true,
      driveLink: 'https://drive.google.com/drive/folders/1HWjL4A1fwD2H4AphENXkdG9dNdP0pgBM?usp=sharing',
      features: [
        'Minha galeria completa',
        'Uma chamada de vídeo de 10 minutos',
      ]
    }
  ];

  const handlePurchase = async (packageItem: typeof packages[0]) => {
    setIsProcessing(true);
    setError(null);
    setSelectedPackage(packageItem.id);
    setSelectedPackageData(packageItem);

    try {
      const result: PixCreationResponse = await createPix(packageItem.price);

      setPaymentData({
        id: result.id,
        qr_code: result.qr_code,
        qr_code_base64: result.qr_code_base64,
        amount: packageItem.price,
        description: packageItem.name
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
      
      console.log('Resultado da verificação:', result);
      
      if (result.status === 'paid') {
        console.log('Pagamento confirmado!');
        setSuccessPackageName(paymentData.description);
        setShowRedirectMessage(true);
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setPaymentMessage(`❌ ${errorMessage}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRedirect = () => {
    // Encontrar o pacote correspondente pelo nome
    const packageData = packages.find(pkg => pkg.name === successPackageName);
    
    if (packageData?.driveLink) {
      // Redirecionar diretamente para o link do Google Drive
      window.open(packageData.driveLink, '_blank');
    } else {
      // Fallback para WhatsApp caso não encontre o link
      const message = `Olá! Acabei de fazer o pagamento do *${successPackageName}*. Aguardo receber meu conteúdo! 💕`;
      const encodedMessage = encodeURIComponent(message);
      const redirectUrl = `https://api.whatsapp.com/send/?phone=5521975023352&text=${encodedMessage}&type=phone_number&app_absent=0`;
      window.open(redirectUrl, '_blank');
    }
    
    setShowRedirectMessage(false);
    setSelectedPackage(null);
    setSelectedPackageData(null);
  };

  return (
    <div className="pb-20 px-4 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Header com vídeo de prévia */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-64 h-32 mx-auto rounded-2xl shadow-xl shadow-orange-500/20 border border-orange-500/30 object-cover"
            >
              <source src="https://dl.dropboxusercontent.com/s/yiojfettz7tsewbkkc3q5/v4.mp4?rlkey=jnv99e8fmufopx7v0hewzazj1&st=av80e3fo&dl=0" />
            </video>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-white bg-clip-text text-transparent">
            Pacotes Exclusivos
          </h1>
          <p className="text-gray-400 mb-2">Conteúdo bem safadinha só para você</p>
          <div className="flex items-center justify-center space-x-2 text-orange-400">
            <Heart size={16} className="fill-current" />
            <span className="text-sm">Mais de 342 clientes satisfeitos</span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {packages.map((pkg) => {
            return (
              <div
                key={pkg.id}
  className={`relative bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800/50 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/30 ${
    pkg.popular ? 'ring-2 ring-orange-500/20' : ''
  }`}
>
  {pkg.popular && (
    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
        MAIS POPULAR
      </span>
    </div>
                )}

                <div className="p-6">
                  {/* Package Header */}
                  <div className="mb-6">
                    <div className="w-70 h-28 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700/50">
                      <img 
                        src={pkg.thumbnail} 
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Package Name and Features */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-orange-400">R${pkg.price.toFixed(2).replace('.', ',')}</span>
                          <span className="text-sm text-gray-500 line-through">R${pkg.originalPrice.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-0.5"></div>
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing}
                    className={`relative w-full py-4 px-4 bg-gradient-to-r ${pkg.color} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg animate-glow-pulse animate-border-glow`}
                    style={pkg.id === 1 ? {
                      animation: 'glow-pulse-blue 2s ease-in-out infinite, border-glow-blue 2s ease-in-out infinite'
                    } : undefined}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <QrCode size={20} />
                        <span>Comprar Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
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
                    setSelectedPackage(null);
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
                    ⚡ Após o pagamento, você terá acesso imediato aos meus conteúdos safados
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
                  Seu pagamento foi confirmado. Clique no botão abaixo para acessar seu conteúdo no Google Drive.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleRedirect}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Acessar Conteúdo
                  </button>
                  <button
                    onClick={() => {
                      setShowRedirectMessage(false);
                      setSelectedPackage(null);
                      setSelectedPackageData(null);
                    }}
                    className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Packages;
