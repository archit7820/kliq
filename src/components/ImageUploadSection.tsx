import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadSectionProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  caption: string;
  setCaption: (caption: string) => void;
  onAnalyze: () => void;
  disabled: boolean;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imageUrl,
  setImageUrl,
  caption,
  setCaption,
  onAnalyze,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    console.log('handleFileUpload called with file:', file);
    
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('Auth error:', authError);
    
    if (!user) {
      console.log('User not authenticated');
      toast.error('Please log in to upload images');
      return;
    }
    
    if (!file) {
      console.log('No file provided');
      return;
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast.error('File size too large. Please choose a file smaller than 10MB.');
      return;
    }

    let processedFile = file;

    // Check for HEIC files first (they often have empty MIME type)
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      console.log('HEIC file detected');
      toast.error('HEIC files are not supported. Please convert to JPG or PNG first, or use your phone\'s camera to take a new photo in a compatible format.');
      return;
    }

    // Check file type (allow empty type for files that might be images)
    if (processedFile.type && !processedFile.type.startsWith('image/')) {
      console.log('Invalid file type:', processedFile.type);
      toast.error('Please select an image file.');
      return;
    }

    // Loading toast
    console.log('Starting upload process...');
    const loadingToast = toast.loading('Uploading image...');

    try {
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      console.log('Generated filename:', fileName);
      
      console.log('Uploading to Supabase storage...');
      const { data, error } = await supabase.storage
        .from('activity_images')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Upload response:', { data, error });

      if (error) {
        console.error('Upload error:', error);
        toast.dismiss(loadingToast);
        toast.error('Failed to upload image: ' + error.message);
        return;
      }

      console.log('Getting public URL for path:', data.path);
      const { data: { publicUrl } } = supabase.storage
        .from('activity_images')
        .getPublicUrl(data.path);

      console.log('Public URL:', publicUrl);

      if (!publicUrl) {
        console.log('Failed to get public URL');
        toast.dismiss(loadingToast);
        toast.error('Failed to get image URL');
        return;
      }

      console.log('Upload successful, setting image URL:', publicUrl);
      setImageUrl(publicUrl);
      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to upload image');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileSelect called');
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    if (file) {
      handleFileUpload(file);
    } else {
      console.log('No file selected');
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const canAnalyze = imageUrl && !disabled;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label className="text-base font-semibold">Add Photo</Label>
          <p className="text-sm text-muted-foreground">
            Snap or upload a photo of your IRL adventure
          </p>
        </div>

        {imageUrl ? (
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Activity" 
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="caption">Caption (Optional)</Label>
          <Textarea
            id="caption"
            placeholder="Give your IRL adventure a vibe—what did you do?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={disabled}
            rows={3}
          />
        </div>

        {canAnalyze && (
          <Button
            onClick={onAnalyze}
            className="w-full"
            disabled={disabled}
          >
            Get Impact Score
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
