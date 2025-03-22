import { useState } from 'react';

export const useToggleDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDialog = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    toggleDialog,
  };
};
