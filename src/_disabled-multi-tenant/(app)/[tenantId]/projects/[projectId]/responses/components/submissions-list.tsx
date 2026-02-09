"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale/pt-BR";
import { Eye, EyeOff, ChevronDown, ChevronUp, FileText, Palette, Hash, Image as ImageIcon, Type, Sparkles, Ban, Link2, ExternalLink, Trash2, Loader2, ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { markSubmissionAsViewed, deleteSubmission } from "@/features/projects";
import type { Submission } from "@/features/projects";

interface SubmissionsListProps {
  submissions: Submission[];
  formSlug?: string;
}

/**
 * Lista de submissions com visualização expandível
 */
export function SubmissionsList({ submissions: initialSubmissions, formSlug }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  
  const handleDelete = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed bg-card p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nenhuma resposta ainda</p>
            <p className="text-sm text-muted-foreground">
              Compartilhe o link do formulário para começar a receber respostas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard 
          key={submission.id} 
          submission={submission} 
          formSlug={formSlug} 
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

interface SubmissionCardProps {
  submission: Submission;
  formSlug?: string;
  onDelete: (id: string) => void;
}

function SubmissionCard({ submission, formSlug, onDelete }: SubmissionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewed, setViewed] = useState(submission.viewed);
  const [isDeleting, setIsDeleting] = useState(false);

  const data = submission.data as Record<string, unknown>;

  const handleOpen = async (open: boolean) => {
    setIsOpen(open);

    // Marcar como visualizado quando abrir
    if (open && !viewed) {
      await markSubmissionAsViewed(submission.id);
      setViewed(true);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSubmission(submission.id);
      if (result.success) {
        toast.success("Resposta excluída com sucesso!");
        onDelete(submission.id);
      } else {
        toast.error(result.error || "Erro ao excluir resposta");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir resposta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!viewed ? (
                  <Badge variant="default" className="gap-1">
                    <EyeOff className="h-3 w-3" />
                    Nova
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Lida
                  </Badge>
                )}
                <div>
                  <CardTitle className="text-base">
                    {getSubmissionTitle(data)}
                  </CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(submission.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Botão para visualizar no formulário */}
            {formSlug && (
              <div className="mb-4">
                <Button asChild variant="outline" className="w-full gap-2">
                  <a
                    href={`/forms/${formSlug}?submission=${submission.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver no Formulário Original
                  </a>
                </Button>
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-4">
              {/* Timestamp completo */}
              <div className="text-xs text-muted-foreground border-b pb-2 mb-4">
                Recebido em{" "}
                {format(new Date(submission.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </div>

              {/* Dados do formulário */}
              <DataViewer data={data} />
            </div>

            {/* Botão de excluir */}
            <div className="mt-4 pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isDeleting ? "Excluindo..." : "Excluir Resposta"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir resposta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A resposta será permanentemente 
                      excluída do sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sim, excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/**
 * Extrai um título legível dos dados da submission
 */
function getSubmissionTitle(data: Record<string, unknown>): string {
  // Tentar encontrar campos comuns para usar como título
  const titleFields = [
    "companyName",
    "name",
    "company",
    "contactName",
    "email",
    "title",
  ];

  for (const field of titleFields) {
    if (data[field] && typeof data[field] === "string") {
      return data[field] as string;
    }
  }

  return "Resposta sem título";
}

interface DataViewerProps {
  data: Record<string, unknown>;
}

/**
 * Renderiza os dados do briefing de forma visual e organizada
 */
function DataViewer({ data }: DataViewerProps) {
  // Detectar se é um briefing Cilene Nunes
  const isBriefingCilene = 'brandKeywords' in data || 'selectedPalettes' in data;

  if (isBriefingCilene) {
    return <BriefingViewer data={data} />;
  }

  // Fallback para visualização genérica
  const entries = Object.entries(data);
  return (
    <dl className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-3 gap-4">
          <dt className="text-sm font-medium text-muted-foreground capitalize">
            {formatFieldName(key)}
          </dt>
          <dd className="text-sm col-span-2">
            {formatFieldValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Visualizador específico para Briefing DNA da Marca
 */
function BriefingViewer({ data }: { data: Record<string, unknown> }) {
  const brandKeywords = data.brandKeywords as string[] | undefined;
  const customKeywords = data.customKeywords as string[] | undefined;
  const clientConcern = data.clientConcern as string | undefined;
  const clientConcernCustom = data.clientConcernCustom as string | undefined;
  const careerPositioning = data.careerPositioning as string | undefined;
  const selectedPalettes = data.selectedPalettes as Array<{ name?: string; description?: string; colors?: string[] }> | undefined;
  const elementsRanking = data.elementsRanking as Array<{ label?: string; icon?: string; role?: string }> | undefined;
  const absoluteNo = data.absoluteNo as string | undefined;
  const extraBrandReferences = data.extraBrandReferences as string | undefined;
  const uploadedFiles = data.uploadedFiles as Array<{
    name: string;
    publicUrl: string;
    key: string;
    size: number;
    type: string;
  }> | undefined;
  const submittedAt = data.submittedAt as string | undefined;

  return (
    <div className="space-y-6">
      {/* DNA da Marca */}
      {(brandKeywords?.length || customKeywords?.length) && (
        <Section icon={<Sparkles className="h-4 w-4" />} title="DNA da Marca">
          <div className="flex flex-wrap gap-2">
            {brandKeywords?.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-sm">
                {keyword}
              </Badge>
            ))}
            {customKeywords?.map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-sm">
                {keyword}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {/* Perfil do Cliente */}
      {(clientConcern || clientConcernCustom) && (
        <Section icon={<Hash className="h-4 w-4" />} title="Perfil do Cliente">
          <p className="text-sm">
            {clientConcernCustom || formatConcernLabel(clientConcern)}
          </p>
        </Section>
      )}

      {/* Posicionamento de Carreira */}
      {careerPositioning && (
        <Section icon={<Type className="h-4 w-4" />} title="Posicionamento">
          <p className="text-sm">{formatPositioningLabel(careerPositioning)}</p>
        </Section>
      )}

      {/* Paleta de Cores */}
      {selectedPalettes && selectedPalettes.length > 0 && (
        <Section icon={<Palette className="h-4 w-4" />} title="Paletas de Cores">
          <div className="space-y-4">
            {selectedPalettes.map((palette, paletteIndex) => (
              <div key={paletteIndex} className="space-y-2">
                <p className="text-sm font-medium">{palette.name}</p>
                <p className="text-xs text-muted-foreground">{palette.description}</p>
                <div className="flex gap-2 mt-2">
                  {palette.colors?.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-md shadow-sm border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Ranking de Elementos */}
      {elementsRanking?.length ? (
        <Section icon={<ImageIcon className="h-4 w-4" />} title="Hierarquia de Elementos">
          <div className="space-y-2">
            {elementsRanking.map((el, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-lg">{el.icon}</span>
                <span className="text-sm">{el.label}</span>
                <Badge variant={i === 0 ? "default" : i < 3 ? "secondary" : "destructive"} className="ml-auto text-xs">
                  {el.role}
                </Badge>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* O "Não" Absoluto */}
      {absoluteNo && (
        <Section icon={<Ban className="h-4 w-4" />} title='O "Não" Absoluto'>
          <p className="text-sm italic">&quot;{absoluteNo}&quot;</p>
        </Section>
      )}

      {/* Referências Extras */}
      {extraBrandReferences && (
        <Section icon={<Link2 className="h-4 w-4" />} title="Referências Extras">
          <p className="text-sm">{extraBrandReferences}</p>
        </Section>
      )}

      {/* Imagens Enviadas */}
      {uploadedFiles && uploadedFiles.length > 0 && (
        <Section icon={<ImagePlus className="h-4 w-4" />} title="Referências Visuais Enviadas">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {uploadedFiles.map((file, index) => (
              <a
                key={file.key || index}
                href={file.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border hover:ring-2 hover:ring-primary transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.publicUrl}
                  alt={file.name || `Referência ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Timestamp */}
      {submittedAt && (
        <div className="pt-4 border-t text-xs text-muted-foreground">
          Enviado em {format(new Date(submittedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function formatConcernLabel(id: string | undefined): string {
  const map: Record<string, string> = {
    diagnostico: "O Diagnóstico - Pais angustiados que querem entender o que o filho tem",
    desempenho: "O Desempenho Escolar - Pais preocupados com notas e alfabetização",
    comportamento: "O Comportamento/Emoção - Pais que buscam acolhimento e inteligência emocional",
  };
  return id ? map[id] || id : "";
}

function formatPositioningLabel(id: string | undefined): string {
  const map: Record<string, string> = {
    destacar: "Quero destacar muito minha experiência como professora (Posicionamento Prático)",
    neutra: "Quero ser neutra - focar na nova identidade clínica (Posicionamento Clínico)",
    distanciar: "Quero me distanciar - ser vista como Doutora/Terapeuta (Posicionamento de Autoridade)",
  };
  return id ? map[id] || id : "";
}

/**
 * Formata nome do campo para exibição
 */
function formatFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1") // Adiciona espaço antes de maiúsculas
    .replace(/^./, (str) => str.toUpperCase()) // Primeira letra maiúscula
    .trim();
}

/**
 * Formata valor do campo para exibição
 */
function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (Array.isArray(value)) {
    // Se for array de strings, join normal
    if (value.every(item => typeof item === 'string')) {
      return value.join(", ");
    }
    // Se for array de objetos, formatar como JSON legível
    return JSON.stringify(value, null, 2);
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}
