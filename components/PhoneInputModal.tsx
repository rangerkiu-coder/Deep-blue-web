import React, { useState } from 'react';
import { Phone, X, Delete } from 'lucide-react';

interface Props {
  onSubmit: (phoneNumber: string) => void;
  onSkip: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PhoneInputModal: React.FC<Props> = ({ onSubmit, onSkip, onCancel, isSubmitting }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const handleNumberClick = (digit: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleSubmit = () => {
    if (phoneNumber.length >= 10) {
      onSubmit(phoneNumber);
    }
  };

  const formatPhoneNumber = (number: string) => {
    if (number.length === 0) return '';
    const cleaned = number.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join('-');
    }
    return number;
  };

  const numberPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0']
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-200/20 rounded-lg shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-200/10 rounded-full flex items-center justify-center">
              <Phone size={24} className="text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">Receive Soft Copy</h2>
              <p className="text-sm text-slate-400">Enter your phone number</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="bg-slate-950 border border-white/10 rounded-lg p-4 text-center min-h-[60px] flex items-center justify-center">
              <span className="text-2xl font-mono text-white tracking-wider">
                {phoneNumber ? formatPhoneNumber(phoneNumber) : 'Enter number'}
              </span>
            </div>
          </div>

          <div className="grid gap-3 mb-6">
            {numberPad.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-3">
                {row.map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleNumberClick(digit)}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-2xl font-semibold py-4 rounded-lg transition-colors active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                {row.length === 1 && (
                  <>
                    <div></div>
                    <div></div>
                  </>
                )}
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3">
              <div></div>
              <button
                onClick={handleBackspace}
                className="bg-slate-800 hover:bg-red-900/50 text-white py-4 rounded-lg transition-colors active:scale-95 flex items-center justify-center"
              >
                <Delete size={24} />
              </button>
              <div></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={phoneNumber.length < 10 || isSubmitting}
              className="w-full bg-amber-200 text-slate-900 py-4 rounded font-serif font-bold tracking-wide hover:bg-white hover:shadow-[0_0_20px_rgba(253,230,138,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? 'Saving...' : 'Save & Send'}
            </button>
            <button
              onClick={onSkip}
              disabled={isSubmitting}
              className="w-full bg-transparent border border-amber-200/30 text-amber-100 py-3 rounded font-serif hover:bg-amber-200/5 transition-colors disabled:opacity-50"
            >
              Skip (Save Only)
            </button>
          </div>

          <p className="text-center text-slate-500 text-xs mt-4">
            We'll send a digital copy to this number
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhoneInputModal;
