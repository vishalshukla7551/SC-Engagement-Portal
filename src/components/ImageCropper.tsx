
import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
}

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Scroll lock removed to fix scrolling issues reported by user
    // The overlay is fixed position with high z-index, so it should be fine.

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onRotationChange = (rotation: number) => {
        setRotation(rotation);
    };

    const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
            alert('Something went wrong while cropping the image');
        }
    };

    const content = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 p-2 -ml-2">
                        <span className="text-sm font-medium">Cancel</span>
                    </button>
                    <h3 className="font-bold text-gray-800">Adjust Photo</h3>
                    <button
                        onClick={handleSave}
                        className="text-rose-600 hover:text-rose-700 font-bold text-sm px-3 py-1.5 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                        Set
                    </button>
                </div>

                <div className="relative w-full aspect-square bg-gray-900 shrink-0">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1} // Square aspect ratio for profile
                        onCropChange={onCropChange}
                        onRotationChange={onRotationChange}
                        onCropComplete={onCropCompleteCallback}
                        onZoomChange={onZoomChange}
                        cropShape="round" // Hint round shape for user
                        showGrid={false}
                    />
                </div>

                <div className="p-4 space-y-6 overflow-y-auto">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Zoom</label>
                            <span className="text-xs font-medium text-gray-700">{zoom.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rotation</label>
                            <span className="text-xs font-medium text-gray-700">{rotation}°</span>
                        </div>
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;

    return ReactDOM.createPortal(content, document.body);
};

export default ImageCropper;
