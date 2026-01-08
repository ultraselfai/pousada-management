"use client";

import { AlertCircle, FileQuestion } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormComponentProps } from "../form-registry";

interface DefaultFormProps extends FormComponentProps {
  slug: string;
}

/**
 * Formulário Padrão (Placeholder)
 *
 * Exibido quando o slug do projeto não tem um componente registrado.
 * Útil para desenvolvimento e para informar que o formulário ainda não foi implementado.
 */
export function DefaultForm({ slug }: DefaultFormProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">Formulário em Desenvolvimento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Formulário não configurado</AlertTitle>
          <AlertDescription>
            O formulário com slug <code className="font-mono">{slug}</code> ainda não
            possui um componente registrado no sistema.
          </AlertDescription>
        </Alert>

        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">Para desenvolvedores:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Crie o componente em{" "}
              <code className="font-mono text-xs">
                src/app/(public)/forms/[slug]/components/forms/
              </code>
            </li>
            <li>
              Registre no{" "}
              <code className="font-mono text-xs">form-registry.tsx</code>
            </li>
            <li>Use o slug "{slug}" como chave</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
