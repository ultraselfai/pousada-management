"use client";

import { FileUpload } from "@/features/upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadTestPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Teste de Upload</CardTitle>
          <CardDescription>
            Teste o upload de arquivos para o Cloudflare R2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload 
            folder="test"
            onUploadComplete={(file) => {
              console.log("Upload completo:", file);
            }}
            onUploadError={(error) => {
              console.error("Erro no upload:", error);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
