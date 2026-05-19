import { useState } from 'react';
import { BankAccountForm } from './BankAccountForm';

export const BankAccountsConfig = ({ accounts = [], onAdd, onEdit, onDelete, loading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleAdd = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleSubmit = async (formData) => {
    if (editingAccount) {
      if (onEdit) {
        await onEdit(editingAccount.id, formData);
      }
    } else {
      if (onAdd) {
        await onAdd(formData);
      }
    }
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) {
      if (onDelete) {
        await onDelete(id);
      }
    }
  };

  return (
    <div className="bank-accounts-config">
      {!showForm && (
        <div className="bank-accounts-header">
          <h4 className="bank-accounts-title">Cuentas bancarias configuradas</h4>
          <button onClick={handleAdd} className="bank-accounts-add-btn" disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Agregar cuenta
          </button>
        </div>
      )}

      {showForm ? (
        <BankAccountForm
          account={editingAccount}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      ) : (
        <div className="bank-accounts-list">
          {accounts.length === 0 ? (
            <div className="bank-accounts-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>No hay cuentas bancarias configuradas</p>
              <small>Agrega una cuenta para recibir pagos por transferencia</small>
            </div>
          ) : (
            accounts.map(account => (
              <div key={account.id} className="bank-account-item">
                <div className="bank-account-item-header">
                  <div className="bank-account-item-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="bank-account-item-info">
                    <h5 className="bank-account-item-bank">{account.bank_name}</h5>
                    <p className="bank-account-item-type">
                      {account.account_type === 'AHORROS' ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}
                    </p>
                  </div>
                  <div className="bank-account-item-actions">
                    <button
                      onClick={() => handleEdit(account)}
                      className="bank-account-item-btn bank-account-item-btn--edit"
                      disabled={loading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="bank-account-item-btn bank-account-item-btn--delete"
                      disabled={loading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="bank-account-item-details">
                  <div className="bank-account-item-detail">
                    <span className="bank-account-item-detail-label">N° Cuenta:</span>
                    <span className="bank-account-item-detail-value">{account.account_number}</span>
                  </div>
                  <div className="bank-account-item-detail">
                    <span className="bank-account-item-detail-label">CCI:</span>
                    <span className="bank-account-item-detail-value">{account.cci_number || '-'}</span>
                  </div>
                  <div className="bank-account-item-detail">
                    <span className="bank-account-item-detail-label">Titular:</span>
                    <span className="bank-account-item-detail-value">{account.holder_name}</span>
                  </div>
                  <div className="bank-account-item-detail">
                    <span className="bank-account-item-detail-label">DNI:</span>
                    <span className="bank-account-item-detail-value">{account.holder_dni || '-'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
