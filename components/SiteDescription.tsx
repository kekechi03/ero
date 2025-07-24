import React, { useEffect, useState } from 'react';

interface SiteDescriptionProps {
  onClose: () => void;
}

const SiteDescription: React.FC<SiteDescriptionProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        border: '1px solid #8d6e63',
        borderRadius: '15px',
        padding: '40px',
        maxWidth: '600px',
        margin: '20px',
        color: '#f5f1eb',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        transition: 'transform 0.3s ease-out',
        fontFamily: 'Georgia, serif',
        letterSpacing: '0.5px'
      }}>
        <div style={{
          fontSize: '1.3rem',
          lineHeight: '1.8',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          <p style={{ marginBottom: '25px' }}>
            あなたは今、この暗がりにひそむ「真実」を解き明かすため、
            エンターテインメントレーティング機構（ERO）の〈鑑定官〉に選ばれました。
          </p>
          <p style={{ marginBottom: '30px' }}>
            轟音と静寂が交錯する廃墟のようなデジタル空間で、
            あなたの一票が世界の「エッチ」と「ノーエッチ」の境界を揺るがします。
          </p>
        </div>
        
        <button
          onClick={handleClose}
          style={{
            background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)',
            color: '#faf8f3',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'Georgia, serif',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
          }}
        >
          鑑定を開始する
        </button>
      </div>
    </div>
  );
};

export default SiteDescription;
