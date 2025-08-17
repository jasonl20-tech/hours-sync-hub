import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Settings } from 'lucide-react';

const TimeTrackingUpload = () => {
  const [isProduction, setIsProduction] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const webhookUrls = {
    test: 'https://xlk.ai/webhook-test/e943802d-4d29-48af-b02d-b3d6f49cce11',
    production: 'https://xlk.ai:5678/webhook/e943802d-4d29-48af-b02d-b3d6f49cce11'
  };

  const uploadToWebhook = async (file: File) => {
    const webhookUrl = isProduction ? webhookUrls.production : webhookUrls.test;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('environment', isProduction ? 'production' : 'test');
      formData.append('timestamp', new Date().toISOString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        toast({
          title: "Upload erfolgreich!",
          description: `Datei wurde an ${isProduction ? 'Production' : 'Test'} Webhook gesendet.`,
          className: "bg-success text-success-foreground",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Upload fehlgeschlagen",
        description: "Es gab einen Fehler beim Senden der Datei.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      uploadToWebhook(file);
    }
  }, [isProduction]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Stundenübersicht Upload
          </h1>
          <p className="text-muted-foreground text-lg">
            Laden Sie Ihre Gesamtstundenübersicht hoch und senden Sie sie an den gewählten Webhook
          </p>
        </div>

        {/* Environment Toggle */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="environment-toggle" className="text-base font-medium">
                  Umgebung
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isProduction ? 'Production Webhook aktiv' : 'Test Webhook aktiv'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Label htmlFor="environment-toggle" className={`text-sm ${!isProduction ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Test
              </Label>
              <Switch
                id="environment-toggle"
                checked={isProduction}
                onCheckedChange={setIsProduction}
              />
              <Label htmlFor="environment-toggle" className={`text-sm ${isProduction ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Production
              </Label>
            </div>
          </div>
        </Card>

        {/* Upload Area */}
        <Card className="p-8">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
              ${isDragActive 
                ? 'border-primary bg-upload-hover' 
                : 'border-upload-border bg-upload-bg hover:bg-upload-hover'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <Upload className={`w-12 h-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragActive ? 'Datei hier ablegen...' : 'Datei hochladen'}
                </h3>
                <p className="text-muted-foreground">
                  Ziehen Sie Ihre Stundenübersicht hier hin oder klicken Sie zum Auswählen
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Unterstützte Formate: Excel (.xlsx, .xls), CSV, PDF
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Upload läuft...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* File Info */}
          {uploadedFile && !isUploading && (
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-accent-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-accent-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          )}
        </Card>

        {/* Webhook Info */}
        <Card className="p-4 mt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Webhook Information</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Aktueller Endpunkt: <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  {isProduction ? webhookUrls.production : webhookUrls.test}
                </code>
              </p>
              <p className="text-xs text-muted-foreground">
                Die Datei wird automatisch nach dem Upload an den gewählten Webhook gesendet.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TimeTrackingUpload;