import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
}

export const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, recipientName = "Dr. Vance" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-black"
        >
          <MaterialIcon icon="close" />
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#1e3250]/10 rounded-full flex items-center justify-center text-[#1e3250]">
            <MaterialIcon icon="chat" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-bold">New Message</h2>
            <p className="text-sm text-gray-500">To: {recipientName}</p>
          </div>
        </div>
        <textarea 
          className="w-full h-32 border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:border-[#1e3250] mb-6" 
          placeholder="Type your message here..."
        />
        <button 
          onClick={onClose} 
          className="w-full bg-[#1e3250] text-white py-3 rounded-xl font-bold hover:bg-[#061d3a] transition-colors"
        >
          Send Message
        </button>
      </div>
    </div>
  );
};
