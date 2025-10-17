import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [pdfName, setPdfName] = useState("images");
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 50 particles
    const temp = [];
    for (let i = 0; i < 50; i++) {
      temp.push({
        size: Math.random() * 6 + 2, // 2px to 8px
        left: Math.random() * 100, // %
        duration: Math.random() * 20 + 10, // 10s to 30s
        delay: Math.random() * 10 // stagger
      });
    }
    setParticles(temp);
  }, []);

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleDelete = (idxToDelete) => {
    // Filter the images array to remove the file at the specified index
    setImages(currentImages => currentImages.filter((_, idx) => idx !== idxToDelete));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    if (index === draggedIndex) return;

    const reordered = [...images];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setImages(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setLoading(true);

    // Initialize jsPDF with standard A4 settings
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      const imgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(img);
      });

      await new Promise((resolve) => {
        const imgObj = new Image();
        imgObj.src = imgData;
        imgObj.onload = () => {
          // Add 20mm padding (10mm on each side)
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const padding = 10; 
          const availableWidth = pdfWidth - (2 * padding);
          const availableHeight = pdfHeight - (2 * padding);

          let imgWidth = imgObj.width;
          let imgHeight = imgObj.height;

          // Calculate scaling ratio
          const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
          
          let finalImgWidth = imgWidth * ratio;
          let finalImgHeight = imgHeight * ratio;

          // Center the image
          const x = (pdfWidth - finalImgWidth) / 2;
          const y = (pdfHeight - finalImgHeight) / 2;

          // Check image type for addImage
          const imageType = img.type.split('/')[1]?.toUpperCase() || 'JPEG';

          // Add image to PDF
          pdf.addImage(imgData, imageType, x, y, finalImgWidth, finalImgHeight);

          // Add a new page for the next image, unless it's the last one
          if (i < images.length - 1) pdf.addPage();
          resolve();
        };
        imgObj.onerror = () => {
             // Resolve even on error to continue to the next image
            console.error(`Failed to load image: ${img.name}`);
            resolve(); 
        }
      });
    }

    // Save the PDF
    pdf.save(pdfName.replace(/[^a-z0-9]/gi, '_') + ".pdf");
    setLoading(false);
  };

  return (
    <div className="main">
      {/* Floating particles */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="container">
        <h1>Image to PDF Converter</h1>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        <div className="fileNameInput">
          <input
            type="text"
            placeholder="Enter PDF name"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
          />
        </div>

        {images.length > 0 && (
          <div className="previews">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className={`preview-wrapper ${draggedIndex === idx ? "dragging-container" : ""}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(idx, e)}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${idx}`}
                  className={`preview-image ${draggedIndex === idx ? "dragging" : ""}`}
                />
                
                {/* NEW: Delete Button */}
                <button 
                    className="delete-image" 
                    onClick={() => handleDelete(idx)}
                >
                   &#8635; {/* Unicode for a close/delete cross */}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="convertToPdfButtonMain">
          <div className="convertToPdfButton">
            <button onClick={handleConvert} disabled={loading || images.length === 0}>
              {loading ? "Generating PDF..." : "Convert to PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}