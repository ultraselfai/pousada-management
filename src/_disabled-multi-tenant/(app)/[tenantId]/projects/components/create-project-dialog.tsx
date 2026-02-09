"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createProject, createProjectSchema, type CreateProjectInput } from "@/features/projects";

interface CreateProjectDialogProps {
  organizationId: string;
}

/**
 * Dialog para criar novo projeto
 */
export function CreateProjectDialog({ organizationId }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      organizationId,
    },
  });

  // Auto-gerar slug baseado no nome
  const watchName = form.watch("name");
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]+/g, "-") // Substitui caracteres especiais por hífen
      .replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
  };

  async function onSubmit(data: CreateProjectInput) {
    setIsLoading(true);
    try {
      const result = await createProject(data);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao criar projeto");
      }
    } catch {
      toast.error("Erro inesperado ao criar projeto");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um formulário personalizado para seus briefings. O slug será usado na URL pública.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Briefing Website"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-preencher slug se estiver vazio ou igual ao anterior
                        const currentSlug = form.getValues("slug");
                        const expectedSlug = generateSlug(field.value);
                        if (!currentSlug || currentSlug === expectedSlug) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="briefing-website" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL pública: decode.app/forms/<strong>{field.value || "seu-slug"}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o propósito deste formulário..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Projeto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
