"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { SoftButton } from '@/components/ui/SoftButton';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, totalPrice, totalCount, isInitialized } = useCart();
  const router = useRouter();

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isInitialized) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {/* Fondo oscuro (Backdrop) */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel lateral deslizante */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center">
            <span className="mr-2">👜</span>
            Tu Colección ({totalCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido (Lista de ítems o estado vacío) */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <span className="text-4xl opacity-50">🖼️</span>
              </div>
              <p className="text-slate-500 font-medium">Tu colección está vacía</p>
              <SoftButton variant="secondary" onClick={onClose} className="mt-4">
                Explorar Obras
              </SoftButton>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.artwork.id} className="flex bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                  {/* Miniatura */}
                  <div className="w-20 h-24 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                    {/* Placeholder de imagen */}
                    {item.artwork.images && item.artwork.images[0] !== '' && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.artwork.images[0]} alt={item.artwork.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  {/* Detalles */}
                  <div className="ml-4 flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-slate-800 text-sm leading-tight">{item.artwork.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{item.artwork.type === 'original' ? 'Pieza Única' : 'Print'}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.artwork.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center bg-slate-50 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded shadow-sm transition-all"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded shadow-sm transition-all"
                          disabled={item.quantity >= item.artwork.stock}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-slate-800">
                        ${(item.artwork.price * item.quantity).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del Drawer (Totales y Checkout) */}
        {items.length > 0 && (
          <div className="bg-white border-t border-slate-100 p-6 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
            <div className="flex justify-between text-slate-600 mb-2">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">${totalPrice.toLocaleString('en-US')}</span>
            </div>
            <p className="text-xs text-slate-500 text-center mb-4">Impuestos y gastos de envío calculados en el checkout.</p>
            <SoftButton variant="primary" className="w-full" onClick={handleCheckout}>
              Ir a Checkout
            </SoftButton>
          </div>
        )}
      </div>
    </>
  );
};
