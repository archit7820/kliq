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
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('activity_images')
        .upload(fileName, file);

      if (error) {
        toast.error('Failed to upload image');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('activity_images')
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
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
            Take or upload a photo of your green activity
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
            placeholder="Describe your green activity..."
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
            Analyze Activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
