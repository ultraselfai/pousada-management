"use client";
// @ts-check

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { submitForm } from "@/features/projects";
import type { FormComponentProps } from "../form-registry";

/**
 * Schema de validação do Briefing Website
 */
const briefingWebsiteSchema = z.object({
  // Informações do Cliente
  companyName: z.string().min(2, { error: "Nome da empresa é obrigatório" }),
  contactName: z.string().min(2, { error: "Nome do contato é obrigatório" }),
  contactEmail: z.string().email({ error: "Email inválido" }),
  contactPhone: z.string().optional(),

  // Sobre o Projeto
  projectType: z.enum(["landing", "institucional", "ecommerce", "webapp", "outro"]),
  projectDescription: z.string().min(10, { error: "Descreva seu projeto em pelo menos 10 caracteres" }),
  targetAudience: z.string().min(5, { error: "Descreva seu público-alvo" }),

  // Referências
  competitors: z.string().optional(),
  references: z.string().optional(),
  
  // Requisitos
  hasLogo: z.boolean().default(false),
  hasContent: z.boolean().default(false),
  hasBranding: z.boolean().default(false),
  
  // Prazo e Orçamento
  deadline: z.enum(["urgent", "1month", "2months", "3months", "flexible"]),
  budget: z.enum(["5k", "10k", "20k", "50k", "discuss"]),
  
  // Observações
  additionalNotes: z.string().optional(),
});

type BriefingWebsiteData = z.infer<typeof briefingWebsiteSchema>;

/**
 * Formulário de Briefing para Website
 *
 * Coleta informações detalhadas para projetos de desenvolvimento web.
 */
export function BriefingWebsiteForm({ projectId }: FormComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(briefingWebsiteSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      projectType: "institucional" as const,
      projectDescription: "",
      targetAudience: "",
      competitors: "",
      references: "",
      hasLogo: false,
      hasContent: false,
      hasBranding: false,
      deadline: "flexible" as const,
      budget: "discuss" as const,
      additionalNotes: "",
    },
  });

  async function onSubmit(data: BriefingWebsiteData) {
    setIsSubmitting(true);
    try {
      const result = await submitForm({
        projectId,
        data,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        form.setError("root", { message: result.error });
      }
    } catch {
      form.setError("root", { message: "Erro ao enviar formulário" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Tela de sucesso
  if (isSuccess) {
    return (
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Briefing Enviado!</h2>
          <p className="text-muted-foreground">
            Obrigado por preencher o briefing. Entraremos em contato em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>
              Como podemos entrar em contato com você?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Sua Empresa Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="joao@empresa.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sobre o Projeto */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Projeto</CardTitle>
            <CardDescription>
              Conte-nos mais sobre o que você precisa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Projeto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="institucional">
                        Site Institucional
                      </SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="webapp">Aplicação Web</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Projeto</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva seu projeto, objetivos e funcionalidades desejadas..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Público-Alvo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Quem são seus clientes? Idade, interesses, comportamentos..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Referências */}
        <Card>
          <CardHeader>
            <CardTitle>Referências</CardTitle>
            <CardDescription>
              Sites que você gosta ou concorrentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="competitors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concorrentes (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste URLs de sites concorrentes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="references"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sites de Referência (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste URLs de sites que você gosta do visual ou funcionalidade..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Materiais Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais Disponíveis</CardTitle>
            <CardDescription>
              O que você já tem pronto?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hasLogo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tenho logotipo</FormLabel>
                    <FormDescription>
                      Logo em formato vetorial (SVG, AI, EPS)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasBranding"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tenho manual de marca</FormLabel>
                    <FormDescription>
                      Cores, tipografia e guidelines definidos
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasContent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tenho textos e imagens</FormLabel>
                    <FormDescription>
                      Conteúdo pronto para o site
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Prazo e Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle>Prazo e Investimento</CardTitle>
            <CardDescription>
              Quando você precisa e qual seu orçamento?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo Desejado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o prazo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="urgent">Urgente (até 2 semanas)</SelectItem>
                      <SelectItem value="1month">1 mês</SelectItem>
                      <SelectItem value="2months">2 meses</SelectItem>
                      <SelectItem value="3months">3 meses</SelectItem>
                      <SelectItem value="flexible">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa de Investimento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5k">Até R$ 5.000</SelectItem>
                      <SelectItem value="10k">R$ 5.000 - R$ 10.000</SelectItem>
                      <SelectItem value="20k">R$ 10.000 - R$ 20.000</SelectItem>
                      <SelectItem value="50k">R$ 20.000 - R$ 50.000</SelectItem>
                      <SelectItem value="discuss">Acima de R$ 50.000</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações Adicionais</CardTitle>
            <CardDescription>
              Algo mais que devemos saber?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais, dúvidas, requisitos especiais..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Erro geral */}
        {form.formState.errors.root && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar Briefing
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
