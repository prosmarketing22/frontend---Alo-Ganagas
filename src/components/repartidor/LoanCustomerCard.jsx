export const LoanCustomerCard = ({ customer, onRegisterReturn }) => {
  const totalLoans = customer.loans?.length || 0;
  const totalAmount = customer.total_debt || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">
            {customer.full_name}
          </h3>
          <p className="text-sm text-gray-600">
            {customer.phone || 'Sin teléfono'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Balones</div>
          <div className="text-2xl font-bold text-orange-600">{totalLoans}</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-gray-500">📍</span>
          <span className="text-gray-700">
            {customer.address || 'Sin dirección'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">💰</span>
          <span className="font-semibold text-red-600">
            Deuda: S/ {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {customer.loans && customer.loans.length > 0 && (
        <div className="border-t pt-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">Balones prestados:</p>
          <div className="space-y-1">
            {customer.loans.map((loan, idx) => (
              <div key={idx} className="text-sm text-gray-700 flex justify-between items-center">
                <div>
                  <span className="font-medium">{loan.product?.name || 'Producto'}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({new Date(loan.loan_date).toLocaleDateString('es-PE')})
                  </span>
                </div>
                <span className="text-xs text-orange-600 font-medium">
                  S/ {loan.pending_amount?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onRegisterReturn(customer)}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        Registrar Devolución
      </button>
    </div>
  );
};
