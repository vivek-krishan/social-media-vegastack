import { X } from "lucide-react";
import { useRef } from "react";

interface PopUpProps {
  children?: React.ReactNode;
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ children, onClose }) => {
  const modelRef = useRef<HTMLDivElement>(null);

  const closeModel = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (modelRef.current === e.target) {
      onClose();
    }
  };

  return (
    <div
      ref={modelRef}
      onClick={closeModel}
      className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'
    >
      <div className='flex flex-col gap-5 text-white'>
        <div className='place-self-end flex flex-row-reverse gap-5'>
          <button onClick={onClose}>
            <X size={30} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PopUp;
