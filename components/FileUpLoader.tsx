"use client";

import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";

interface FileUploaderProps {
  folder: string; // Ej: 'recetas', 'examenes', 'ordenes'
  onUploadComplete: (url: string) => void;
}

export default function FileUploader({ folder, onUploadComplete }: FileUploaderProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setFileName(file.name);

    try {
      const filePath = `users/${user.uid}/${folder}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      onUploadComplete(downloadUrl);
      setUploading(false);
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setUploading(false);
      alert("Hubo un error al subir el documento.");
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        accept=".pdf,image/*"
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
      >
        <span className="text-sm font-medium text-gray-700">
          {uploading ? `Subiendo ${fileName}...` : "📁 Adjuntar documento (PDF o Imagen)"}
        </span>
        <span className="text-xs text-gray-500">Haz clic para seleccionar archivo</span>
      </label>
    </div>
  );
}