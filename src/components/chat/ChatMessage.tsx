// Update the fullscreen functionality in ChatMessage component
const [isFullscreen, setIsFullscreen] = useState(false);

const toggleFullscreen = () => {
  setIsFullscreen(!isFullscreen);
  if (!isFullscreen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Add PDF download functionality
const handleDownloadPDF = async () => {
  try {
    const element = document.createElement('div');
    element.innerHTML = message.content;
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save('message.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};