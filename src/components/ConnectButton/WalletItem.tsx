import React from 'react';

export const WalletItem: React.FC<{
  id: string;
  name: string;
  icon?: string;
  onClick?: (id: string) => void;
  disabled?: boolean;
  selected?: boolean;
}> = ({ id, name, icon, onClick, disabled, selected }) => {
  return (
    <button
      onClick={() => onClick && !disabled && onClick(id)}
      disabled={disabled}
      className={`
        flex items-center w-full p-3 rounded-xl transition-all duration-200 text-left group
        ${selected
          ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
          : disabled
            ? 'border border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            : 'border border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md'
        }
      `}
    >
      <div className="w-10 h-10 mr-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-1.5 shadow-sm group-hover:shadow transition-shadow">
        {icon ? (
          <img src={icon} alt={`${name} logo`} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-md" />
        )}
      </div>
      <span className={`font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
        {name}
      </span>
      {selected && (
        <svg className="w-5 h-5 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

export default WalletItem;