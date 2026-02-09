"use client";
// @ts-check

import Link from "next/link";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  FolderKanban,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ProjectWithCount } from "@/features/projects";

interface ProjectsGridProps {
  projects: ProjectWithCount[];
  tenantId: string;
}

/**
 * Grid de cards de projetos
 */
export function ProjectsGrid({ projects, tenantId }: ProjectsGridProps) {
  const copyFormUrl = (slug: string) => {
    const url = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copiada para a área de transferência!");
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed bg-card p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">Nenhum projeto ainda</p>
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro formulário personalizado clicando no botão acima.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="group relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <CardDescription className="text-xs font-mono">
                  /forms/{project.slug}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Ações</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => copyFormUrl(project.slug)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar URL
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`/forms/${project.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir Formulário
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            {project.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sem descrição
              </p>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <FileText className="h-3 w-3" />
                {project._count.submissions} respostas
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </CardFooter>

          {/* Link overlay para ver respostas */}
          <Link
            href={`/${tenantId}/projects/${project.id}/responses`}
            className="absolute inset-0 z-0"
          >
            <span className="sr-only">Ver respostas de {project.name}</span>
          </Link>
        </Card>
      ))}
    </div>
  );
}
