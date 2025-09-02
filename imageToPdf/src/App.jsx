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
      const reader = new FileReader();

      reader.onload = function (event) {
        const imgData = event.target.result;

        // Add image to PDF
        pdf.addImage(imgData, "JPEG", 10, 10, 190, 0);

        // Add a new page if not the last image
        if (i < images.length - 1) {
          pdf.addPage();
        }

        // When last image is processed → save PDF
        if (i === images.length - 1) {
          pdf.save("images.pdf");
        }
      };

      reader.readAsDataURL(img);
    }
  };

  return (
    <>
      <div className="main">
        <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Image to PDF Converter</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      <br />

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
    </>

  );
}
