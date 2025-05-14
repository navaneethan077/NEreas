import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Sun,
  Moon,
  Download,
  Eraser,
  Menu,
  X,
} from 'lucide-react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

const sampleImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
    title: 'Sports Car',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=800&q=80',
    title: 'Portrait',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
    title: 'Product',
  },
];

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const removeBackground = async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append('image_file', file);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': import.meta.env.VITE_REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to remove background');
    }

    return await response.blob();
  };

  const processImageFromUrl = async (imageUrl: string) => {
    try {
      setIsProcessing(true);
      setUploadProgress(0);
      setError(null);
      setOriginalImage(imageUrl);

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'sample-image.jpg', { type: 'image/jpeg' });

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const processedBlob = await removeBackground(file);
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      setUploadProgress(100);

      clearInterval(progressInterval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setProcessedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsProcessing(true);
      setUploadProgress(0);
      setError(null);

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          setOriginalImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 500);

        const processedBlob = await removeBackground(file);
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedImage(processedUrl);
        setUploadProgress(100);

        clearInterval(progressInterval);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process image');
        setProcessedImage(null);
      } finally {
        setIsProcessing(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: false,
  });

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">About NErase</h2>
            <p className="mb-4">
              NErase is a powerful background removal tool that uses advanced AI technology
              to automatically remove backgrounds from your images. Whether you're a
              photographer, designer, or e-commerce professional, NErase makes it easy to
              create professional-looking images with transparent backgrounds.
            </p>
            <p>
              Our tool supports various image formats and provides instant results with
              high-quality output. Perfect for product photography, portraits, or any
              image where you need to isolate the subject from its background.
            </p>
          </div>
        );
      case 'contact':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="mb-4">
              Have questions or need support? We're here to help! Reach out to us through
              any of the following channels:
            </p>
            <ul className="list-none space-y-2">
              <li>📧 Email: navaneethansivakumaran@gmail.com
</li>
              <li>💬 Live Chat: Available 24/7</li>
              <li>📱 Phone: +94 76 917 3468</li>
            </ul>
          </div>
        );
      default:
        return (
          <>
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }
                ${
                  isProcessing
                    ? 'pointer-events-none opacity-50'
                    : 'hover:border-blue-500 dark:hover:border-blue-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Processing image... {uploadProgress}%
                    </p>
                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Drag & drop an image here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Supports PNG, JPG, JPEG
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Sample Images */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Try with Sample Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => processImageFromUrl(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium">{image.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

                        {/* Image Preview */}
            {originalImage && processedImage && !isProcessing && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Image Comparison
                </h2>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src={originalImage} alt="Original" />}
                    itemTwo={<ReactCompareSliderImage src={processedImage} alt="Processed" />}
                    style={{ width: '100%', height: '500px' }}
                  />
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={() => {
                      setOriginalImage(null);
                      setProcessedImage(null);
                      setUploadProgress(0);
                      setError(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    <Eraser className="w-4 h-4" /> Reset
                  </button>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">NErase</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="hidden md:flex gap-4">
            <button onClick={() => setActiveSection('home')}>Home</button>
            <button onClick={() => setActiveSection('about')}>About</button>
            <button onClick={() => setActiveSection('contact')}>Contact</button>
          </div>
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col space-y-2 mb-4">
          <button onClick={() => { setActiveSection('home'); setIsMenuOpen(false); }}>Home</button>
          <button onClick={() => { setActiveSection('about'); setIsMenuOpen(false); }}>About</button>
          <button onClick={() => { setActiveSection('contact'); setIsMenuOpen(false); }}>Contact</button>
        </div>
      )}

      {/* Main Content */}
      <main>{renderContent()}</main>
    </div>
  );
}

export default App;
