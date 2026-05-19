import { useEffect, useState } from 'react';
import { usePaymentMethodConfigApi } from '../../hooks/useApi/usePaymentMethodConfigApi';
import { PaymentMethodCard, MobileWalletConfig, BankAccountsConfig } from '../../components/paymentMethods';
import '../../styles/components/paymentMethods.css';

// Mapeo de tipos a nombres para mostrar
const METHOD_DISPLAY_NAMES = {
  'YAPE': 'Yape',
  'PLIN': 'Plin',
  'TRANSFERENCIA': 'Transferencia Bancaria',
  'VALE_FISE': 'Vale FISE'
};

export const PaymentMethodsPage = () => {
  const {
    data: methods,
    loading,
    error,
    fetchAll,
    toggleActive,
    updateMobileWallet,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    uploadQrImage
  } = usePaymentMethodConfigApi();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      await fetchAll();
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const handleToggle = async (method, active) => {
    try {
      await toggleActive(method.id, active);
    } catch (err) {
      console.error('Error toggling payment method:', err);
    }
  };

  const handleUpdateMobileWallet = async (method, data) => {
    try {
      await updateMobileWallet(method.id, {
        phone_number: data.phone_number,
        holder_name: data.holder_name
      });
      alert('Configuración actualizada correctamente');
    } catch (err) {
      console.error('Error updating mobile wallet:', err);
      alert('Error al actualizar la configuración');
    }
  };

  const handleUploadQr = async (method, file) => {
    try {
      await uploadQrImage(method.id, file);
      alert('Imagen QR actualizada correctamente');
    } catch (err) {
      console.error('Error uploading QR:', err);
      alert('Error al subir la imagen');
    }
  };

  const handleAddBankAccount = async (transferMethod, accountData) => {
    try {
      await createBankAccount(transferMethod.id, accountData);
      await loadPaymentMethods();
      alert('Cuenta bancaria agregada correctamente');
    } catch (err) {
      console.error('Error adding bank account:', err);
      alert('Error al agregar la cuenta bancaria');
    }
  };

  const handleEditBankAccount = async (id, accountData) => {
    try {
      await updateBankAccount(id, accountData);
      await loadPaymentMethods();
      alert('Cuenta bancaria actualizada correctamente');
    } catch (err) {
      console.error('Error updating bank account:', err);
      alert('Error al actualizar la cuenta bancaria');
    }
  };

  const handleDeleteBankAccount = async (id) => {
    try {
      await deleteBankAccount(id);
      await loadPaymentMethods();
      alert('Cuenta bancaria eliminada correctamente');
    } catch (err) {
      console.error('Error deleting bank account:', err);
      alert('Error al eliminar la cuenta bancaria');
    }
  };

  // Buscar método por tipo (usa method_type del backend)
  const getMethodByType = (type) => {
    return methods.find(m => m.method_type === type);
  };

  const yapeMethod = getMethodByType('YAPE');
  const plinMethod = getMethodByType('PLIN');
  const transferMethod = getMethodByType('TRANSFERENCIA');
  const fiseMethod = getMethodByType('VALE_FISE');

  return (
    <div className="payment-methods-page">
      <div className="payment-methods-container">
        <div className="payment-methods-header">
          <div className="payment-methods-header-left">
            <h1 className="payment-methods-title">
              <div className="payment-methods-title-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10H21M7 15H8M12 15H13M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Configuración de Métodos de Pago
            </h1>
            <p className="payment-methods-subtitle">
              Configura los métodos de pago disponibles para tus clientes
            </p>
          </div>
        </div>

        {error && (
          <div className="payment-methods-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading && methods.length === 0 ? (
          <div className="payment-methods-loading">
            <div className="payment-methods-loading-spinner"></div>
            <p className="payment-methods-loading-text">Cargando métodos de pago...</p>
          </div>
        ) : (
          <div className="payment-methods-grid">
            {yapeMethod && (
              <PaymentMethodCard
                method={yapeMethod}
                displayName={METHOD_DISPLAY_NAMES[yapeMethod.method_type]}
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                color="linear-gradient(135deg, #722C8C 0%, #4A1A5C 100%)"
                onToggle={(active) => handleToggle(yapeMethod, active)}
                loading={loading}
              >
                <MobileWalletConfig
                  method={yapeMethod}
                  onUpdate={(data) => handleUpdateMobileWallet(yapeMethod, data)}
                  onUploadQr={(file) => handleUploadQr(yapeMethod, file)}
                  loading={loading}
                />
              </PaymentMethodCard>
            )}

            {plinMethod && (
              <PaymentMethodCard
                method={plinMethod}
                displayName={METHOD_DISPLAY_NAMES[plinMethod.method_type]}
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                color="linear-gradient(135deg, #00D4AA 0%, #00A68A 100%)"
                onToggle={(active) => handleToggle(plinMethod, active)}
                loading={loading}
              >
                <MobileWalletConfig
                  method={plinMethod}
                  onUpdate={(data) => handleUpdateMobileWallet(plinMethod, data)}
                  onUploadQr={(file) => handleUploadQr(plinMethod, file)}
                  loading={loading}
                />
              </PaymentMethodCard>
            )}

            {transferMethod && (
              <PaymentMethodCard
                method={transferMethod}
                displayName={METHOD_DISPLAY_NAMES[transferMethod.method_type]}
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                color="linear-gradient(135deg, #1E8CFF 0%, #0050FF 100%)"
                onToggle={(active) => handleToggle(transferMethod, active)}
                loading={loading}
              >
                <BankAccountsConfig
                  accounts={transferMethod.bank_accounts || []}
                  onAdd={(data) => handleAddBankAccount(transferMethod, data)}
                  onEdit={handleEditBankAccount}
                  onDelete={handleDeleteBankAccount}
                  loading={loading}
                />
              </PaymentMethodCard>
            )}

            {fiseMethod && (
              <PaymentMethodCard
                method={fiseMethod}
                displayName={METHOD_DISPLAY_NAMES[fiseMethod.method_type]}
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                color="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                onToggle={(active) => handleToggle(fiseMethod, active)}
                loading={loading}
              >
                <div className="payment-method-fise-info">
                  <p className="payment-method-fise-text">
                    Los vales FISE están habilitados. Los clientes podrán seleccionar este método de pago al realizar sus pedidos.
                  </p>
                </div>
              </PaymentMethodCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
