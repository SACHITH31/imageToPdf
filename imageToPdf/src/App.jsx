import { useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Handle drag start
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // Handle drag over for reordering
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

  // Handle drag end → remove dragging class
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Convert to PDF
  const handleConvert = async () => {
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setLoading(true);

    const pdf = new jsPDF();

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
          const pageWidth = pdf.internal.pageSize.getWidth() - 20;
          const pageHeight = pdf.internal.pageSize.getHeight() - 20;

          let imgWidth = imgObj.width;
          let imgHeight = imgObj.height;

          const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
          imgWidth *= ratio;
          imgHeight *= ratio;

          const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
          const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;

          pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);

          if (i < images.length - 1) pdf.addPage();
          resolve();
        };
      });
    }

    pdf.save("images.pdf");
    setLoading(false);
  };

  return (
    <div className="main">
      <div className="p-6 text-center">
        <h1 className="imageToPdfConvertHeading">Image to PDF Converter</h1>

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="previews allSelectedImagesContainer">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                className={`preview-image ${draggedIndex === idx ? "dragging" : ""}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(idx, e)}
                onDragEnd={handleDragEnd}  // ← FIX: remove dragging class after drop
              />
            ))}
          </div>
        )}

        {/* Convert Button */}
        <div className="convertToPdfButton">
          <button onClick={handleConvert} disabled={loading}>
            {loading ? "Generating PDF..." : "Convert to PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
