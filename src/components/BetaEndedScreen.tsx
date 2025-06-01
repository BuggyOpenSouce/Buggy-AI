import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export function BetaEndedScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-600 to-black-700 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-white p-8"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          
        </motion.div>
        <h1 className="text-4xl font-bold mb-4">Beta testi bitti!</h1>
        <p className="text-xl opacity-90">Desteğiniz için teşekkürler. Sonraki sürümde görüşmek üzere!</p>
      </motion.div>
    </motion.div>
  );
}