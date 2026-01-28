import { useState } from 'react';
import { supabase } from '../supabaseClient';

const MediaManager = ({ onUpload }: { onUpload: (url: string) => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload file to the 'avatars' bucket you just created
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL to save to the user's profile
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onUpload(data.publicUrl);

    } catch (error) {
      console.error('Error uploading image: ', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <label className="bg-purple-600 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-purple-500 transition-all">
        {uploading ? 'Uploading...' : 'Choose Profile Photo 📸'}
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
      </label>
    </div>
  );
};

export default MediaManager;