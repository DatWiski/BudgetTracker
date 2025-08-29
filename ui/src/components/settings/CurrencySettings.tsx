import { useCurrency } from '../../hooks/useCurrency';
import { SUPPORTED_CURRENCIES } from '../../constants/currencies';

export const CurrencySettings = () => {
  const { currency, updateCurrency, isUpdating } = useCurrency();

  const handleCurrencyChange = (newCurrency: string) => {
    updateCurrency(newCurrency);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Settings</h3>
      
      <div className="space-y-3">
        {SUPPORTED_CURRENCIES.map((curr) => (
          <label key={curr.code} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="currency"
              value={curr.code}
              checked={currency === curr.code}
              onChange={() => handleCurrencyChange(curr.code)}
              disabled={isUpdating}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-700">
                {curr.name} ({curr.symbol})
              </div>
              <div className="text-xs text-gray-500">{curr.code}</div>
            </div>
          </label>
        ))}
      </div>
      
      {isUpdating && (
        <div className="mt-3 text-sm text-gray-500">
          Updating currency...
        </div>
      )}
    </div>
  );
};