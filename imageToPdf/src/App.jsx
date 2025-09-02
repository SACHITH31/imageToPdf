import { useState } from "react";
import { jsPDF } from "jspdf";
import "./app.css";

export default function App() {
  const [images, setImages] = useState([]);

  // Handle file selection
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Convert to PDF
  const handleConvert = async () => {
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      // Wait for FileReader to finish
      const imgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(img);
      });

      // Add image to PDF
      pdf.addImage(imgData, "JPEG", 10, 10, 190, 0);

      // Add new page if not last image
      if (i < images.length - 1) {
        pdf.addPage();
      }
    }

    pdf.save("images.pdf");
  };

  return (
    <div className="main">
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 imageToPdfConvertHeading">Image to PDF Converter</h1>

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="mb-4"
        />

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="previews mb-4 allSelectedImagesContainer">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                className="preview-image"
              />
            ))}
          </div>
        )}

        {/* Convert Button */}
        <div className="convertToPdfButton">
          <button
            onClick={handleConvert}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Convert to PDF
          </button>
        </div>
      </div>
    </div>
  );
}
