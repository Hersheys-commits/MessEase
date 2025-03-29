import React, { useState,useRef, use } from 'react';
import api from '../../utils/axiosRequest';
import { useParams } from 'react-router-dom';

const MessComplaints = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const complaintsCategories = [
    'Food Quality',
    'Service',
    'Menu Concerns',
    'Hostel'
  ];
  
  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Filter out duplicates by name and size
    setImages(prevImages => {
      const updatedImages = [...prevImages];
      
      newFiles.forEach(newFile => {
        const isDuplicate = prevImages.some(
          existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size
        );
        
        if (!isDuplicate) {
          updatedImages.push(newFile);
        }
      });
      
      return updatedImages;
    });
    
    // Reset the input value to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Debug logging
    console.log('Submitting with:', { description, category, images });

    // Create FormData to handle file uploads
    const formData = new FormData();
    
    // Ensure values are being added correctly
    if (description) formData.append('description', description);
    if (category) formData.append('category', category);
    
    // Append images
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: `, value);
    }

    try {
      const response = await api.post('/api/complaint/createcomplaint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Reset form on successful submission
      setDescription('');
      setCategory('');
      setImages([]);
      setSuccess(response.data.message || 'Complaint submitted successfully');
    } catch (err) {
      console.error('Submission error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };
  const code=useParams();
  return (
    <div className="bg-[#0A0A1A] min-h-screen p-6">
      <div className="max-w-md mx-auto bg-[#1A1A2E] shadow-2xl rounded-lg border border-[#2A2A4A] p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Mess Complaints
        </h2>

        

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-gray-300 mb-2 block">Complaint Category</p>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-[#0A0A1A] border border-[#2A2A4A] text-white p-2 rounded"
            >
              <option value="">Select Category</option>
              {complaintsCategories.map((cat) => (
                <option 
                  key={cat} 
                  value={cat}
                  className="bg-[#1A1A2E] text-white"
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-gray-300 mb-2 block">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your complaint in detail"
              className="w-full min-h-[120px] bg-[#0A0A1A] border border-[#2A2A4A] text-white placeholder-gray-500 p-2 rounded"
              required
            />
          </div>

          <div>
            <p className="text-gray-300 mb-2 block">Upload Images (Optional)</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-[#0A0A1A] border border-[#2A2A4A] text-white p-2 rounded
                file:mr-4 file:py-2 file:px-4 
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-700 file:text-white
                hover:file:bg-purple-600"
            />
            {images.length > 0 && (
  <div className="mt-4">
    <p className="text-gray-300 mb-2">Selected Images:</p>
    <div className="grid grid-cols-3 gap-2">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <img
            src={URL.createObjectURL(image)}
            alt={`Preview ${index + 1}`}
            className="w-full h-24 object-cover rounded border border-gray-600"
          />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>
)}
          </div>

          <button 
            type="submit" 
            disabled={!category || !description || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessComplaints;