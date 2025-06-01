// Update the fullscreen state in ChatMessage component
const [scale, setScale] = useState(1);

// ... existing code ...

{isFullscreen && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/30 backdrop-blur-md z-50"
    onClick={toggleFullscreen}
  >
    <motion.div
      className="absolute inset-4 bg-transparent rounded-xl shadow-2xl overflow-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
      style={{ 
        x,
        y,
        scale,
        cursor: 'move',
        touchAction: 'none'
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onWheel={handleWheel}
      onTouchStart={handleTouchGesture}
      onTouchMove={handleTouchGesture}
      onTouchEnd={handleTouchEnd}
    >
      <div className="sticky top-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setScale(Math.min(3, scale + 0.1))}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
      
      {/* ... rest of the fullscreen content ... */}
    </motion.div>
  </motion.div>
)}