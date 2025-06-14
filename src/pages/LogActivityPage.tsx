
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Sparkles, Image as ImageIcon, LoaderCircle, AlertTriangle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useQueryClient } from '@tanstack/react-query';

type AnalysisResult = {
  activity: string;
  carbon_footprint_kg: number;
  explanation: string;
  emoji: string;
};

const LogActivityPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setCaption('');
    }
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const image_b64 = await toBase64(selectedFile);
      const { data, error } = await supabase.functions.invoke('analyze-activity', {
        body: { image_b64, caption },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success('Activity analyzed successfully!');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error('Analysis Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async () => {
    if (!result || !selectedFile || !user) {
      toast.error('Cannot log activity.', { description: 'Missing analysis result, file, or user session.' });
      return;
    }

    setIsLogging(true);

    try {
      // 1. Upload image
      const filePath = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('activity_images')
        .upload(filePath, selectedFile);

      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      
      const { data: { publicUrl } } = supabase.storage
        .from('activity_images')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error('Could not get public URL for the image.');

      // 2. Insert new activity
      const { error: insertError } = await supabase.from('activities').insert({
        user_id: user.id,
        caption,
        activity: result.activity,
        carbon_footprint_kg: result.carbon_footprint_kg,
        explanation: result.explanation,
        emoji: result.emoji,
        image_url: publicUrl,
      });

      if (insertError) throw new Error(`Failed to log activity: ${insertError.message}`);
      
      // 3. Update user's kelp points
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('kelp_points')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw new Error(`Could not fetch profile: ${profileError.message}`);

      const currentPoints = profileData?.kelp_points || 0;
      const newPoints = currentPoints - result.carbon_footprint_kg;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ kelp_points: newPoints })
        .eq('id', user.id);
        
      if (updateError) throw new Error(`Failed to update kelp points: ${updateError.message}`);

      // 4. Invalidate queries to refetch data elsewhere
      await queryClient.invalidateQueries({ queryKey: ['user-activities', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['feed', user.id] });

      toast.success('Activity logged & Kelp Points updated!');
      navigate('/feed');

    } catch (err: any) {
      toast.error('Failed to log activity', { description: err.message });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-green-700 text-center">Log Your Activity</h1>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-6 mb-20">
        <Card className="w-full max-w-lg mx-auto shadow-lg border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Upload className="w-6 h-6" />
              Upload & Analyze
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Selected preview" className="max-h-60 w-auto rounded-lg mb-4 object-contain" />
              ) : (
                <ImageIcon className="w-16 h-16 text-gray-300 mb-2" />
              )}
              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <Button asChild variant="outline">
                <label htmlFor="picture" className="cursor-pointer">
                  {selectedFile ? 'Change Image' : 'Choose Image'}
                </label>
              </Button>
              {selectedFile && <p className="text-sm text-gray-500 mt-2">{selectedFile.name}</p>}
            </div>
            
            {selectedFile && !result && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <label htmlFor="caption" className="font-medium text-gray-700">Add a caption (optional)</label>
                <Textarea
                  id="caption"
                  placeholder="e.g., Cycled 10km to work today instead of driving!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-white"
                  disabled={loading || !!result}
                />
                <p className="text-xs text-gray-500">Adding context helps us calculate the carbon footprint more accurately.</p>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!selectedFile || loading || !!result} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3">
              {loading ? (
                <>
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Carbon Footprint
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="w-full max-w-lg mx-auto bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-4 text-red-700">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h3 className="font-bold">Analysis Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="w-full max-w-lg mx-auto animate-fade-in border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-600">
                <span className="text-4xl">{result.emoji}</span>
                Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Activity</p>
                <p className="text-lg font-semibold">{result.activity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estimated Carbon Footprint</p>
                <p className="text-2xl font-bold text-blue-700">{result.carbon_footprint_kg.toFixed(2)} kg CO₂e</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Explanation</p>
                <p className="text-gray-600 italic">"{result.explanation}"</p>
              </div>
              {caption && (
                  <div>
                      <p className="text-sm font-medium text-gray-500">Your Caption</p>
                      <p className="text-gray-600 italic">"{caption}"</p>
                  </div>
              )}

              <Button onClick={handleLogActivity} disabled={isLogging} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-2">
                {isLogging ? (
                  <>
                    <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Log this Activity
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

      </main>

      <BottomNav />
    </div>
  );
};

export default LogActivityPage;
